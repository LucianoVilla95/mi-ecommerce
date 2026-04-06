import { Body, Controller, Delete, Param, Post, UseGuards, ParseUUIDPipe, Patch, Get, Query, Headers, ConsoleLogger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductsDto } from './dtos/addProductDto.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import type { JwtPayload } from '../users/interfaces/jwtPayload.interface';
import { RemoveProductsDto } from './dtos/removeProductDto.dto';
import { Order } from './orders.entity';
import { MercadoPagoWebhookDto } from './dtos/mercadoPagoWebhookDto.dto';

@Controller('orders')
export class OrdersController {
  constructor (private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async addProduct(@Body() body: AddProductsDto, @CurrentUser() user: JwtPayload): Promise<{message: string}> {
    return await this.ordersService.addProduct(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateQuantity(@Param('id', new ParseUUIDPipe({ version: '4'})) id: string, @CurrentUser() user: JwtPayload, @Body() body: RemoveProductsDto): Promise<{message: string}> {
    return await this.ordersService.updateQuantity(user, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: JwtPayload): Promise<{message: string}> {
    return await this.ordersService.removeProduct(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@CurrentUser() user: JwtPayload): Promise<Omit<Order, 'user' | 'date' | 'isActive'> & {total: number}> {
    return await this.ordersService.getOrder(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() user: JwtPayload): Promise<{url: string}> {
    return this.ordersService.checkout(user);
  }

  @Post('webhook/mercadopago')
  handleWebhook(@Body() body: MercadoPagoWebhookDto): Promise<{message: string}> {
    console.log('Webhook recibido:', body);
    const paymentId: string | undefined = body?.data?.id;
    const topic: string | undefined = body?.type;
    
    console.log('Normalized:', {
      id: paymentId,
      topic: topic
    });
    if (!paymentId || topic !== 'payment') {
      return Promise.resolve({ message: 'Ignored' });
    }
    return this.ordersService.handleWebhook(paymentId, topic)
  }

  @Get('payment/success')
  success() {
    return 'ok';
  }
}