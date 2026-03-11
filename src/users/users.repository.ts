import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { UserRole } from './enums/userRole.enum';

@Injectable()
export class UsersRepository {
  constructor (@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async getUserByEmail(email: string): Promise <User | null> {
    return await this.usersRepository.findOne({ where: { email, isDeleted: false } });
  }

  async signUp({name, email, password, phone, country, address, city, role = UserRole.USER}: UsersBodyDto): Promise<Omit<User, 'password'>> {
    const user: User = await this.usersRepository.create({name, email, password, phone, country, address, city, role});
    const result: User = await this.usersRepository.save(user);
    const {password: userPassword, ...userWithoutPassword} = result;
    return userWithoutPassword;
  }

  async getUsers (pageSize: number, skip: number): Promise<[Omit<User[], 'password'>, number]> {
    const [users, total]: [User[], number] = await this.usersRepository.findAndCount({
      skip: skip,
      take: pageSize,
      where: { isDeleted: false, role: UserRole.USER },
      select: ['id', 'name', 'email', 'phone', 'country', 'address', 'city', 'role', 'isBlocked', 'isDeleted']
    });

    return [users, total];
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>| null> {
    const user: Omit<User, 'password'> | null = await this.usersRepository.findOne({
      where: { id, isDeleted: false, isBlocked: false },
      select: ['id', 'name', 'email', 'phone', 'country', 'address', 'city', 'role', 'isBlocked', 'isDeleted']
    });
    return user;
  }

  async deleteUser(id: string): Promise<{message: string}> {
    await this.usersRepository.update(id, {
      isDeleted: true
    });

    return {
      message: 'User deleted successfully'
    };
  }
}