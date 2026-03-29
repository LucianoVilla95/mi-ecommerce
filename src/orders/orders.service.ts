import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './orders.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';
import { AddProductsDto } from './dtos/addProductDto.dto';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/products.entity';
import { JwtPayload } from 'src/users/interfaces/jwtPayload.interface';
import { DataSource, EntityManager, DeleteResult } from 'typeorm';
import { OrderDetail } from './orderDetails.entity';
import { RemoveProductsDto } from './dtos/removeProductDto.dto';

@Injectable()
export class OrdersService {
  constructor (private readonly ordersRepository: OrdersRepository,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource
  ) {}

  async getOrCreateOrder(sub: string): Promise<Order> {
      const user: Omit<User, 'password'> = await this.usersService.getUserById(sub);
      
      let order: Order | null = await this.ordersRepository.getOrderByUser(user);
      
      if (!order) order = await this.ordersRepository.createOrder(user);
      
      return order;
  }

  async addProduct({sub}: JwtPayload, {productId, quantity}: AddProductsDto): Promise<{message: string}> {
      const order: Order = await this.getOrCreateOrder(sub);
      
      const product: Product = await this.productsService.getProductById(productId);
      
      if (product.stock < quantity) throw new BadRequestException('Insufficient stock');

      let orderDetailExisting: OrderDetail | null = await this.ordersRepository.getOrderDetail(order, product);
      
      if (orderDetailExisting) {
        orderDetailExisting.quantity += quantity;
        await this.ordersRepository.updateOrderDetail(orderDetailExisting);

      } else {
        await this.ordersRepository.createOrderDetail(order, product, quantity, product.price);
      }
      
      return {
        message: 'Product added successfully!'
      }
  }

  async removeProduct(id: string, sub: string): Promise<{message: string}> {
    const order: Order = await this.getOrCreateOrder(sub);

    const result: DeleteResult = await this.ordersRepository.deleteOrderDetail(order, id);

    if (!result.affected) throw new NotFoundException(`OrderDetail not found for orderId = ${order.id} and productId = ${id}`);

    return {
      message: 'Product removed successfully!'
    }
  }

  async updateQuantity({sub}: JwtPayload, id: string, {quantity}: RemoveProductsDto): Promise<{message: string}> {
    const order: Order = await this.getOrCreateOrder(sub);
    const product: Product = await this.productsService.getProductById(id);

    const orderDetailExisting: OrderDetail | null = await this.ordersRepository.getOrderDetail(order, product);
    if (!orderDetailExisting) throw new NotFoundException('Product not found in cart');

    if (quantity === 0) return await this.removeProduct(id, sub);

    if (product.stock < quantity) throw new BadRequestException('Insufficient stock');

    orderDetailExisting.quantity = quantity;
    await this.ordersRepository.updateOrderDetail(orderDetailExisting);

    return {
      message: 'Cart updated successfully!'
    }
  }

  async getOrder({sub}: JwtPayload): Promise<Omit<Order, 'user' | 'date' | 'isActive'> & {userId: string, total: number}> {
  const order: Order = await this.getOrCreateOrder(sub);
  
  const total = order.details.reduce((acc, item) => acc + item.price * item.quantity,0);

  return {
    id: order.id,
    userId: order.user.id,
    details: order.details,
    total,
  };
}
}