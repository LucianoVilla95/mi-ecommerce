import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';
import { Category } from 'src/categories/categories.entity';

@Injectable()
export class ProductsRepository {
  constructor (@InjectRepository(Product) private readonly productsRepository: Repository<Product>) {}

  async getProductByName (name: string): Promise<Product | null> {
    return await this.productsRepository.findOne({ where: {name} })
  }

  async createProduct(name: string, description: string, price: number, stock: number, secure_url: string, public_id: string, slug: string, id: string | undefined): Promise<Product> {
    const product: Product = await this.productsRepository.create({name, description, price, stock, imgUrl: secure_url, imgPublicId: public_id, slug, id});
    return await this.productsRepository.save(product);
  }
}