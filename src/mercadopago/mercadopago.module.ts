import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig from 'mercadopago';

@Module({
  imports: [],
  controllers: [],
  providers: [MercadoPagoService,
    {
      provide: 'MP_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessToken = configService.get('MP_ACCESS_TOKEN');
        return new MercadoPagoConfig({
          accessToken: accessToken
        })
      }
    }
  ],
  exports: [MercadoPagoService]
})
export class MercadoPagoModule {}