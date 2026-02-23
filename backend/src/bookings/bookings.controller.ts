import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  ExtendBookingDto,
  CheckAvailabilityDto,
} from './dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../entities';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: "List user's bookings" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.findAllForUser(userId, page || 1, limit || 20);
  }

  @Post()
  @ApiOperation({ summary: 'Create new booking' })
  create(@Body() dto: CreateBookingDto, @CurrentUser('id') userId: string) {
    return this.bookingsService.create(dto, userId);
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'Check slot availability' })
  checkAvailability(@Query() dto: CheckAvailabilityDto) {
    return this.bookingsService.checkAvailability(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get booking history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookingsService.getHistory(userId, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.update(id, dto, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.cancel(id, userId);
  }

  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Get QR code for entry' })
  getQrCode(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.getQrCode(id, userId);
  }

  @Post(':id/verify')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Verify QR code at entry/exit' })
  verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('qrCode') qrCode: string,
  ) {
    return this.bookingsService.verifyQrCode(id, qrCode);
  }

  @Post(':id/extend')
  @ApiOperation({ summary: 'Extend booking duration' })
  extend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExtendBookingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.extend(id, dto, userId);
  }
}
