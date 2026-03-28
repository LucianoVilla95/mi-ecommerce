import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddProductsDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}