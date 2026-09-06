import { IsNotEmpty, IsString, IsNumber, Min, Max, IsUUID, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductsBodySwaggerDto {
  /**
   * Nombre comercial del producto
   * @example "Zapatillas Running Ultra"
   */
  @IsNotEmpty()
  @IsString()
  name!: string;

  /**
   * Descripción detallada de las características del producto
   * @example "Zapatillas ligeras con amortiguación premium ideales para maratones."
   */
  @IsNotEmpty()
  @IsString()
  description!: string;

  /**
   * Precio unitario del producto (acepta hasta 2 decimales)
   * @example 89.99
   */
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({maxDecimalPlaces: 2})
  @Min(1)
  @Max(99999999.99)
  price!: number;

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'Imagen de portada del producto (Max 5MB)' 
  })
  file: any;

  /**
   * Cantidad disponible en inventario (debe ser un número entero)
   * @example 50
   */
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  stock!: number;
  
  /**
   * Define si el producto está visible y disponible para la venta
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * Identificador único (UUID v4) de la categoría a la que pertenece el producto
   * @example "a3b0c2d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
   */
  @IsNotEmpty()
  @IsUUID('4')
  @IsString()
  categoryId!: string;
}