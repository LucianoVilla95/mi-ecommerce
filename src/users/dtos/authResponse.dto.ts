import { User } from '../users.entity';

export class AuthResponseDto {
  user: Omit<User, 'password'>;
  access_token: string
}