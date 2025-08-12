import { Injectable } from "@nestjs/common";
import { DashboardReadRepo } from "../repository/booking-dashboard.repository";

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardReadRepo) {}

  async getDashboardData() {
    return this.dashboardRepo.getDashboard();
  }
}
