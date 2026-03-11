import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Post('proposals/draft')
  async saveDraft(@Body() body: any) {
    if (!body.event_name || !body.organizer_name) {
      throw new BadRequestException('Event Name dan Organizer wajib diisi walau hanya draft!');
    }
    return this.adminService.saveProposal(body, false);
  }

  @Post('proposals/submit')
  async submitProposal(@Body() body: any) {
    if (!body.event_name || !body.organizer_name || !body.form_details) {
      throw new BadRequestException('Semua data wajib dilengkapi sebelum submit!');
    }
    return this.adminService.saveProposal(body, true);
  }

  @Post('logout')
  async logout(@Body() body: any) {
    if (!body.user_id) {
      throw new BadRequestException('User ID tidak ditemukan untuk proses logout!');
    }
    return this.adminService.validateLogout(body.user_id);
  }
}