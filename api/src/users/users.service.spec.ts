import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { ResendService } from '../resend/resend.service';
import { UsersRepository } from './users.repository';
import { User } from './users.entity';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { ResetPasswordDto } from './dtos/resetPasswordDto.dto';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { ForgotPasswordDto } from './dtos/forgotPasswordDto.dto';
import { UsersQueryDto } from './dtos/usersQueryDto.dto';
import { ConflictException, BadRequestException, InternalServerErrorException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from './enums/userRole.enum';
import { Order } from '../orders/orders.entity';
import { UsersUpdateDto } from './dtos/usersUpdateDto.dto';

jest.mock('bcrypt');
jest.mock('crypto');

describe('UsersService', () => {
  let usersService: UsersService;
  let mockResendService: Partial<ResendService> & {
    sendResetPasswordEmail: jest.Mock;
  };
  let mockUsersRepository: Partial<UsersRepository> & {
  getUserByEmail: jest.Mock;
  signUp: jest.Mock;
  updateUser: jest.Mock;
  getUsers: jest.Mock;
  getUserById: jest.Mock;
  deleteUser: jest.Mock;
  };
  let mockJwtService: Partial<JwtService> & {sign: jest.Mock};

  const mockUserDto: UsersBodyDto = {
    name: 'francisco',
    email: 'francisco@gmail.com',
    password: 'Francisco90@',
    phone: '388655244',
    country: 'Argentina',
    address: 'Las Violetas 500',
    city: 'Libertador General San Martin',
    role: UserRole.USER
  }

  const mockCreatedUser: Omit<User, 'password'> = {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    name: mockUserDto.name,
    email: mockUserDto.email,
    phone: mockUserDto.phone,
    country: mockUserDto.country,
    address: mockUserDto.address,
    city: mockUserDto.city,
    role: UserRole.USER,
    resetToken: null,
    resetTokenExpires: null,
    isBlocked: false,
    isDeleted: false,
    orders: [] as Order[]
  };

  const mockDbUser: User = {
    id: mockCreatedUser.id,
    name: mockUserDto.name,
    email: mockUserDto.email,
    password: 'hashed_password_in_db', 
    phone: mockUserDto.phone,
    country: mockUserDto.country,
    address: mockUserDto.address,
    city: mockUserDto.city,
    role: UserRole.USER,
    resetToken: null,
    resetTokenExpires: null,
    isBlocked: false,
    isDeleted: false,
    orders: [] as Order[]
  }
  
  beforeEach(async () => {
    mockUsersRepository = {
      getUserByEmail: jest.fn(),
      signUp: jest.fn(),
      updateUser: jest.fn(),
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      deleteUser: jest.fn()
    };

    mockResendService = {
      sendResetPasswordEmail: jest.fn()
    }

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository
        },
        {
          provide: ResendService,
          useValue: mockResendService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ],
    }).compile();
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockReset(); 
  });
  
  it('Create an instance of UsersService', async () => {  
    expect(usersService).toBeDefined();
  });

  describe('signUp', () => {

    // --- CASO 1: CAMINO FELIZ ---
    it('should successfully register a user without the password', async () => {
      // Configuramos los comportamientos usando mockResolvedValue
      mockUsersRepository.getUserByEmail.mockResolvedValue(null); // No existe
      bcrypt.hash.mockResolvedValue(mockDbUser.password); // Hashea bien
      mockUsersRepository.signUp.mockResolvedValue(mockCreatedUser); // Guarda bien
      
      const result = await usersService.signUp(mockUserDto);
      
      expect(result).toEqual(mockCreatedUser);
      expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(mockUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserDto.password, 10);
      expect(mockUsersRepository.signUp).toHaveBeenCalledWith({
        ...mockUserDto,
        password: mockDbUser.password,
      });
    });

    // --- CASO 2: EMAIL YA REGISTRADO ---
    it('should throw ConflictException if the email already exists', async () => {
      mockUsersRepository.getUserByEmail.mockResolvedValue(mockDbUser);

      await expect(usersService.signUp(mockUserDto)).rejects.toThrow(new ConflictException('Email already registered'));
      
      // Verificamos que el proceso se detuvo y no intentó hashear ni guardar
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersRepository.signUp).not.toHaveBeenCalled();
    });

    // --- CASO 3: ERROR EN BCRYPT ---
    it('should throw BadRequestException if the password could not be hashed', async () => {
      mockUsersRepository.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(null); // Retorna falso/nulo
      
      await expect(usersService.signUp(mockUserDto)).rejects.toThrow(new BadRequestException('Password could not be hashed'));
      expect(mockUsersRepository.signUp).not.toHaveBeenCalled();
    });

    // --- CASO 4: ERROR IMPREVISTO (BASE DE DATOS CAÍDA, ETC) ---
    it('should throw InternalServerErrorException when an unexpected generic error occurs', async () => {
      
      mockUsersRepository.getUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(mockDbUser.password);

      // Simulamos un crash de la base de datos usando mockRejectedValue
      mockUsersRepository.signUp.mockRejectedValue(new Error('DB Connection Timeout'));

      // Silenciamos el console.log en este test para no ensuciar la consola de Jest
      jest.spyOn(console, 'log').mockImplementation(() => {});
      await expect(usersService.signUp(mockUserDto)).rejects.toThrow(new InternalServerErrorException('Error creating user'));
    });
  });

  describe('signIn', () => {

    const mockCredentialsDto: UsersCredentialsDto = {
      email: mockUserDto.email,
      password: mockUserDto.password,
    };

     // --- CASO 1: LOGIN EXITOSO ---
    it('should authenticate the user and return an access token with user data', async () => {
      const mockToken: string = 'jwt_token_generado_xyz';

      // Configuramos los mocks para el camino feliz
      mockUsersRepository.getUserByEmail.mockResolvedValue(mockDbUser);
      bcrypt.compare.mockResolvedValue(true); // Contraseña correcta
      mockJwtService.sign.mockReturnValue(mockToken); // sign suele ser síncrono, usamos mockReturnValue

      const result = await usersService.signIn(mockCredentialsDto);

      // Verificaciones del resultado
      expect(result).toEqual({
        user: {
          id: mockDbUser.id,
          email: mockDbUser.email,
          role: UserRole.USER,
        },
        access_token: mockToken,
      });

      // Verificaciones de llamadas
      expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(mockCredentialsDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockCredentialsDto.password, mockDbUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockDbUser.id,
        email: mockDbUser.email,
        role: UserRole.USER,
        isBlocked: false,
      });
    });

     // --- CASO 2: USUARIO NO ENCONTRADO ---
    it('should throw UnauthorizedException if the email does not exist in the database', async () => {
      mockUsersRepository.getUserByEmail.mockResolvedValue(null); // No existe el usuario

      await expect(usersService.signIn(mockCredentialsDto)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
      
      // Detiene la ejecución: no debe comparar contraseñas ni firmar tokens
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    // --- CASO 3: CONTRASEÑA INCORRECTA ---
    it('should throw UnauthorizedException if the password does not match', async () => {
      mockUsersRepository.getUserByEmail.mockResolvedValue(mockDbUser);
      bcrypt.compare.mockResolvedValue(false); // Contraseña incorrecta

      await expect(usersService.signIn(mockCredentialsDto)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    // --- CASO 4: ERROR INTERNO GENÉRICO ---
    it('should throw InternalServerErrorException upon an unexpected failure', async () => {
      // Forzamos un error en la búsqueda para disparar el catch general
      mockUsersRepository.getUserByEmail.mockRejectedValue(new Error('Conexión perdida'));

      // Silenciamos el console.log en la terminal de Jest para este test
      jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(usersService.signIn(mockCredentialsDto)).rejects.toThrow(new InternalServerErrorException('Login error'));
    });
  });

  describe('forgotPassword', () => {

    const mockEmailDto: ForgotPasswordDto = {email: mockUserDto.email}
    const successMessage = {
      message: 'We have sent the link to the email address you provided, please check your inbox.',
    };

    // --- CASO 1: EL EMAIL NO EXISTE (CAMINO SEGURO) ---
    it('should return a success message immediately if the email does not exist (for security)', async () => {
      mockUsersRepository.getUserByEmail.mockResolvedValue(null);

      const result = await usersService.forgotPassword(mockEmailDto);

      expect(result).toEqual(successMessage);
      
      // Verificamos que NO se generó token, ni se guardó en BD, ni se envió correo
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
      expect(mockResendService.sendResetPasswordEmail).not.toHaveBeenCalled();
    });

    // --- CASO 2: EL EMAIL SÍ EXISTE (FLUJO COMPLETO) ---
    it('should generate the token, hash it, save it in the DB, and send the email with the unhashed token', async () => {
      const fakeToken = 'fake_crypto_token_hex_32_bytes';
      const fakeHashedToken = 'hashed_crypto_token_xyz';

      // 1. Forzamos a crypto a devolver nuestro token controlado
      jest.spyOn(crypto, 'randomBytes').mockReturnValue({
        toString: jest.fn().mockReturnValue(fakeToken),
      } as any);

      // 2. Configuramos el resto de mocks
      mockUsersRepository.getUserByEmail.mockResolvedValue(mockDbUser);
      bcrypt.hash.mockResolvedValue(fakeHashedToken);
      mockUsersRepository.updateUser.mockResolvedValue(true);
      mockResendService.sendResetPasswordEmail.mockResolvedValue(true);

      // 3. Ejecutamos el método
      const result = await usersService.forgotPassword(mockEmailDto);

      // 4. Aserciones del resultado
      expect(result).toEqual(successMessage);

      // 5. Verificamos que se guardaron los datos correctos en la BD
      expect(mockUsersRepository.updateUser).toHaveBeenCalledWith(
        mockDbUser,
        expect.objectContaining({
          resetToken: fakeHashedToken,
          resetTokenExpires: expect.any(Date), // Valida que sea un objeto Fecha
        }),
      );

      // 6. Verificamos que el email se envía con el token ORIGINAL (sin hashear)
      expect(mockResendService.sendResetPasswordEmail).toHaveBeenCalledWith(
        mockDbUser.id,
        mockDbUser.email,
        fakeToken,
      );
    })
  });

  describe('resetPassword', () => {

    const mockResetPasswordDto: ResetPasswordDto = {
      userId: mockCreatedUser.id,
      token: 'raw_token_from_email',
      password: 'new_secret_password_123',
    };

    const mockUserFromDb: Omit<User, 'password'> = {
      id: mockCreatedUser.id,
      name: mockUserDto.name,
      email: mockUserDto.email,
      phone: mockUserDto.phone,
      country: mockUserDto.country,
      address: mockUserDto.address,
      city: mockUserDto.city,
      role: UserRole.USER,
      resetToken: 'hashed_token_in_db',
      resetTokenExpires: new Date(Date.now() + 1000 * 60 * 15), // Vence en 15 minutos (VÁLIDO)
      isBlocked: false,
      isDeleted: false,
      orders: [] as Order[]
    };

    // --- CASO 1: ÉXITO ---
    it('should successfully update the password and clear the reset fields', async () => {
      const mockNewHashedPassword = 'new_hashed_password_xyz';

      // 1. Espiamos el método interno del mismo servicio
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserFromDb);
      
      // 2. Configuramos bcrypt y el repositorio
      bcrypt.compare.mockResolvedValue(true); // El token coincide
      bcrypt.hash.mockResolvedValue(mockNewHashedPassword);
      mockUsersRepository.updateUser.mockResolvedValue(true);

      const result = await usersService.resetPassword(mockResetPasswordDto);

      // 3. Aserciones
      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(usersService.getUserById).toHaveBeenCalledWith(mockResetPasswordDto.userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockResetPasswordDto.token, mockUserFromDb.resetToken);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockResetPasswordDto.password, 10);
      
      // Verificamos que se guarden los campos limpios (null)
      expect(mockUsersRepository.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockResetPasswordDto.userId }),
        {
          password: mockNewHashedPassword,
          resetToken: null,
          resetTokenExpires: null,
        }
      );
    });

    // --- CASO 2: EL USUARIO NO TIENE TOKEN REGISTRADO ---
    it('should throw BadRequestException if the user did not request a reset (no token in DB)', async () => {
      const userWithoutToken: Omit<User, 'password'> = { ...mockUserFromDb, resetToken: null, resetTokenExpires: null };
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(userWithoutToken);

      await expect(usersService.resetPassword(mockResetPasswordDto)).rejects.toThrow(new BadRequestException('Invalid token'));
      
      // El flujo se detiene inmediatamente
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
    });

    // --- CASO 3: EL TOKEN NO COINCIDE ---
    it('should throw BadRequestException if the provided token does not match the one in the DB', async () => {
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserFromDb);
      bcrypt.compare.mockResolvedValue(false); // Token incorrecto

      await expect(usersService.resetPassword(mockResetPasswordDto)).rejects.toThrow(new BadRequestException('Invalid token'));
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
    });

    // --- CASO 4: EL TOKEN HA EXPIRADO ---
    it('should throw BadRequestException if the token has already expired', async () => {
      const expiredUser: Omit<User, 'password'> = {
        ...mockUserFromDb,
        resetTokenExpires: new Date(Date.now() - 1000 * 60 * 5), // Expiró hace 5 minutos
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(expiredUser);
      bcrypt.compare.mockResolvedValue(true); // El token era correcto pero viejo

      await expect(usersService.resetPassword(mockResetPasswordDto)).rejects.toThrow(new BadRequestException('Expired token'));
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {

    const mockRawUsers: Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>[] = [
      {
        id: '4a8b2c1d-9e3f-4a5b-8c7d-1e2f3a4b5c6d',
        name: 'Alice',
        email: 'alice@test.com',
        phone: '123',
        country: 'Arg',
        address: 'Calle 1',
        city: 'CABA',
        role: UserRole.USER,
        isBlocked: false,
        isDeleted: false,
        orders: [] as Order[],
      },
      {
        id: '2b57b980-87a2-4a57-8df2-8e1104e76a96',
        name: 'Bob',
        email: 'bob@test.com',
        phone: '456',
        country: 'Arg',
        address: 'Calle 2',
        city: 'CABA',
        role: UserRole.USER,
        isBlocked: false,
        isDeleted: false,
        orders: [] as Order[],
      }
    ];

    // --- CASO 1: PARÁMETROS CORRECTOS Y MAPEO DE DATOS ---
    it('should return paginated users omitting passwords and reset data', async () => {
      const mockQueryDto: UsersQueryDto = { page: 2, limit: 10 };
      const totalCount = 25;
      
      // El repositorio devuelve la tupla [ArrayDeUsuarios, TotalElementos]
      mockUsersRepository.getUsers.mockResolvedValue([mockRawUsers, totalCount]);

      const result = await usersService.getUsers(mockQueryDto);

      // Verificamos que se calculó bien el skip: (page - 1) * limit => (2 - 1) * 10 = 10
      expect(mockUsersRepository.getUsers).toHaveBeenCalledWith(10, 10);

      // Verificamos la estructura final y los cálculos de las páginas
      expect(result).toEqual({
        data: [
          expect.not.objectContaining({ password: expect.any(String), resetToken: expect.any(String) }),
          expect.not.objectContaining({ password: expect.any(String) })
        ],
        meta: {
          total: 25,
          currentPage: 2,
          lastPage: 3, // Math.ceil(25 / 10) = 3
        }
      });
    });

    // --- CASO 2: VALORES POR DEFECTO (QUERY VACÍA O CON CEROS) ---
    it('should apply default values if page or limit are invalid or null', async () => {
      const mockQueryDto: UsersQueryDto = { page: 0, limit: -5 }; // Valores extraños o ceros
      mockUsersRepository.getUsers.mockResolvedValue([[], 0]);

      await usersService.getUsers(mockQueryDto);

      // Valores por defecto esperados: pageSize = 10, skip = (1 - 1) * 10 = 0
      expect(mockUsersRepository.getUsers).toHaveBeenCalledWith(10, 0);
    });

    // --- CASO 3: TOPE MÁXIMO DE LÍMITE ---
    it('should cap the page size to a maximum of 100 items', async () => {
      const mockQueryDto = { page: 1, limit: 500 }; // Excede el límite de 100
      mockUsersRepository.getUsers.mockResolvedValue([[], 0]);

      await usersService.getUsers(mockQueryDto);

      // Tu código hace Math.min(limit, 100), por lo que debe enviar 100 al repositorio
      expect(mockUsersRepository.getUsers).toHaveBeenCalledWith(100, 0);
    });

    // --- CASO 4: CONTROL DE EXCEPCIONES ---
    it('should throw InternalServerErrorException if the repository fails', async () => {
      mockUsersRepository.getUsers.mockRejectedValue(new Error('Database disconnect'));

      // Silenciamos console.error para no ensuciar el reporte de Jest
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(usersService.getUsers({ page: 1, limit: 10 })).rejects.toThrow(new InternalServerErrorException('Could not get users at this time'));
    });
  });

  describe('getUserById', () => {

    // --- CASO 1: CAMINO FELIZ ---
    it('should return the user if they exist in the DB', async () => {
      // Configuramos el repositorio mock para devolver el usuario limpio
      mockUsersRepository.getUserById.mockResolvedValue(mockCreatedUser);

      const result = await usersService.getUserById(mockCreatedUser.id);

      // Verificaciones
      expect(result).toEqual(mockCreatedUser);
      expect(mockUsersRepository.getUserById).toHaveBeenCalledWith(mockCreatedUser.id);
    });

    // --- CASO 2: USUARIO NO ENCONTRADO ---
    it('should throw a NotFoundException if the user does not exist', async () => {
      // Forzamos al repositorio a devolver null
      mockUsersRepository.getUserById.mockResolvedValue(null);

      // Verificamos que lance la excepción correcta con el mensaje esperado
      await expect(usersService.getUserById(mockCreatedUser.id)).rejects.toThrow(new NotFoundException('User not found'));
      
      expect(mockUsersRepository.getUserById).toHaveBeenCalledWith(mockCreatedUser.id);
    });
  });

  describe('updateUser', () => {

    const mockUpdateDto: UsersUpdateDto = {
      name: 'John Updated',
      email: 'newemail@example.com',
      phone: '987654321',
      country: 'Argentina',
      address: 'Nueva Calle 456',
      city: 'CABA',
      role: UserRole.USER,
    };

    const successMessage = { message: 'User updated successfully' };

    // --- CASO 1: ACTUALIZACIÓN EXITOSA (CAMBIANDO EMAIL DISPONIBLE) ---
    it('should successfully update the user if the new email is not registered by anyone else', async () => {
      // 1. El usuario existe
      mockUsersRepository.getUserById.mockResolvedValue(mockCreatedUser);
      // 2. Al buscar el nuevo email, no lo tiene nadie (null)
      mockUsersRepository.getUserByEmail.mockResolvedValue(null);
      // 3. El repositorio actualiza con éxito
      mockUsersRepository.updateUser.mockResolvedValue(successMessage);

      const result = await usersService.updateUser(mockCreatedUser.id, mockUpdateDto);

      expect(result).toEqual(successMessage);
      expect(mockUsersRepository.getUserById).toHaveBeenCalledWith(mockCreatedUser.id);
      expect(mockUsersRepository.getUserByEmail).toHaveBeenCalledWith(mockUpdateDto.email);
      expect(mockUsersRepository.updateUser).toHaveBeenCalledWith(mockCreatedUser, mockUpdateDto);
    });

    // --- CASO 2: ACTUALIZACIÓN EXITOSA (MISMO EMAIL DEL PROPIO USUARIO) ---
    it('should allow the update if the found email belongs to the same user being updated', async () => {
      const updateDtoWithSameEmail: UsersUpdateDto = { ...mockUpdateDto, email: 'francisco@gmail.com' };
      
      mockUsersRepository.getUserById.mockResolvedValue(mockCreatedUser);
      // El email ya existe, pero le pertenece a él mismo (mismo ID)
      mockUsersRepository.getUserByEmail.mockResolvedValue(mockDbUser);
      mockUsersRepository.updateUser.mockResolvedValue(successMessage);

      const result = await usersService.updateUser(mockCreatedUser.id, updateDtoWithSameEmail);

      expect(result).toEqual(successMessage);
      // Valida que no arrojó la excepción de conflicto porque los IDs coinciden
      expect(mockUsersRepository.updateUser).toHaveBeenCalled();
    });

    // --- CASO 3: USUARIO A ACTUALIZAR NO EXISTE ---
    it('should throw NotFoundException if the user to be updated does not exist in the DB', async () => {
      mockUsersRepository.getUserById.mockResolvedValue(null);

      await expect(usersService.updateUser(mockCreatedUser.id, mockUpdateDto)).rejects.toThrow(new NotFoundException('User not found'));
      
      // Detiene la ejecución de inmediato
      expect(mockUsersRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
    });

    // --- CASO 4: CONFLICTO DE EMAIL (YA LE PERTENECE A OTRO) ---
    it('should throw ConflictException if the new email already belongs to a different user', async () => {
      const mockOtherUser: User = {
        id: 'other-uuid-999',
        name: 'Martin',
        email: 'newemail@example.com',
        password: 'hashed_password_in_db', 
        phone: '3886665544',
        country: 'Argentina',
        address: 'Avenida 9 Julio',
        city: 'Ledesma',
        role: UserRole.USER,
        resetToken: null,
        resetTokenExpires: null,
        isBlocked: false,
        isDeleted: false,
        orders: [] as Order[]
      };

      mockUsersRepository.getUserById.mockResolvedValue(mockCreatedUser);
      // El email lo tiene "other-uuid-999", que es diferente a "user-uuid-123"
      mockUsersRepository.getUserByEmail.mockResolvedValue(mockOtherUser);

      await expect(usersService.updateUser(mockCreatedUser.id, mockUpdateDto)).rejects.toThrow(new ConflictException('Email already registered'));
      
      // No debe llegar a disparar el método de actualización del repositorio
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {

    const mockAdminUser: Omit<User, 'password'> = {
      id: 'admin-uuid-999',
      name: 'Super Admin',
      email: 'admin@gmail.com',
      phone: '3886998877',
      country: 'Argentina',
      address: 'Mariano Moreno',
      city: 'Ledesma',
      role: UserRole.ADMIN,
      resetToken: null,
      resetTokenExpires: null,
      isBlocked: false,
      isDeleted: false,
      orders: [] as Order[]
    };

    const successMessage = { message: 'User deleted successfully' };

    // --- CASO 1: ELIMINACIÓN EXITOSA ---
    it('should successfully delete the user if they exist and are not an admin', async () => {
      // 1. El usuario existe y es un usuario común
      mockUsersRepository.getUserById.mockResolvedValue(mockCreatedUser);
      // 2. El repositorio ejecuta el borrado con éxito
      mockUsersRepository.deleteUser.mockResolvedValue(successMessage);

      const result = await usersService.deleteUser(mockCreatedUser.id);

      expect(result).toEqual(successMessage);
      expect(mockUsersRepository.getUserById).toHaveBeenCalledWith(mockCreatedUser.id);
      expect(mockUsersRepository.deleteUser).toHaveBeenCalledWith(mockCreatedUser);
    });

    // --- CASO 2: USUARIO NO EXISTE ---
    it('should throw a NotFoundException if the user to be deleted does not exist', async () => {
      mockUsersRepository.getUserById.mockResolvedValue(null);

      await expect(usersService.deleteUser(mockCreatedUser.id)).rejects.toThrow(new NotFoundException('User not found'));
      
      // Cortocircuito: No debe intentar verificar el rol ni llamar al repositorio para borrar
      expect(mockUsersRepository.deleteUser).not.toHaveBeenCalled();
    });

    // --- CASO 3: INTENTO DE BORRAR UN ADMINISTRADOR ---
    it('should throw a ForbiddenException if an attempt is made to delete an admin', async () => {
      // Forzamos a que devuelva un usuario con rol ADMIN
      mockUsersRepository.getUserById.mockResolvedValue(mockAdminUser);

      await expect(usersService.deleteUser(mockAdminUser.id)).rejects.toThrow(new ForbiddenException('Cannot delete admin users'));
      
      // Cortocircuito: El flujo muere en la validación y nunca toca el método deleteUser del repositorio
      expect(mockUsersRepository.deleteUser).not.toHaveBeenCalled();
    });
  });
});

    



