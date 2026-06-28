import { UsersQueryDto } from "../../users/dtos/usersQueryDto.dto";
import { IsOptional, IsString } from "class-validator";

export class ProductsQueryDto extends UsersQueryDto {

  @IsOptional()
  @IsString()
  name?: string;
}