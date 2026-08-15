import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { EntityManager, Repository, Brackets } from 'typeorm';
import { Category } from '../categories/categories.entity';

@Injectable()
export class ProductsRepository {
  constructor (@InjectRepository(Product) private readonly productsRepository: Repository<Product>) {}

  async getProductByName (name: string): Promise<Product | null> {
    return await this.productsRepository.findOne({ where: {name}, relations: ['category', 'orderDetails'] })
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
      relations: ['category', 'orderDetails']
    });

    return [products, total];
  }

  async searchByName(words: string[], page: number, limit: number) {
  const queryBuilder = this.productsRepository.createQueryBuilder('product');
  queryBuilder.where('product.isActive = :isActive', { isActive: true });

  const fullSearchTermWithNoSpaces = words.join('');

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where("REPLACE(product.name, ' ', '') ILIKE :fullTerm", {
        fullTerm: `%${fullSearchTermWithNoSpaces}%`,
      });

      if (words.length > 1) {
        qb.orWhere(
          new Brackets((subQb) => {
            words.forEach((word, index) => {
              subQb.andWhere(`product.name ILIKE :word${index}`, {
                [`word${index}`]: `%${word}%`,
              });
            });
          }),
        );
      }
    }),
  );

  const [products, total] = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return { products, total };
}


  async getProductById (id: string, manager?: EntityManager): Promise<Product | null> {
    const queryBuilder = manager
    ? manager.getRepository(Product).createQueryBuilder('product')
    : this.productsRepository.createQueryBuilder('product');
    queryBuilder
    .innerJoinAndSelect('product.category', 'category')
    .where('product.id = :id', { id })
    .andWhere('product.isActive = :isActive', { isActive: true })

    if (manager) {
    queryBuilder.setLock('pessimistic_write');
    }

    return await queryBuilder.getOne();
  }

  async updateProduct(product: Product, name?: string, description?: string, price?: number, stock?: number, secure_url?: string, public_id?: string, slug?: string, isActive?: boolean, category?: Category): Promise<{message: string}> {
    Object.assign(product, {name, description, price, stock, imgUrl: secure_url, imgPublicId: public_id, slug, isActive, category});
    await this.productsRepository.save(product);

    return {
      message: 'Product updated successfully'
    }
  }

  async deleteProduct(product: Product): Promise<{message: string}> {
    product.isActive = false;
    await this.productsRepository.save(product);

    return {
      message: 'Product deleted successfully'
    }
  }

  async updateStock(product: Product, manager?: EntityManager): Promise<{message: string}> {
    const repo = manager ? manager.getRepository(Product) : this.productsRepository;
    await repo.save(product);

    return {
      message: 'Stock updated successfully'
    }
  }
}
