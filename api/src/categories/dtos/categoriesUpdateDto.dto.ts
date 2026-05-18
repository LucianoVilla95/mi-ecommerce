import { PartialType } from "@nestjs/swagger";
import { CategoriesBodyDto } from "./categoriesBodyDto.dto";

export class CategoriesUpdateDto extends PartialType (CategoriesBodyDto) {}