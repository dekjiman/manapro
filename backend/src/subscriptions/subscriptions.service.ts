import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { subscriptionPlans, subscriptions, tenants } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SubscriptionsService {
  async getAllPlans() {
    return await db.select().from(subscriptionPlans);
  }

  async getPlanByName(planName: string) {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, planName));
    return plan;
  }

  async getTenantSubscription(tenantId: string) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId));
    return subscription;
  }

  async createSubscription(data: {
    tenantId: string;
    plan: string;
    billingCycle: 'monthly' | 'yearly';
    price: number;
  }) {
    // Get plan details
    const plan = await this.getPlanByName(data.plan);
    if (!plan) throw new Error('Plan not found');

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (data.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscriptionData = {
      tenantId: data.tenantId,
      plan: data.plan,
      status: 'active' as const,
      billingCycle: data.billingCycle,
      price: data.price.toString(),
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
    };

    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();

    return subscription;
  }

  async upgradeSubscription(
    tenantId: string,
    newPlan: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
  ) {
    const plan = await this.getPlanByName(newPlan);
    if (!plan) throw new Error('Plan not found');

    const price =
      billingCycle === 'yearly'
        ? parseFloat(plan.price) * 12 * 0.8
        : parseFloat(plan.price);

    const [subscription] = await db
      .update(subscriptions)
      .set({
        plan: newPlan,
        billingCycle,
        price: price.toString(),
      })
      .where(eq(subscriptions.tenantId, tenantId))
      .returning();

    return subscription;
  }

  async getTenantInvoices(tenantId: string) {
    // For now, return empty array as we don't have invoice logic yet
    return [];
  }
}
