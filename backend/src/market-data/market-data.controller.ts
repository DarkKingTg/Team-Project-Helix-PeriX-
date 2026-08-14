import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('market-data')
@UseGuards(AuthGuard)
export class MarketDataController {
  constructor(private marketDataService: MarketDataService) {}

  @Get('prices')
  getMarketPrices(
    @Query('commodity') commodity?: string,
    @Query('state') state?: string,
  ) {
    return this.marketDataService.getMarketPrices(commodity, state);
  }

  @Get('trends')
  getPriceTrends(
    @Query('commodity') commodity: string,
    @Query('days') days?: string,
  ) {
    return this.marketDataService.getPriceTrends(commodity, days ? parseInt(days) : 30);
  }

  @Get('commodities')
  getCommodities() {
    return this.marketDataService.getCommodities();
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles('admin')
  seedData(@Body() body: { data: Array<Record<string, unknown>> }) {
    return this.marketDataService.seedMarketData(body.data);
  }
}
