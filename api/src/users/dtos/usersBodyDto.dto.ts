import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches, IsEnum} from 'class-validator';
import { UserRole } from '../enums/userRole.enum';

export class UsersBodyDto {
  /**
   * Nombre completo del usuario
   * @example "Juan Pérez"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name!: string;

  /**
   * Correo electrónico único para iniciar sesión
   * @example "juan.perez@example.com"
   */
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  /**
   * Contraseña segura. Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.
   * @example "SecurePass123!"
   */
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
  password!: string;

  /**
   * Número de teléfono de contacto
   * @example "+5491123456789"
   */
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone!: string;
    
  /**
   * País de residencia
   * @example "Argentina"
   */
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(50)
  country!: string;

  /**
   * Dirección física del domicilio
   * @example "Av. Siempreviva 742"
   */
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(80)
  address!: string;

  /**
   * Ciudad de residencia
   * @example "Buenos Aires"
   */
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(50)
  city!: string;

  /**
   * Rol asignado al usuario en el sistema
   * @example "user"
   */
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}