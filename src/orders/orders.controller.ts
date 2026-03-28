import { Body, Controller, Delete, Param, Post, UseGuards, ParseUUIDPipe, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductsDto } from './dtos/addProductDto.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import type { JwtPayload } from 'src/users/interfaces/jwtPayload.interface';
import { RemoveProductsDto } from './dtos/removeProductDto.dto';

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
}