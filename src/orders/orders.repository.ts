import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { EntityManager, Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import { OrderDetail } from './orderDetails.entity';
import { Product } from 'src/products/products.entity';

@Injectable()
export class OrdersRepository {
  constructor (@InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
  @InjectRepository(OrderDetail) private readonly orderDetailsRepository: Repository<OrderDetail>) {}

  async getOrderByUser(user: Omit<User, 'password'>, manager?: EntityManager): Promise<Order | null> {
    return manager ?
    await manager.getRepository(Order)
    .createQueryBuilder('order')
    .setLock('pessimistic_write')
    .where('order.user.id = :userId', { userId: user.id })
    .andWhere('order.isActive = :isActive', { isActive: true })
    .getOne()
    : await this.ordersRepository.findOne({ where: {user: {id: user.id}, isActive: true}, relations: ['details']})
  }

  async createOrder(user: Omit<User, 'password'>): Promise<Order> {
    const order: Order = await this.ordersRepository.create({user});
    return await this.ordersRepository.save(order);
  }

  async createOrderDetail(order: Order, product: Product, quantity: number, price: number): Promise<OrderDetail> {
    const orderDetail = await this.orderDetailsRepository.create({order, product, quantity, price});
    return await this.orderDetailsRepository.save(orderDetail);
  }

  async getOrderDetail(order: Order, product: Product): Promise<OrderDetail | null> {
    return await this.orderDetailsRepository.findOne({ where: {order: {id: order.id}, product: {id: product.id}}});
  }

  async updateOrderDetail(orderDetailExisting: OrderDetail): Promise<{message: string}> {
    await this.orderDetailsRepository.save(orderDetailExisting);

    return {
      message: 'Product added successfully!'
    }
  }
}