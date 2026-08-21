import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddProductsDto {
  /**
   * Identificador único (UUID v4) del producto que se desea añadir al carrito.
   * @example "b4c2a3d0-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  productId!: string;

  /**
   * Cantidad de unidades del producto que se van a agregar. Debe ser un número entero mayor o igual a 0.
   * @example 2
   */
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity!: number;
}