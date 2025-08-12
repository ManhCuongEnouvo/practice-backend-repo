import { Injectable } from "@nestjs/common";

@Injectable()
export class DashboardReadRepo {
  private ticketsSold = 0;
  private revenue = 0;

  async incrementTicketsSold(count: number): Promise<void> {
    this.ticketsSold += count;
  }

  async incrementRevenue(amount: number): Promise<void> {
    this.revenue += amount;
  }

  async getDashboard(): Promise<{ ticketsSold: number; revenue: number }> {
    return {
      ticketsSold: this.ticketsSold,
      revenue: this.revenue,
    };
  }
}
