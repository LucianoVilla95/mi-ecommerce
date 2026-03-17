import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { CategoriesBodyDto } from "./dtos/categoriesBodyDto.dto";
import { Category } from "./categories.entity";
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor (private readonly categoriesRepository: CategoriesRepository) {}

  async createCategory({name}: CategoriesBodyDto): Promise<Category> {
    try {
      const categoryExists: Category | null = await this.categoriesRepository.getCategoryByName(name);
      
      if (categoryExists) throw new BadRequestException('Category already exists');

      const slug: string = slugify(name, {lower: true, strict: true});

      return await this.categoriesRepository.createCategory(name, slug);
      
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Error creating category');
    }
  }

  async getCategories(): Promise<Category[]> {
    return await this.categoriesRepository.getCategories();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const category: Category | null = await this.categoriesRepository.getCategoryById(id);

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }
}