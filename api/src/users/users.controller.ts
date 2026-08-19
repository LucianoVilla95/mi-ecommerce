import { Controller, Post,Get, Patch, Delete, Body, UseGuards, Query, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { UsersBodyDto } from './dtos/usersBodyDto.dto';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { UsersCredentialsDto } from './dtos/usersCredentialsDto.dto';
import { AuthResponseDto } from './dtos/authResponse.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import { JwtPayload } from './dtos/jwtPayload.dto';
import { Roles } from '../decorators/rolesUser.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UsersQueryDto } from './dtos/usersQueryDto.dto';
import { UsersUpdateDto } from './dtos/usersUpdateDto.dto';
import { PaginationResult } from './interfaces/paginationMeta.interface';
import { ForgotPasswordDto } from './dtos/forgotPasswordDto.dto';
import { ResetPasswordDto } from './dtos/resetPasswordDto.dto';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Registrar un nuevo usuario', description: 'Crea una cuenta de usuario en el sistema.' })
  @ApiResponse({ status: 201, description: 'Usuario registrado con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos o el correo ya existe.' })
  async signUp(@Body() body: UsersBodyDto): Promise<Omit<User, 'password'>> {
    return await this.usersService.signUp(body);
  }

  @Post('signin')
  @ApiOperation({ 
    summary: 'Iniciar sesión', 
    description: 'Autentica al usuario, genera un token JWT y lo inyecta automáticamente en una cookie HTTP-only.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Autenticación exitosa. Retorna los datos del usuario. La cookie access_token se ha configurado.' 
  })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
  async signIn(@Body() body: UsersCredentialsDto, @Res({ passthrough: true }) response: Response): Promise<Omit<AuthResponseDto, 'access_token'>> {
    const authData: AuthResponseDto = await this.usersService.signIn(body);
    console.log(authData.access_token)
    response.cookie('access_token', authData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    })

    return {
      user: authData.user,
    }
  }
  
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña', description: 'Envía un correo con un token de recuperación.' })
  @ApiResponse({ status: 200, description: 'Correo de recuperación enviado con éxito.' })
  @ApiResponse({ status: 404, description: 'No existe un usuario con ese correo.' })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<{message: string}> {
    return await this.usersService.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña', description: 'Cambia la contraseña utilizando el token recibido.' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'El token ha expirado o es inválido.' })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{message: string}> {
    return await this.usersService.resetPassword(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Obtener lista de usuarios (Solo Admin)', description: 'Retorna los usuarios paginados.' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida con éxito.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requieren permisos de administrador.' })
  async getUsers(@Query() query: UsersQueryDto): Promise<PaginationResult<Omit<User, 'password' | 'resetToken' | 'resetTokenExpires'>>> {
    return await this.usersService.getUsers(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario actual', description: 'Retorna los datos del usuario autenticado a partir de su token.' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Token faltante o inválido.' })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<Omit<User, 'password'>> {
    return await this.usersService.getUserById(user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un usuario', description: 'Modifica las propiedades permitidas de un usuario por su UUID.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del usuario a actualizar', type: String })
  @ApiResponse({ status: 200, description: 'Usuario actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'UUID inválido o datos del cuerpo incorrectos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async updateUser(@Param('id', new ParseUUIDPipe({ version: '4' })) id:string, @Body() body: UsersUpdateDto): Promise<{message: string}> {
    return await this.usersService.updateUser(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario (Solo Admin)', description: 'Elimina físicamente o lógicamente un usuario del sistema.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del usuario a eliminar', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado con éxito.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async deleteUser (@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<{message: string}> {
    return await this.usersService.deleteUser(id);
  }
}