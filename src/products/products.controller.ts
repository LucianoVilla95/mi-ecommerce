import { Controller, Post, Body, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Get, Query, UseGuards, Patch, Param, ParseUUIDPipe, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { ProductsQueryDto } from './dtos/productsQueryDto.dto';
import { PaginationResult } from 'src/users/interfaces/paginationMeta.interface';
import { Roles } from 'src/decorators/rolesUser.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ProductsUpdateDto } from './dtos/productsUpdateDto.dto';

@Controller('products')
export class ProductsController {
  constructor (private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createProduct(@Body() body: ProductsBodyDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file: Express.Multer.File): Promise<Product> {
    return await this.productsService.createProduct(body, file);
  }

  @Get()
  async getProducts(@Query() query: ProductsQueryDto): Promise<PaginationResult<Product>> {
    return await this.productsService.getProducts(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  async updateProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: ProductsUpdateDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file?: Express.Multer.File): Promise<{message: string}> {
    return await this.productsService.updateProduct(id, body, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<{message: string}> {
    return await this.productsService.deleteProduct(id);
  }
}