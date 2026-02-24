import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GeocodingService } from './geocoding.service';
import { GeocodeDto, ReverseGeocodeDto } from './dto';

@ApiTags('Geocoding')
@Controller('api/geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('geocode')
  @ApiOperation({
    summary: 'Convert address to coordinates',
    description: 'Forward geocoding — returns lat/lng for a given address string',
  })
  geocode(@Query() dto: GeocodeDto) {
    return this.geocodingService.geocode(dto.address);
  }

  @Get('reverse')
  @ApiOperation({
    summary: 'Convert coordinates to address',
    description: 'Reverse geocoding — returns a structured address for a given lat/lng',
  })
  reverseGeocode(@Query() dto: ReverseGeocodeDto) {
    return this.geocodingService.reverseGeocode(dto.latitude, dto.longitude);
  }
}
