import { User } from '../users.entity';

export class AuthResponseDto {
  user: Omit<User, 'name' | 'password' | 'phone' | 'country' | 'address' | 'city' | 'isBlocked' | 'isDeleted' | 'orders'>
  access_token: string
}