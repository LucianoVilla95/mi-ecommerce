import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddProductDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}