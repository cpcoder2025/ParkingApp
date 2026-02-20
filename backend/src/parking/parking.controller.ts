/*
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import {
  CreateParkingDto,
  UpdateParkingDto,
  NearbySearchDto,
  UpdateOccupancyDto,
  UpdatePricingDto,
} from './dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../entities';

@ApiTags('Parking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get()
  @ApiOperation({ summary: 'List all parking locations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.parkingService.findAll(page || 1, limit || 20);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Create new parking location' })
  create(@Body() dto: CreateParkingDto, @CurrentUser('id') userId: string) {
    return this.parkingService.create(dto, userId);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby parking locations' })
  findNearby(@Query() dto: NearbySearchDto) {
    return this.parkingService.findNearby(dto);
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get parking analytics data' })
  getAnalytics() {
    return this.parkingService.getAnalytics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parking location details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Update parking location' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParkingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.parkingService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Delete parking location' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.parkingService.remove(id, userId, userRole);
  }

  @Get(':id/occupancy')
  @ApiOperation({ summary: 'Get real-time occupancy' })
  getOccupancy(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingService.getOccupancy(id);
  }

  @Put(':id/occupancy')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Update occupancy count' })
  updateOccupancy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOccupancyDto,
  ) {
    return this.parkingService.updateOccupancy(id, dto);
  }

  @Get(':id/pricing')
  @ApiOperation({ summary: 'Get pricing information' })
  getPricing(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingService.getPricing(id);
  }

  @Put(':id/pricing')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Update pricing rules' })
  updatePricing(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePricingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.parkingService.updatePricing(id, dto, userId, userRole);
  }

  @Post(':id/images')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload parking images' })
  async uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // TODO: upload files to S3 and get URLs
    const imageUrls = files?.map((f) => `/uploads/${f.originalname}`) || [];
    return this.parkingService.uploadImages(id, imageUrls);
  }
}
*/
