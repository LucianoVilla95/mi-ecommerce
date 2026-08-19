import { PickType } from "@nestjs/swagger";
import { UsersBodyDto } from "./usersBodyDto.dto";
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class JwtPayload extends PickType(UsersBodyDto, ['email', 'role']) {
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  sub!: string;
  
  @IsBoolean()
  @IsNotEmpty()
  isBlocked!: boolean;
}