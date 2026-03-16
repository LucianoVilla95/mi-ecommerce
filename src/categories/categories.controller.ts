import { Body, Controller, Post, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesBodyDto } from './dtos/categoriesBodyDto.dto';
import { Category } from './categories.entity';

@Controller('categories')
export class CategoriesController {
  constructor (private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(@Body() body: CategoriesBodyDto): Promise<Category> {
    return await this.categoriesService.createCategory(body);
  }

  @Get()
  async getCategories(): Promise<Category[]> {
    return await this.categoriesService.getCategories();
  }
}