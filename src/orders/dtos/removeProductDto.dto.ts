import { PickType } from "@nestjs/swagger";
import { AddProductsDto } from "./addProductDto.dto";

export class RemoveProductsDto extends PickType(AddProductsDto, ['quantity']) {}