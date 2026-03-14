import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsRepository {
  constructor (@InjectRepository(Product) private readonly productsRepository: Repository<Product>) {}
}