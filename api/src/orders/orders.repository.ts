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
    const queryBuilder = manager ? manager.getRepository(Order).createQueryBuilder('orders')
    : this.ordersRepository.createQueryBuilder('orders');

    queryBuilder
    .innerJoin('orders.user', 'user')
    .leftJoinAndSelect('orders.details', 'details')
    .leftJoinAndSelect('details.product', 'product')
    .where('user.id = :userId', { userId: user.id })
    .andWhere('orders.isActive = true', { isActive: true })
    if (manager) {
      queryBuilder.setLock('pessimistic_write', undefined, ['orders']);
    }
    return await queryBuilder.getOne();
  }

  async createOrder(user: Omit<User, 'password'>, manager?: EntityManager): Promise<Order> {
    const order: Order = this.ordersRepository.create({user});
    const repo = manager ? manager.getRepository(Order) : this.ordersRepository;
    return await repo.save(order);
  }

  async updateOrder(order: Order, manager?: EntityManager): Promise<{message: string}> {
    const repo = manager ? manager.getRepository(Order) : this.ordersRepository;
    await repo.save(order);
    return {
      message: 'Order updated successfully'
    }
  }

  async createOrderDetail(order: Order, product: Product, quantity: number, price: number, manager?: EntityManager): Promise<OrderDetail> {
    const repo = manager ? manager.getRepository(OrderDetail) : this.orderDetailsRepository;
    return await repo.save({order, product, quantity, price});
  }

  async getOrderDetail(order: Order, product: Product, manager?: EntityManager): Promise<OrderDetail | null> {
    const repo = manager ? manager.getRepository(OrderDetail) : this.orderDetailsRepository;
    return await repo.findOne({
      where: {order: {id: order.id}, product: {id: product.id}},
      relations: ['order', 'product']});
  }

  async updateOrderDetail(orderDetailExisting: OrderDetail, manager?: EntityManager): Promise<{message: string}> {
    const repo = manager ? manager.getRepository(OrderDetail) : this.orderDetailsRepository;
    await repo.save(orderDetailExisting);
    return {
      message: 'Product added successfully!'
    }
  }

  async deleteOrderDetail(id: string, manager?: EntityManager): Promise<DeleteResult> {
    const repo = manager ? manager.getRepository(OrderDetail) : this.orderDetailsRepository;
    return await repo.delete(id);
  }

  async getOrderById(id?: string, manager?: EntityManager): Promise<Order | null> {
    const queryBuilder = manager ? manager.getRepository(Order).createQueryBuilder('orders')
    : this.ordersRepository.createQueryBuilder('orders');
    
    queryBuilder
    .innerJoinAndSelect('orders.user', 'user')
    .leftJoinAndSelect('orders.details', 'details')
    .leftJoinAndSelect('details.product', 'product')
    .where('orders.id = :id', { id });
    if (manager) {
      queryBuilder.setLock('pessimistic_write', undefined, ['orders']);
    }
    return await queryBuilder.getOne();
  }
}