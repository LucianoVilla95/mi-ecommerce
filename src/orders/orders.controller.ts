import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductDto } from './dtos/addProductDto.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import type { JwtPayload } from 'src/users/interfaces/jwtPayload.interface';

@Controller('orders')
export class OrdersController {
  constructor (private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addProduct(@Body() body: AddProductDto, @CurrentUser() user: JwtPayload) {
    return this.ordersService.addProduct(user, body);
  }
}