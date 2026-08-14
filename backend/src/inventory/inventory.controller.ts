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
import { InventoryService } from './inventory.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
@UseGuards(AuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  // Mandi endpoints
  @Get('mandi')
  @Roles('mandi')
  getMyMandiInventory(@Req() req: { user: { uid: string } }) {
    return this.inventoryService.getMandiInventory(req.user.uid);
  }

  @Post('mandi')
  @Roles('mandi')
  addMandiInventory(
    @Body() data: Record<string, unknown>,
    @Req() req: { user: { uid: string } },
  ) {
    return this.inventoryService.addMandiInventory({
      ...data,
      mandiUserId: req.user.uid,
    });
  }

  @Put('mandi/:id')
  @Roles('mandi')
  updateMandiInventory(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.inventoryService.updateInventoryItem('mandi_inventory', id, data);
  }

  @Delete('mandi/:id')
  @Roles('mandi')
  deleteMandiInventory(@Param('id') id: string) {
    return this.inventoryService.deleteInventoryItem('mandi_inventory', id);
  }

  // Wholesaler endpoints
  @Get('wholesaler')
  @Roles('wholesaler')
  getMyWholesalerInventory(@Req() req: { user: { uid: string } }) {
    return this.inventoryService.getWholesalerInventory(req.user.uid);
  }

  @Post('wholesaler')
  @Roles('wholesaler')
  addWholesalerInventory(
    @Body() data: Record<string, unknown>,
    @Req() req: { user: { uid: string } },
  ) {
    return this.inventoryService.addWholesalerInventory({
      ...data,
      wholesalerId: req.user.uid,
    });
  }

  @Put('wholesaler/:id')
  @Roles('wholesaler')
  updateWholesalerInventory(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.inventoryService.updateInventoryItem('wholesaler_inventory', id, data);
  }

  @Delete('wholesaler/:id')
  @Roles('wholesaler')
  deleteWholesalerInventory(@Param('id') id: string) {
    return this.inventoryService.deleteInventoryItem('wholesaler_inventory', id);
  }

  // Admin
  @Get('all')
  @Roles('admin')
  getAllStats() {
    return this.inventoryService.getAllInventoryStats();
  }
}
