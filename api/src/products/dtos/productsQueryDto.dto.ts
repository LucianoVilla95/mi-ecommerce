import { UsersQueryDto } from "../../users/dtos/usersQueryDto.dto";
import { IsOptional, IsString } from "class-validator";

export class ProductsQueryDto extends UsersQueryDto {
  /**
   * Criterio de búsqueda para filtrar los productos por su nombre (búsqueda parcial).
   * @example "Samsung Galaxy S23"
   */
  @IsOptional()
  @IsString()
  name?: string;
}