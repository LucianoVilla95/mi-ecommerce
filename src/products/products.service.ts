import { Injectable, InternalServerErrorException, ConflictException, HttpException, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/categories.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { Product } from './products.entity';
import slugify from 'slugify';
import { UploadApiResponse } from 'cloudinary';
import { PaginationResult } from 'src/users/interfaces/paginationMeta.interface';
import { ProductsQueryDto } from './dtos/productsQueryDto.dto';

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

      return await this.productsRepository.createProduct(name, description, price, stock, uploadedImage.secure_url, uploadedImage.public_id, slug, category.id);

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
          category: product.category
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
}