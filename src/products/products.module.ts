import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CategoriesModule } from 'src/categories/categories.module';


@Module({
  imports: [TypeOrmModule.forFeature([Product]), CloudinaryModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService]
})
export class ProductsModule {}