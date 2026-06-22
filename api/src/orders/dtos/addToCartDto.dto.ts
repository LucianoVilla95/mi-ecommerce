import { AddProductsDto } from "./addProductDto.dto";
import { IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsArray({ message: 'Items must be an arrangement' })
  @ValidateNested({ each: true })
  @Type(() => AddProductsDto)
  items!: AddProductsDto[];
}