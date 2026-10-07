import { PartialType } from "@nestjs/swagger";
import { ProductsBodySwaggerDto } from "./productsBodySwaggerDto.dto";
import { IsOptional } from "class-validator";

export class ProductsUpdateSwaggerDto extends PartialType(ProductsBodySwaggerDto) {}