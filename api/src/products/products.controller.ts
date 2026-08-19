import { Controller, Post, Body, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Get, Query, UseGuards, Patch, Param, ParseUUIDPipe, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsBodyDto } from './dtos/productsBodyDto.dto';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { ProductsQueryDto } from './dtos/productsQueryDto.dto';
import { PaginationResult } from '../users/interfaces/paginationMeta.interface';
import { Roles } from '../decorators/rolesUser.decorator';
import { JwtAuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ProductsUpdateDto } from './dtos/productsUpdateDto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiConsumes, ApiParam } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor (private readonly productsService: ProductsService) {}

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Crear un nuevo producto (Solo Admin)', 
    description: 'Registra un producto en la base de datos junto con su imagen de portada (Max 5MB, formatos: jpg, jpeg, png, webp).' 
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.', type: Product })
  @ApiResponse({ status: 400, description: 'Datos inválidos o archivo no permitido/muy pesado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol de administrador.' })

  async createProduct(@Body() body: ProductsBodyDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file: Express.Multer.File): Promise<Product> {
    return await this.productsService.createProduct(body, file);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de productos', description: 'Retorna una lista paginada de todos los productos disponibles.' })
  @ApiResponse({ status: 200, description: 'Lista de productos obtenida con éxito.' })
  async getProducts(@Query() query: ProductsQueryDto): Promise<PaginationResult<Product>> {
    return await this.productsService.getProducts(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar productos por nombre', description: 'Filtra y pagina los productos cuyo nombre coincida con el criterio de búsqueda.' })
  @ApiResponse({ status: 200, description: 'Resultados de la búsqueda obtenidos con éxito.' })
  async searchProducts(@Query() query: ProductsQueryDto): Promise<PaginationResult<Product>> {
    return await this.productsService.searchProductsByName(query);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Actualizar un producto existente (Solo Admin)', 
    description: 'Modifica las propiedades de un producto por su UUID. La imagen es opcional.' 
  })
  @ApiParam({ name: 'id', description: 'UUID v4 del producto a actualizar', type: String })
  @ApiResponse({ status: 200, description: 'Producto actualizado con éxito.' })
  @ApiResponse({ status: 400, description: 'UUID inválido o formato de archivo incorrecto.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async updateProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() body: ProductsUpdateDto, @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5}),
      new FileTypeValidator({fileType: /(jpg|jpeg|png|webp)$/})
    ]
  })) file?: Express.Multer.File): Promise<{message: string}> {
    return await this.productsService.updateProduct(id, body, file);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto (Solo Admin)', description: 'Elimina un producto del catálogo por su UUID.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del producto a eliminar', type: String })
  @ApiResponse({ status: 200, description: 'Producto eliminado con éxito.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  async deleteProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<{message: string}> {
    return await this.productsService.deleteProduct(id);
  }
}