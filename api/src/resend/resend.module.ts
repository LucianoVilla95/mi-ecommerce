import { Module } from '@nestjs/common';
import { ResendService } from './resend.service';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [ResendService,
    {
      provide: Resend,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');
        return new Resend(apiKey);
      },
    }
  ],
  exports: [ResendService]
})
export class ResendModule {}