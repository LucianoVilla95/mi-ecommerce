import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CategoriesBodySwaggerDto {
  /**
   * Nombre único de la categoría de productos
   * @example "Electrónica"
   */
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ 
      type: 'string', 
      format: 'binary', 
      description: 'Imagen de portada del producto (Max 5MB)' 
  })
  file: any;
}