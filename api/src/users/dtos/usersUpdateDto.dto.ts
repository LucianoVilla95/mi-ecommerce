import { PartialType } from "@nestjs/swagger";
import { UsersBodyDto } from "./usersBodyDto.dto";
import { IsDate, IsOptional, IsString, ValidateIf } from "class-validator";
import { Type } from "class-transformer";

export class UsersUpdateDto extends PartialType(UsersBodyDto) {
  @IsOptional()
  @ValidateIf((Object, value) => value !== null)
  @IsString()
  resetToken?: string | null;

  @IsOptional()
  @ValidateIf((Object, value) => value !== null)
  @IsDate()
  @Type(() => Date)
  resetTokenExpires?: Date | null;
};