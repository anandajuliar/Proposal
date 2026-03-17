import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { pool } from '../db';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AdminService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'forms@contrariusactus.com', 
        pass: 'hvfh bbxo mvft szjb',         
      },
    });
  }

  async getOverview(userId: number, role: string) {
    try {
      let queryCondition = `LEFT JOIN users u ON p.id_user = u.id_user WHERE (u.is_deleted = 0 OR u.is_deleted IS NULL)`;
      let queryParams: any[] = [];

      if (role === 'USER') {
        queryCondition += ` AND p.id_user = ?`;
        queryParams.push(userId);
      }

      const [proceedingsRaw]: any = await pool.query(
        `SELECT p.*, u.firstname FROM proceedings_proposals p ${queryCondition} ORDER BY p.created_at DESC`,
        queryParams,
      );

      return {
        proceedings: proceedingsRaw.filter((p: any) => p.status === 'APPROVED'),
        submitted: proceedingsRaw.filter(
          (p: any) => p.status !== 'APPROVED' && p.status !== 'DRAFT',
        ),
        drafts: proceedingsRaw.filter((p: any) => p.status === 'DRAFT'),
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data overview.');
    }
  }

  async getProposalById(id: string) {
    try {
      const [rows]: any = await pool.query(
        `SELECT * FROM proceedings_proposals WHERE id = ?`,
        [id],
      );
      if (rows.length > 0) {
        const row = rows[0];
        let details = {};
        try {
          details =
            typeof row.form_details === 'string'
              ? JSON.parse(row.form_details)
              : row.form_details || {};
        } catch (e) {}

        let formattedDate = '';
        if (row.delivery_date) {
          const d = new Date(row.delivery_date);
          formattedDate = d.toISOString().split('T')[0];
        }

        return {
          ...details,
          event_name: row.event_name || '',
          acronym: row.acronym || '',
          delivery_date: formattedDate,
        };
      }
      return {};
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data proposal');
    }
  }

  async saveProposal(body: any, targetStatus: string) {
    const formDetailsJson = JSON.stringify(body.form_details || {});

    try {
      if (body.proposal_id) {
        const [existing]: any = await pool.query(
          `SELECT status FROM proceedings_proposals WHERE id = ?`,
          [body.proposal_id],
        );
        let finalStatus = targetStatus;
        if (existing.length > 0) {
          const currentStatus = existing[0].status;
          if (
            currentStatus === 'APPROVED' ||
            currentStatus === 'ON_REVIEW' ||
            currentStatus === 'REJECTED'
          ) {
            finalStatus = currentStatus;
          }
        }
        await pool.query(
          `UPDATE proceedings_proposals SET organizer_name = ?, event_name = ?, acronym = ?, delivery_date = ?, status = ?, form_details = ? WHERE id = ?`,
          [
            body.organizer_name,
            body.event_name,
            body.acronym,
            body.delivery_date,
            finalStatus,
            formDetailsJson,
            body.proposal_id,
          ],
        );
        return { message: `Proposal berhasil di-update!` };
      } else {
        await pool.query(
          `INSERT INTO proceedings_proposals (organizer_name, event_name, acronym, delivery_date, status, form_details, id_user) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            body.organizer_name,
            body.event_name,
            body.acronym,
            body.delivery_date,
            targetStatus,
            formDetailsJson,
            body.id_user,
          ],
        );
        return {
          message: `Proposal baru berhasil disimpan sebagai ${targetStatus}!`,
        };
      }
    } catch (error) {
      throw new InternalServerErrorException('Gagal menyimpan proposal.');
    }
  }

  // 🚀 TAMBAHAN: Hapus Proposal
  async deleteProposal(id: number) {
    try {
      await pool.query(`DELETE FROM proceedings_proposals WHERE id = ?`, [id]);
      return { message: 'Proposal berhasil dihapus secara permanen!' };
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghapus proposal.');
    }
  }

  async updateProposalStatus(proposalId: number, status: string) {
    try {
      await pool.query(
        `UPDATE proceedings_proposals SET status = ? WHERE id = ?`,
        [status, proposalId],
      );

      const [userRes]: any = await pool.query(
        `SELECT u.email FROM users u JOIN proceedings_proposals p ON u.id_user = p.id_user WHERE p.id = ?`,
        [proposalId],
      );
      const [templateRes]: any = await pool.query(
        `SELECT subject, body FROM email_templates WHERE status_trigger = ?`,
        [status],
      );

      if (userRes.length > 0 && templateRes.length > 0) {
        const targetEmail = userRes[0].email;
        try {
          await this.transporter.sendMail({
            from: '"Contrarius Institute" <forms@contrariusactus.com>',
            to: targetEmail,
            subject: templateRes[0].subject,
            text: templateRes[0].body,
          });
          console.log(`✅ Real Email Sent to: ${targetEmail}`);
        } catch (emailError) {
          console.error(`❌ Gagal ngirim email ke ${targetEmail}:`, emailError);
        }
      }
      return { message: 'Status updated and notification email sent!' };
    } catch (error) {
      throw new InternalServerErrorException('Gagal update status proposal.');
    }
  }

  async getAllUsers() {
    try {
      const [users]: any = await pool.query(
        `SELECT id_user, firstname, lastname, email, role FROM users WHERE is_deleted = 0`,
      );
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data user.');
    }
  }

  async updateUserRole(idUser: number, role: string) {
    try {
      await pool.query(`UPDATE users SET role = ? WHERE id_user = ?`, [
        role,
        idUser,
      ]);
      return { message: 'User role updated!' };
    } catch (error) {
      throw new InternalServerErrorException('Gagal update role user.');
    }
  }

  async deleteUser(idUser: number) {
    try {
      await pool.query(`UPDATE users SET is_deleted = 1 WHERE id_user = ?`, [
        idUser,
      ]);
      return { message: 'User soft-deleted successfully!' };
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghapus user.');
    }
  }

  async getEmailTemplates() {
    try {
      const [templates]: any = await pool.query(
        `SELECT * FROM email_templates`,
      );
      return templates;
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil template email.');
    }
  }

  async updateEmailTemplate(id: number, subject: string, body: string) {
    try {
      await pool.query(
        `UPDATE email_templates SET subject = ?, body = ? WHERE id = ?`,
        [subject, body, id],
      );
      return { message: 'Email template updated!' };
    } catch (error) {
      throw new InternalServerErrorException('Gagal update template email.');
    }
  }

  async validateLogout(userId: number) {
    return { message: 'Logout berhasil.', success: true };
  }
}
