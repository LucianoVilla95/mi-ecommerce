import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesBodyDto } from './dtos/categoriesBodyDto.dto';
import { Category } from './categories.entity';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/rolesUser.decorator';

@Controller('categories')
export class CategoriesController {
  constructor (private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async createCategory(@Body() body: CategoriesBodyDto): Promise<Category> {
    return await this.categoriesService.createCategory(body);
  }

  @Get()
  async getCategories(): Promise<Category[]> {
    return await this.categoriesService.getCategories();
  }
}