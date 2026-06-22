import { Body, Controller, Delete, Param, Post, UseGuards, ParseUUIDPipe, Patch, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductsDto } from './dtos/addProductDto.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import type { JwtPayload } from '../users/interfaces/jwtPayload.interface';
import { RemoveProductsDto } from './dtos/removeProductDto.dto';
import { Order } from './orders.entity';
import { AddToCartDto } from './dtos/addToCartDto.dto';

@Controller('orders')
export class OrdersController {
  constructor (private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('merge/cart')
  async mergeCart(@Body() body: AddToCartDto, @CurrentUser() user: JwtPayload): Promise<{message: string}> {
    return await this.ordersService.mergeCart(user, body);
  }

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
  async getCart(@CurrentUser() user: JwtPayload): Promise<Omit<Order, 'user' | 'date' | 'isActive'> & {userId: string, total: number}> {
    return await this.ordersService.getOrder(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() user: JwtPayload): Promise<{url: string}> {
    return this.ordersService.checkout(user);
  }

  @Post('webhook/mercadopago')
  handleWebhook(@Body() body: any, @Query() query: any): Promise<{message: string}> {
    console.log('Webhook recibido:', body, query);
    let paymentId: string | undefined;
    let topic: string | undefined;

    if (body.data?.id || body.type === 'payment' || query.topic === 'payment') {
      paymentId = body.data?.id || query.id || body.id;
      topic = query.topic || body.type;
    } else if (body.topic === 'merchant_order' || query.topic === 'merchant_order' || body.resource) {
      topic = body.topic || query.topic;
    
      if (body.resource) {
        const parts = body.resource.split('/');
        paymentId = parts[parts.length - 1];
      } else {
        paymentId = query.id || body.id;
      }
    } 
    console.log('Normalized:', { id: paymentId, topic: topic });
    if (!paymentId || topic !== 'payment') {
      return Promise.resolve({ message: 'Notification acknowledged but ignored' });
    }
    return this.ordersService.handleWebhook(paymentId, topic)
  }
}