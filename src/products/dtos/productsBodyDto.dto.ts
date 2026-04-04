import { IsNotEmpty, IsString, IsNumber, Min, Max, IsUUID, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductsBodyDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({maxDecimalPlaces: 2})
  @Min(1)
  @Max(99999999.99)
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  stock!: number;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsUUID('4')
  @IsString()
  categoryId!: string;

}