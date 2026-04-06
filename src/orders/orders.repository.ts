import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { EntityManager, Repository, DeleteResult } from 'typeorm';
import { User } from '../users/users.entity';
import { OrderDetail } from './orderDetails.entity';
import { Product } from '../products/products.entity';

@Injectable()
export class OrdersRepository {
  constructor (@InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
  @InjectRepository(OrderDetail) private readonly orderDetailsRepository: Repository<OrderDetail>) {}

  async getOrderByUser(user: Omit<User, 'password'>, manager?: EntityManager): Promise<Order | null> {
    return manager ?
    await manager.getRepository(Order)
    .createQueryBuilder('order')
    .innerJoin('order.user', 'user')
    .innerJoinAndSelect('order.details', 'details')
    .innerJoinAndSelect('details.product', 'product')
    .where('user.id = :userId', { userId: user.id })
    .andWhere('order.isActive = true')
    .setLock('pessimistic_write')
    .getOne()
    : await this.ordersRepository.findOne({
      where: {user: {id: user.id}, isActive: true},
      relations: ['user', 'details', 'details.product']})
  }

  async createOrder(user: Omit<User, 'password'>): Promise<Order> {
    const order: Order = await this.ordersRepository.create({user});
    return await this.ordersRepository.save(order);
  }

  async updateOrder(order: Order, manager?: EntityManager): Promise<{message: string}> {
    manager ?
    await manager.getRepository(Order).save(order)
    : await this.ordersRepository.save(order);

    return {
      message: 'Order updated successfully'
    }
  }

  async createOrderDetail(order: Order, product: Product, quantity: number, price: number, manager?: EntityManager): Promise<OrderDetail> {
    return manager ?
    await manager?.getRepository(OrderDetail).save({order, product, quantity, price})
    : await this.orderDetailsRepository.save({order, product, quantity, price});
  }

  async getOrderDetail(order: Order, product: Product, manager?: EntityManager): Promise<OrderDetail | null> {
    return manager ?
    await manager.getRepository(OrderDetail).findOne({
      where: {order: {id: order.id}, product: {id: product.id}},
      relations: ['order', 'product']})
    : await this.orderDetailsRepository.findOne({
      where: {order: {id: order.id}, product: {id: product.id}},
      relations: ['order', 'product']});
  }

  async updateOrderDetail(orderDetailExisting: OrderDetail, manager?: EntityManager): Promise<{message: string}> {
    manager ?
    await manager.getRepository(OrderDetail).save(orderDetailExisting)
    : await this.orderDetailsRepository.save(orderDetailExisting);

    return {
      message: 'Product added successfully!'
    }
  }

  async deleteOrderDetail(order: Order, id: string, manager?: EntityManager): Promise<DeleteResult> {
    return manager ?
    await manager.getRepository(OrderDetail).delete({
      order: {id: order.id},
      product: {id: id}})
    : await this.orderDetailsRepository.delete({
      order: {id: order.id},
      product: {id: id}
    });
  }

  async getOrderById(id?: string, manager?: EntityManager): Promise<Order | null> {
    return manager ?
    await manager
    .getRepository(Order)
    .createQueryBuilder('order')
    .innerJoinAndSelect('order.user', 'user')
    .innerJoinAndSelect('order.details', 'details')
    .innerJoinAndSelect('details.product', 'product')
    .setLock('pessimistic_write')
    .where('order.id = :id', { id })
    .getOne()
    : await this.ordersRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'details', 'details.product']});
  }
}