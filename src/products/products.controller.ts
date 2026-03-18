import { Controller, Post, Body, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { ProductsService } from './products.service';
import { Product } from './products.entity';

@Controller('products')
export class ProductsController {
  constructor (private readonly productsService: ProductsService) {}

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
}