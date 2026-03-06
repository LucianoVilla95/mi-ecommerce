import { PickType } from "@nestjs/swagger";
import { UsersBodyDto } from "./usersBodyDto.dto";


export class UsersCredentialsDto extends PickType(UsersBodyDto, ['email', 'password']) {}