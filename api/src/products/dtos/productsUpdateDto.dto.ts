import { PartialType } from "@nestjs/swagger";
import { ProductsBodyDto } from "./productsBodyDto.dto";
import { IsOptional } from "class-validator";

export class ProductsUpdateDto extends PartialType(ProductsBodyDto) {
  @IsOptional()
  file?: any;
}