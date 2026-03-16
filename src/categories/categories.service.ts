import { Injectable, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CategoriesRepository } from "./categories.repository";
import { CategoriesBodyDto } from "./dtos/categoriesBodyDto.dto";
import { Category } from "./categories.entity";
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor (private readonly categoriesRepository: CategoriesRepository) {}

  async createCategory({name}: CategoriesBodyDto): Promise<Category> {
    const normalizedName: string = name.trim().toLowerCase();

    const formattedName: string = normalizedName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    try {
      const categoryExists: Category | null = await this.categoriesRepository.getCategoryByName(formattedName);
      
      if (categoryExists) throw new BadRequestException('Category already exists');

      const slug: string = slugify(formattedName, {lower: true, strict: true});

      return await this.categoriesRepository.createCategory(formattedName, slug);
      
    } catch (error) {
      console.log(error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Error creating category');
    }
  }

  async getCategories(): Promise<Category[]> {
    return await this.categoriesRepository.getCategories();
  }
}