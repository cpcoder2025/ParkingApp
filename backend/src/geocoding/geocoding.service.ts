import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId?: string;
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly googleApiKey: string | undefined;

  constructor(private config: ConfigService) {
    this.googleApiKey = this.config.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.googleApiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY not set — falling back to Nominatim (rate-limited)',
      );
    }
  }

  async geocode(address: string): Promise<GeocodingResult> {
    if (this.googleApiKey) {
      return this.geocodeGoogle(address);
    }
    return this.geocodeNominatim(address);
  }

  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<ReverseGeocodingResult> {
    if (this.googleApiKey) {
      return this.reverseGeocodeGoogle(lat, lng);
    }
    return this.reverseGeocodeNominatim(lat, lng);
  }

  // ── Google Maps ──────────────────────────────────────────────

  private async geocodeGoogle(address: string): Promise<GeocodingResult> {
    const url = new URL(
      'https://maps.googleapis.com/maps/api/geocode/json',
    );
    url.searchParams.set('address', address);
    url.searchParams.set('key', this.googleApiKey!);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
      throw new BadRequestException(
        `Geocoding failed for "${address}": ${data.status}`,
      );
    }

    const result = data.results[0];
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  }

  private async reverseGeocodeGoogle(
    lat: number,
    lng: number,
  ): Promise<ReverseGeocodingResult> {
    const url = new URL(
      'https://maps.googleapis.com/maps/api/geocode/json',
    );
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('key', this.googleApiKey!);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
      throw new BadRequestException(
        `Reverse geocoding failed: ${data.status}`,
      );
    }

    const result = data.results[0];
    const components = this.parseGoogleComponents(
      result.address_components,
    );

    return {
      formattedAddress: result.formatted_address,
      ...components,
    };
  }

  private parseGoogleComponents(
    components: Array<{ long_name: string; types: string[] }>,
  ) {
    const get = (type: string) =>
      components.find((c) => c.types.includes(type))?.long_name;
    return {
      street: [get('street_number'), get('route')].filter(Boolean).join(' ') || undefined,
      city: get('locality') || get('sublocality'),
      state: get('administrative_area_level_1'),
      country: get('country'),
      postalCode: get('postal_code'),
    };
  }

  // ── Nominatim (free fallback) ────────────────────────────────

  private async geocodeNominatim(address: string): Promise<GeocodingResult> {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ParkingApp/1.0' },
    });
    const data = await res.json();

    if (!data?.length) {
      throw new BadRequestException(
        `Geocoding failed — no results for "${address}"`,
      );
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name,
    };
  }

  private async reverseGeocodeNominatim(
    lat: number,
    lng: number,
  ): Promise<ReverseGeocodingResult> {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ParkingApp/1.0' },
    });
    const data = await res.json();

    if (data.error) {
      throw new BadRequestException(
        `Reverse geocoding failed: ${data.error}`,
      );
    }

    const addr = data.address || {};
    return {
      formattedAddress: data.display_name,
      street: [addr.house_number, addr.road].filter(Boolean).join(' ') || undefined,
      city: addr.city || addr.town || addr.village,
      state: addr.state,
      country: addr.country,
      postalCode: addr.postcode,
    };
  }
}
