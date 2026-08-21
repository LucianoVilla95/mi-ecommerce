import { IsString, IsNotEmpty } from "class-validator";

export class CategoriesBodyDto {
  /**
   * Nombre único de la categoría de productos
   * @example "Electrónica"
   */
  @IsNotEmpty()
  @IsString()
  name!: string;
}