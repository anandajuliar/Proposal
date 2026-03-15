import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview(
    @Query('userId') userId: string,
    @Query('role') role: string,
  ) {
    return this.adminService.getOverview(Number(userId), role);
  }

  @Post('proposals/draft')
  async saveDraft(@Body() data: any) {
    return this.adminService.saveProposal(data, 'DRAFT');
  }

  @Post('proposals/submit')
  async submitProposal(@Body() data: any) {
    const res = await this.adminService.saveProposal(data, 'SUBMITTED');
    if (data.proposal_id) {
      await this.adminService.updateProposalStatus(
        data.proposal_id,
        'SUBMITTED',
      );
    }
    return res;
  }

  @Put('proposals/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.adminService.updateProposalStatus(Number(id), body.status);
  }

  @Post('logout')
  async logout(@Body() body: any) {
    if (!body.user_id) {
      throw new BadRequestException(
        'User ID tidak ditemukan untuk proses logout!',
      );
    }
    return this.adminService.validateLogout(body.user_id);
  }

  @Get('proposals/:id')
  async getProposalById(@Param('id') id: string) {
    return this.adminService.getProposalById(id);
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.adminService.updateUserRole(Number(id), body.role);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(Number(id));
  }

  @Get('templates')
  async getTemplates() {
    return this.adminService.getEmailTemplates();
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: { subject: string; body: string },
  ) {
    return this.adminService.updateEmailTemplate(
      Number(id),
      body.subject,
      body.body,
    );
  }
}
