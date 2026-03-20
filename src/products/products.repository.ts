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

  async createProduct(name: string, description: string, price: number, stock: number, secure_url: string, public_id: string, slug: string, category: Category): Promise<Product> {
    const product: Product = await this.productsRepository.create({name, description, price, stock, imgUrl: secure_url, imgPublicId: public_id, slug, category});
    return await this.productsRepository.save(product);
  }
  
  async getProducts(pageSize: number, skip: number): Promise<[Product[], number]> {
    const [products, total]: [Product[], number] = await this.productsRepository.findAndCount({
      skip: skip,
      take: pageSize,
      where: { isActive: true },
      relations: ['category']
    });

    return [products, total];
  }

  async getProductById (id: string): Promise<Product | null> {
    const product: Product | null = await this.productsRepository.findOne({
      where: {id, isActive: true},
      relations: ['category']
    });

    return product;
  }

  async updateProduct(id: string, name?: string, description?: string, price?: number, stock?: number, secure_url?: string, public_id?: string, slug?: string, isActive?: boolean, category?: Category): Promise<{message: string}> {
    await this.productsRepository.update(id, {name, description, price, stock, imgUrl: secure_url, imgPublicId: public_id, slug, isActive, category});
  
    return {
      message: 'Product updated successfully'
    }
  }

  async deleteProduct(id: string): Promise<{message: string}> {
    await this.productsRepository.update(id, {
      isActive: false
    });

    return {
      message: 'Product deleted successfully'
    }
  }
}