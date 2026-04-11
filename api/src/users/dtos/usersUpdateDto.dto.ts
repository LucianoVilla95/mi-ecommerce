import { PartialType } from "@nestjs/swagger";
import { UsersBodyDto } from "./usersBodyDto.dto";

export class UsersUpdateDto extends PartialType(UsersBodyDto) {};