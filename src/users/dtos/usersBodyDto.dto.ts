import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches} from 'class-validator';

export class UsersBodyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    {
  message:
    'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
}
  )
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone: string;
    
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(50)
  country: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(80)
  address: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(50)
  city: string;
}