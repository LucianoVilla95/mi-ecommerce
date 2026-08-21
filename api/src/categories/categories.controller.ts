import { Body, Controller, Post, Get, UseGuards, UseInterceptors, Patch, Param, ParseUUIDPipe, ParseFilePipe, UploadedFile, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesBodyDto } from './dtos/categoriesBodyDto.dto';
import { Category } from './categories.entity';
import { JwtAuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/rolesUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesUpdateDto } from './dtos/categoriesUpdateDto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor (private readonly categoriesService: CategoriesService) {}

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Crear una nueva categoría (Solo Admin)', 
    description: 'Registra una categoría en el sistema junto con su imagen representativa (Máx 5MB, formatos: jpg, jpeg, png, webp).' 
  })
  @ApiResponse({ status: 201, description: 'Categoría creada con éxito.', type: Category })
  @ApiResponse({ status: 400, description: 'Datos del cuerpo inválidos o archivo no permitido/muy pesado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requieren permisos de administrador.' })
  async createCategory(@Body() body: CategoriesBodyDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file: Express.Multer.File): Promise<Category> {
    return await this.categoriesService.createCategory(body, file);
  }


  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías', description: 'Retorna un listado completo con todas las categorías activas en el sistema.' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida con éxito.', type: [Category] })
  async getCategories(): Promise<Category[]> {
    return await this.categoriesService.getCategories();
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Actualizar una categoría (Solo Admin)', 
    description: 'Modifica las propiedades de una categoría existente por su UUID. La nueva imagen es opcional.' 
  })
  @ApiParam({ name: 'id', description: 'UUID v4 de la categoría a actualizar', type: String })
  @ApiResponse({ status: 200, description: 'Categoría actualizada con éxito.' })
  @ApiResponse({ status: 400, description: 'UUID inválido o formato de archivo no soportado.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  async updateProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: CategoriesUpdateDto , @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file?: Express.Multer.File): Promise<{message: string}> {
    return await this.categoriesService.updateCategory(id, body, file);
  }
}