import { Body, Controller, Post, Get, UseGuards, UseInterceptors, Patch, Param, ParseUUIDPipe, ParseFilePipe, UploadedFile, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesBodyDto } from './dtos/categoriesBodyDto.dto';
import { Category } from './categories.entity';
import { JwtAuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/rolesUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesUpdateDto } from './dtos/categoriesUpdateDto.dto';

@Controller('categories')
export class CategoriesController {
  constructor (private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createCategory(@Body() body: CategoriesBodyDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file: Express.Multer.File): Promise<Category> {
    return await this.categoriesService.createCategory(body, file);
  }

  @Get()
  async getCategories(): Promise<Category[]> {
    return await this.categoriesService.getCategories();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  async updateProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: CategoriesUpdateDto , @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file?: Express.Multer.File): Promise<{message: string}> {
    return await this.categoriesService.updateCategory(id, body, file);
  }
}