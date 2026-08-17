import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { UserRole } from './enums/userRole.enum';
import { UsersUpdateDto } from './dtos/usersUpdateDto.dto';

@Injectable()
export class UsersRepository {
  constructor (@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async getUserByEmail(email: string): Promise <User | null> {
    return await this.usersRepository.findOne({ where: { email, isDeleted: false }, relations: ['orders'] });
  }

  async signUp({name, email, password, phone, country, address, city, role = UserRole.USER}: UsersBodyDto): Promise<Omit<User, 'password'>> {
    const user: User = await this.usersRepository.create({name, email, password, phone, country, address, city, role});
    const result: User = await this.usersRepository.save(user);
    const {password: userPassword, ...userWithoutPassword} = result;
    return userWithoutPassword;
  }

  async getUsers (pageSize: number, skip: number): Promise<[Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>[], number]> {
    const [users, total]: [Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>[], number] = await this.usersRepository.findAndCount({
      skip: skip,
      take: pageSize,
      where: { isDeleted: false, role: UserRole.USER },
      relations: ['orders'],
      select: ['id', 'name', 'email', 'phone', 'country', 'address', 'city', 'role', 'isBlocked', 'isDeleted', 'orders']
    });

    return [users, total];
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>| null> {
    const user: Omit<User, 'password'> | null = await this.usersRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['orders'],
      select: ['id', 'name', 'email', 'phone', 'country', 'address', 'city', 'role', 'isBlocked', 'isDeleted', 'orders', 'resetToken', 'resetTokenExpires']
    });
    return user;
  }

  async updateUser(user: Omit<User, 'password'>, {name, email, password, phone, country, address, city, role = UserRole.USER, resetToken, resetTokenExpires}: UsersUpdateDto): Promise<{message: string}> {
    Object.assign(user, {name, email, password, phone, country, address, city, role, resetToken, resetTokenExpires})
    await this.usersRepository.save(user);

    return {
      message: 'User updated successfully'
    }
  }

  async deleteUser(user: Omit<User, 'password'>): Promise<{message: string}> {
    user.isDeleted = true;
    await this.usersRepository.save(user);
    
    return {
      message: 'User deleted successfully'
    };
  }
}