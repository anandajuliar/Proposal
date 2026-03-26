import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { pool } from '../db';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter;

  constructor(private jwtService: JwtService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'forms@contrariusactus.com',
        pass: 'hvfh bbxo mvft szjb',
      },
    });
  }

  async register(body: any) {
    const { firstname, lastname, email, password } = body;

    if (!firstname || !lastname || !email || !password) {
      throw new BadRequestException('Semua field wajib diisi');
    }

    const [existing]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    if (existing.length > 0) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const [result]: any = await pool.query(
        'INSERT INTO users (firstname, lastname, email, password_hash) VALUES (?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword],
      );

      try {
        const [templateRes]: any = await pool.query(
          `SELECT subject, body FROM email_templates WHERE status_trigger = 'REGISTER'`,
        );

        if (templateRes.length > 0) {
          const finalSubject = templateRes[0].subject
            .replace(/{{firstname}}/g, firstname)
            .replace(/{{lastname}}/g, lastname);

          const finalBody = templateRes[0].body
            .replace(/{{firstname}}/g, firstname)
            .replace(/{{lastname}}/g, lastname);

          await this.transporter.sendMail({
            from: '"Contrarius Institute" <noreply@contrariusactus.com>',
            to: email,
            subject: finalSubject,
            text: finalBody,
          });
          console.log(`Dynamic Welcome Email Sent to: ${email}`);
        } else {
          console.log(`Template REGISTER tidak ditemukan di database.`);
        }
      } catch (emailError) {
        console.error(`Gagal ngirim welcome email ke ${email}:`, emailError);
      }

      return { message: 'Registrasi berhasil!', userId: result.insertId };
    } catch (error) {
      throw new BadRequestException(
        'Gagal registrasi. Pastikan format email dan nama benar.',
      );
    }
  }

  async login(body: any) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Email dan password wajib diisi');
    }

    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    if (users.length === 0) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { sub: user.id_user, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login berhasil',
      token,
      user: {
        id: user.id_user,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        role: user.role,
      },
    };
  }
}
