import { Injectable, ConflictException, BadRequestException, InternalServerErrorException, UnauthorizedException, NotFoundException, ForbiddenException, HttpException} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto } from './dtos/authResponse.dto';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { UsersQueryDto } from './dtos/usersQueryDto.dto';
import { PaginationResult } from './interfaces/paginationMeta.interface';
import { UserRole } from './enums/userRole.enum';
import { UsersUpdateDto } from './dtos/usersUpdateDto.dto';
import { ResendService } from '../resend/resend.service';
import { ForgotPasswordDto } from './dtos/forgotPasswordDto.dto';
import { ResetPasswordDto } from './dtos/resetPasswordDto.dto';

@Injectable()
export class UsersService {
  constructor (private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly resendService: ResendService
  ) {}

  async signUp({name, email, password, phone, country, address, city, role = UserRole.USER}: UsersBodyDto): Promise<Omit<User, 'password'>>  {
    try {
      const userExists: User | null = await this.usersRepository.getUserByEmail(email);
      
      if (userExists) throw new ConflictException('Email already registered');

      const hashedPassword: string = await bcrypt.hash(password, 10);

      if (!hashedPassword) throw new BadRequestException('Password could not be hashed');

      return await this.usersRepository.signUp({name, email, password: hashedPassword, phone, country, address, city, role});

    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async signIn({email, password}: UsersCredentialsDto): Promise<AuthResponseDto> {
    try {
      const dbUser: User | null = await this.usersRepository.getUserByEmail(email);

      if (!dbUser) throw new UnauthorizedException('Invalid credentials');

      const isPasswordValid: boolean = await bcrypt.compare(password, dbUser.password);

      if(!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

      const userPayload: JwtPayload = {
        sub: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        isBlocked: dbUser.isBlocked
      }

      const token: string = this.jwtService.sign(userPayload); 

      return {user: {id: dbUser.id, email: dbUser.email, role: dbUser.role }, access_token: token};

    } catch (error) {
      console.log(error);

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('Login error');
    }   
  }

  async forgotPassword({email}: ForgotPasswordDto): Promise<{message: string}> {
    const user: User | null = await this.usersRepository.getUserByEmail(email);
    if (!user) return {message: 'We have sent the link to the email address you provided, please check your inbox.'};

    const token: string = crypto.randomBytes(32).toString('hex');
    // console.log('TOKEN: ', token);

    const resetToken: string = await bcrypt.hash(token, 10);
    const resetTokenExpires: Date = new Date(Date.now() + 1000 * 60 * 15);

    await this.usersRepository.updateUser(user, {resetToken: resetToken, resetTokenExpires: resetTokenExpires});

    await this.resendService.sendResetPasswordEmail(user.id, email, token);

    return {
      message: 'We have sent the link to the email address you provided, please check your inbox.'
    }
  }

  async resetPassword({userId, token, password}: ResetPasswordDto): Promise<{message: string}> {
    const user: Omit<User, 'password'> = await this.getUserById(userId);

    if (!user.resetToken || !user.resetTokenExpires) throw new BadRequestException('Invalid token');
  
    const isValid: boolean = await bcrypt.compare(token, user.resetToken);

    if (!isValid) throw new BadRequestException('Invalid token');

    if (user.resetTokenExpires !== null && user.resetTokenExpires < new Date()) throw new BadRequestException('Expired token');

    const hashedPassword: string = await bcrypt.hash(password, 10);

    await this.usersRepository.updateUser(user, {password: hashedPassword, resetToken: null, resetTokenExpires: null});

    return { message: 'Password updated successfully' };
  }

  async getUsers({page, limit}: UsersQueryDto): Promise<PaginationResult<Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>>> {
    const currentPage: number = page && page > 0 ? page : 1;
    const pageSize: number = limit && limit > 0 ? Math.min(limit, 100) : 10;
    const skip: number = (currentPage - 1) * pageSize;
    
    try{
      const result: [Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>[], number] = await this.usersRepository.getUsers(pageSize, skip);

      const data: Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>[] = result[0].map((user: Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>): Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'> => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          address: user.address,
          city: user.city,
          role: user.role,
          isBlocked: user.isBlocked,
          isDeleted: user.isDeleted,
          orders: user.orders
        }
      });
      
      return {
        data: data,
        meta: {
          total: result[1],
          currentPage,
          lastPage: Math.ceil(result[1] / pageSize)
        }
      }

    } catch (error) {
      console.error('Error getting users:', error);
      
      throw new InternalServerErrorException('Could not get users at this time');
    }
  }

  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const user: Omit<User, 'password'> | null = await this.usersRepository.getUserById(id);
    
    if (!user) throw new NotFoundException(`User not found`);

    return user;
  }

  async updateUser(id: string, {name, email, phone, country, address, city, role = UserRole.USER}: UsersUpdateDto): Promise<{message: string}> {
    const user: Omit<User, 'password'> | null = await this.usersRepository.getUserById(id);
    if (!user) throw new NotFoundException('User not found');

    if (email) {
      const userExists: User | null = await this.usersRepository.getUserByEmail(email);
      if (userExists && userExists.id !== id) throw new ConflictException('Email already registered');
    }

    return await this.usersRepository.updateUser(user, {name, email, phone, country, address, city, role});
  }

  async deleteUser(id: string): Promise<{message: string}> {

    const user: Omit<User, 'password'> | null = await this.usersRepository.getUserById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.ADMIN) throw new ForbiddenException('Cannot delete admin users');

    return await this.usersRepository.deleteUser(user);
  }
}