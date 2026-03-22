import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { Repository } from 'typeorm';

Injectable()
export class OrdersRepository {
  constructor (@InjectRepository(Order) private readonly ordersRepository: Repository<Order>) {}
}