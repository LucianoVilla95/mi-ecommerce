import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, ConflictException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { CategoriesBodyDto } from "./dtos/categoriesBodyDto.dto";
import { Category } from "./categories.entity";
import slugify from 'slugify';
import { CategoriesUpdateDto } from "./dtos/categoriesUpdateDto.dto";
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class CategoriesService {
  constructor (private readonly categoriesRepository: CategoriesRepository,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async createCategory({name}: CategoriesBodyDto, file: Express.Multer.File): Promise<Category> {
    try {
      const categoryExists: Category | null = await this.categoriesRepository.getCategoryByName(name);
      
      if (categoryExists) throw new BadRequestException('Category already exists');

      const slug: string = slugify(name, {lower: true, strict: true});

      const uploadedImage: UploadApiResponse = await this.cloudinaryService.uploadImage(file);

      return await this.categoriesRepository.createCategory(name, uploadedImage.secure_url, uploadedImage.public_id, slug);
      
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Error creating category');
    }
  }

  async getCategories(): Promise<Category[]> {
    return await this.categoriesRepository.getCategories();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category: Category | null = await this.categoriesRepository.getCategoryById(id);

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async updateCategory(id: string, {name}: CategoriesUpdateDto, file?: Express.Multer.File): Promise<{message: string}> {
    const category: Category = await this.getCategoryById(id);
      
    if (name) {
      const categoryExists: Category | null = await this.categoriesRepository.getCategoryByName(name);
      if (categoryExists && categoryExists.id !== id) throw new ConflictException('Category already exists');
    }
  
    let uploadedImage: UploadApiResponse | undefined;
    if (file) {
      uploadedImage = await this.cloudinaryService.uploadImage(file);
      if (category.imgPublicId) await this.cloudinaryService.deleteImage(category.imgPublicId);
    }
  
    let slug: string | undefined;
    if (name) {
      slug = slugify(name, {
        lower: true,
        strict: true
      });
    }
  
    return await this.categoriesRepository.updateCategory(category, name, uploadedImage?.secure_url, uploadedImage?.public_id, slug);
  }
}