import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CropsService } from './crops.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('crops')
@UseGuards(AuthGuard, RolesGuard)
export class CropsController {
  constructor(private cropsService: CropsService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.cropsService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.cropsService.findAvailable();
  }

  @Get('my')
  @Roles('farmer')
  findMyCrops(@Req() req: { user: { uid: string } }) {
    return this.cropsService.findByFarmer(req.user.uid);
  }

  @Get('stats')
  @Roles('farmer')
  getMyStats(@Req() req: { user: { uid: string } }) {
    return this.cropsService.getStatsByFarmer(req.user.uid);
  }

  @Post()
  @Roles('farmer')
  create(
    @Body() data: Record<string, unknown>,
    @Req() req: { user: { uid: string } },
  ) {
    return this.cropsService.create({ ...data, farmerId: req.user.uid });
  }

  @Put(':id')
  @Roles('farmer')
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.cropsService.update(id, data);
  }

  @Delete(':id')
  @Roles('farmer')
  delete(@Param('id') id: string) {
    return this.cropsService.delete(id);
  }
}
