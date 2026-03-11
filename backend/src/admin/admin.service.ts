import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { pool } from '../db';

@Injectable()
export class AdminService {
  async getOverview() {
    try {
      const [proceedings]: any = await pool.query(
        `SELECT * FROM proceedings_proposals WHERE status = 'APPROVED'`,
      );
      const [submitted]: any = await pool.query(
        `SELECT * FROM proceedings_proposals WHERE status = 'SUBMITTED' ORDER BY created_at DESC`,
      );
      const [drafts]: any = await pool.query(
        `SELECT * FROM proceedings_proposals WHERE status = 'DRAFT' ORDER BY created_at DESC`,
      );

      return { proceedings, submitted, drafts };
    } catch (error) {
      console.log('Error dari Database:', error);
      throw new InternalServerErrorException('Gagal mengambil data overview.');
    }
  }

  async saveProposal(body: any, isSubmit: boolean) {
    const status = isSubmit ? 'SUBMITTED' : 'DRAFT';
    const formDetailsJson = JSON.stringify(body.form_details || {});

    try {
      if (body.proposal_id) {
        await pool.query(
          `UPDATE proceedings_proposals SET event_name = ?, acronym = ?, delivery_date = ?, status = ?, form_details = ? WHERE id = ?`,
          [
            body.event_name,
            body.acronym,
            body.delivery_date,
            status,
            formDetailsJson,
            body.proposal_id,
          ],
        );
        return { message: `Proposal berhasil di-update menjadi ${status}!` };
      } else {
        await pool.query(
          `INSERT INTO proceedings_proposals (organizer_name, event_name, acronym, delivery_date, status, form_details) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            body.organizer_name,
            body.event_name,
            body.acronym,
            body.delivery_date,
            status,
            formDetailsJson,
          ],
        );
        return {
          message: `Proposal baru berhasil disimpan sebagai ${status}!`,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException('Gagal menyimpan proposal.');
    }
  }

  async getProposalById(id: string) {
    try {
      const [rows]: any = await pool.query(
        `SELECT form_details FROM proceedings_proposals WHERE id = ?`,
        [id],
      );
      return rows.length > 0 ? rows[0] : {};
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data proposal');
    }
  }

  async validateLogout(userId: number) {
    return {
      message: 'Logout berhasil, sesi telah dihapus dari server.',
      success: true,
    };
  }
}
