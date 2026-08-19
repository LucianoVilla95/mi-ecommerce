import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersQueryDto {
  /**
   * Número de página que se desea consultar.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  /**
   * Cantidad de registros a retornar por página.
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}