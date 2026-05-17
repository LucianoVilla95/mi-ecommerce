import { PickType } from "@nestjs/swagger"
import { UsersBodyDto } from "./usersBodyDto.dto";

export class ForgotPasswordDto extends PickType(UsersBodyDto, ['email']) {}