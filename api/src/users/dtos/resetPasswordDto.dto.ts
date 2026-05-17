import { PickType } from '@nestjs/swagger';
import { UsersBodyDto } from "./usersBodyDto.dto";
import { IsNotEmpty, IsString, Length, Matches, IsUUID } from 'class-validator';

export class ResetPasswordDto extends PickType(UsersBodyDto, ['password']) {
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(64, 64)
  @Matches(/^[a-f0-9]+$/i)
  token!: string
}