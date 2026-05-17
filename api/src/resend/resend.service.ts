import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendService {
  constructor (private readonly resend: Resend,
    private readonly configService: ConfigService
  ) {}
  
  async sendResetPasswordEmail(id: string, email: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const link = `${frontendUrl}/reset-password?token=${token}&=${id}`; // agregar el id del usuario al final del link

    await this.resend.emails.send({
      from: 'onboarding@resend.dev', // remitente (ojo, en producción debe estar verificado)
      to: email, // destinatario
      subject: 'Recuperar contraseña', // asunto
      html: `
        <h3>Recuperar contraseña</h3>
        <p>Hacé click en el enlace:</p>
        <a href="${link}">Cambiar contraseña</a>
      `, // contenido del mail
    });
  }
}