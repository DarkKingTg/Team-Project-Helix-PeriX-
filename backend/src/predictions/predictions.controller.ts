import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('predictions')
@UseGuards(AuthGuard)
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Post('demand')
  getDemandForecast(
    @Body() body: { commodity: string; state: string; days?: number },
  ) {
    return this.predictionsService.getDemandForecast(
      body.commodity,
      body.state,
      body.days || 30,
    );
  }

  @Post('price')
  getPricePrediction(@Body() body: { commodity: string; state: string }) {
    return this.predictionsService.getPricePrediction(
      body.commodity,
      body.state,
    );
  }

  @Post('dynamic-pricing')
  getDynamicPricing(
    @Body()
    body: {
      commodity: string;
      currentPrice: number;
      daysToExpiry: number;
      quantity: number;
    },
  ) {
    return this.predictionsService.getDynamicPricing(
      body.commodity,
      body.currentPrice,
      body.daysToExpiry,
      body.quantity,
    );
  }

  @Get('stored')
  getStoredPredictions(@Query('commodity') commodity?: string) {
    return this.predictionsService.getStoredPredictions(commodity);
  }
}
