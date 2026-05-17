import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { ResendModule } from '../resend/resend.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ResendModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService]
})
export class UsersModule {}