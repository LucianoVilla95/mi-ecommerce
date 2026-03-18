import { Injectable, InternalServerErrorException, ConflictException, HttpException, BadRequestException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/categories.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { Product } from './products.entity';
import slugify from 'slugify';
import { UploadApiResponse } from 'cloudinary';

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

      return await this.productsRepository.createProduct(name, description, price, stock, uploadedImage.secure_url, uploadedImage.public_id, slug, category?.id);

    } catch (error) {
      console.log(error);
        
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Error creating user');
    }
  }
}