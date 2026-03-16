import { IsString, IsNotEmpty } from "class-validator";

export class CategoriesBodyDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}