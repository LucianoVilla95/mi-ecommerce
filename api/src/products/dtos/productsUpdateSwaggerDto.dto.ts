import { PartialType } from "@nestjs/swagger";
import { ProductsBodySwaggerDto } from "./productsBodySwaggerDto.dto";

export class ProductsUpdateSwaggerDto extends PartialType(ProductsBodySwaggerDto) {}