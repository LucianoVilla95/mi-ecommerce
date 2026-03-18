import { Controller, Post, Body, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Get, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { ProductsQueryDto } from './dtos/productsQueryDto.dto';
import { PaginationResult } from 'src/users/interfaces/paginationMeta.interface';
import { Roles } from 'src/decorators/rolesUser.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('products')
export class ProductsController {
  constructor (private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
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
}