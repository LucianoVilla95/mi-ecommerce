import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { OrderDetail } from './orderDetails.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetail]), UsersModule, ProductsModule, MercadoPagoModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository]
})
export class OrdersModule {}