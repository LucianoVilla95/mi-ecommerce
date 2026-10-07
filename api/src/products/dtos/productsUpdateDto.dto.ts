import { PartialType } from "@nestjs/swagger";
import { ProductsBodyDto } from "./productsBodyDto.dto";

export class ProductsUpdateDto extends PartialType(ProductsBodyDto) {}