import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getAllPlans() {
    return await this.subscriptionsService.getAllPlans();
  }

  @Get('plans/:name')
  async getPlanByName(@Param('name') name: string) {
    return await this.subscriptionsService.getPlanByName(name);
  }

  @Get('tenant/:tenantId')
  async getTenantSubscription(@Param('tenantId') tenantId: string) {
    return await this.subscriptionsService.getTenantSubscription(tenantId);
  }

  @Post()
  async createSubscription(
    @Body()
    data: {
      tenantId: string;
      plan: string;
      billingCycle: 'monthly' | 'yearly';
      price: number;
    },
  ) {
    return await this.subscriptionsService.createSubscription(data);
  }

  @Post('upgrade')
  async upgradeSubscription(
    @Body()
    data: {
      tenantId: string;
      newPlan: string;
      billingCycle?: 'monthly' | 'yearly';
    },
  ) {
    return await this.subscriptionsService.upgradeSubscription(
      data.tenantId,
      data.newPlan,
      data.billingCycle,
    );
  }

  @Get('tenant/:tenantId/invoices')
  async getTenantInvoices(@Param('tenantId') tenantId: string) {
    return await this.subscriptionsService.getTenantInvoices(tenantId);
  }
}
