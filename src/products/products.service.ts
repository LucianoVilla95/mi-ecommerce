import { Injectable, InternalServerErrorException, ConflictException, HttpException, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/categories.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { Product } from './products.entity';
import slugify from 'slugify';
import { UploadApiResponse } from 'cloudinary';
import { PaginationResult } from '../users/interfaces/paginationMeta.interface';
import { ProductsQueryDto } from './dtos/productsQueryDto.dto';
import { ProductsUpdateDto } from './dtos/productsUpdateDto.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor (private readonly productsRepository: ProductsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async createProduct({name, description, price, stock, categoryId}: ProductsBodyDto, file: Express.Multer.File): Promise<Product> {
    try{
      const category: Category = await this.categoriesService.getCategoryById(categoryId);

      const productExists: Product | null = await this.productsRepository.getProductByName(name);

      if (productExists) throw new ConflictException('Product already exists');

      const slug: string = slugify(name, {
        lower: true,
        strict: true
      });

      const uploadedImage: UploadApiResponse = await this.cloudinaryService.uploadImage(file);

      return await this.productsRepository.createProduct(name, description, price, stock, uploadedImage.secure_url, uploadedImage.public_id, slug, category);

    } catch (error) {
      console.log(error);
        
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async getProducts({page, limit}: ProductsQueryDto): Promise<PaginationResult<Product>> {
    const currentPage: number = page && page > 0 ? page : 1;
    const pageSize: number = limit && limit > 0 ? Math.min(limit, 100) : 10;
    const skip: number = (currentPage - 1) * pageSize;

    try {
      const result: [Product[], number] = await this.productsRepository.getProducts(pageSize, skip);

      const data: Product[] = result[0].map((product: Product): Product => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imgUrl: product.imgUrl,
          imgPublicId: product.imgPublicId,
          slug: product.slug,
          isActive: product.isActive,
          category: product.category,
          orderDetails: product.orderDetails
        }
      });

      return {
        data: data,
        meta: {
          total: result[1],
          currentPage,
          lastPage: Math.ceil(result[1] / pageSize)
        }
      }
    } catch (error) {
      console.error('Error getting products:', error);

      throw new Error('Could not get products at this time');
    }
  }

  async getProductById(id: string, manager?: EntityManager): Promise<Product> {
    const product: Product | null = await this.productsRepository.getProductById(id, manager);
    
    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async updateProduct(id: string, {name, description, price, stock, categoryId, isActive}: ProductsUpdateDto, file?: Express.Multer.File): Promise<{message: string}> {
    const product: Product = await this.getProductById(id);
    
    if (name) {
      const productExists: Product | null = await this.productsRepository.getProductByName(name);
      if (productExists && productExists.id !== id) throw new ConflictException('Product already exists');
    }

    let category: Category | undefined;
    if (categoryId) {
      category = await this.categoriesService.getCategoryById(categoryId);
    }

    let uploadedImage: UploadApiResponse | undefined;
    if (file) {
      uploadedImage = await this.cloudinaryService.uploadImage(file);
      if (product.imgPublicId) await this.cloudinaryService.deleteImage(product.imgPublicId);
    }

    let slug: string | undefined;
    if (name) {
      slug = slugify(name, {
        lower: true,
        strict: true
      });
    }

    return await this.productsRepository.updateProduct(product, name, description, price, stock, uploadedImage?.secure_url, uploadedImage?.public_id, slug, isActive, category);
  }

  async updateStock(product: Product, manager?: EntityManager): Promise<{message: string}> {
    return await this.productsRepository.updateStock(product, manager);
  }

  async deleteProduct(id: string): Promise<{message: string}> {
    const product: Product = await this.getProductById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (product.imgPublicId) await this.cloudinaryService.deleteImage(product.imgPublicId);

    return await this.productsRepository.deleteProduct(product);
  }
}