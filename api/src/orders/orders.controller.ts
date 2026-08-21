import { Body, Controller, Delete, Param, Post, UseGuards, ParseUUIDPipe, Patch, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddProductsDto } from './dtos/addProductDto.dto';
import { JwtAuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/currentUser.decorator';
import { JwtPayload } from '../users/dtos/jwtPayload.dto';
import { RemoveProductsDto } from './dtos/removeProductDto.dto';
import { Order } from './orders.entity';
import { AddToCartDto } from './dtos/addToCartDto.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor (private readonly ordersService: OrdersService) {}

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post('merge/cart')
  @ApiOperation({ 
    summary: 'Sincronizar carrito local con el servidor', 
    description: 'Une los productos que el usuario tenía guardados de forma local (ej: en el navegador) con su carrito activo en la base de datos.' 
  })
  @ApiResponse({ status: 200, description: 'Carritos sincronizados con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Token faltante o expirado.' })
  async mergeCart(@Body() body: AddToCartDto, @CurrentUser() user: JwtPayload): Promise<{message: string}> {
    return await this.ordersService.mergeCart(user, body);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Añadir producto al carrito', description: 'Agrega un producto o incrementa su cantidad en el carrito activo del usuario.' })
  @ApiResponse({ status: 201, description: 'Producto añadido al carrito con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos del cuerpo inválidos o stock insuficiente.' })
  async addProduct(@Body() body: AddProductsDto, @CurrentUser() user: JwtPayload): Promise<{message: string}> {
    return await this.ordersService.addProduct(user, body);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cantidad de un producto en el carrito', description: 'Modifica la cantidad de un artículo específico dentro de la orden actual.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del ítem o producto a modificar', type: String })
  @ApiResponse({ status: 200, description: 'Cantidad actualizada con éxito.' })
  @ApiResponse({ status: 404, description: 'El producto o el carrito no fue encontrado.' })
  async updateQuantity(@Param('id', new ParseUUIDPipe({ version: '4'})) id: string, @CurrentUser() user: JwtPayload, @Body() body: RemoveProductsDto): Promise<{message: string}> {
    return await this.ordersService.updateQuantity(user, id, body);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Quitar producto del carrito', description: 'Elimina por completo un artículo del carrito activo del usuario.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del ítem o producto a remover', type: String })
  @ApiResponse({ status: 200, description: 'Producto removido del carrito con éxito.' })
  async removeProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: JwtPayload): Promise<{message: string}> {
    return await this.ordersService.removeProduct(id, user.sub);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener el carrito activo', description: 'Retorna el detalle completo del carrito del usuario autenticado, calculando subtotales y total.' })
  @ApiResponse({ status: 200, description: 'Detalle del carrito obtenido con éxito.' })
  async getCart(@CurrentUser() user: JwtPayload): Promise<Omit<Order, 'user' | 'date' | 'isActive'> & {userId: string, total: number}> {
    return await this.ordersService.getOrder(user);
  }

  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @ApiOperation({ 
    summary: 'Iniciar proceso de pago (Checkout)', 
    description: 'Procesa el carrito actual y genera una preferencia de pago en Mercado Pago, retornando la URL de redirección para que el usuario pague.' 
  })
  @ApiResponse({ status: 200, description: 'Checkout generado. Retorna la URL del flujo de pago de Mercado Pago.' })
  @ApiResponse({ status: 400, description: 'El carrito está vacío o no se pudo procesar.' })
  checkout(@CurrentUser() user: JwtPayload): Promise<{url: string}> {
    return this.ordersService.checkout(user);
  }

  @Post('webhook/mercadopago')
  @ApiOperation({ 
    summary: 'Webhook de notificaciones de Mercado Pago', 
    description: 'Endpoint público que recibe notificaciones instantáneas de pago (IPN) de Mercado Pago para actualizar el estado de las órdenes en tiempo real.' 
  })
  @ApiResponse({ status: 200, description: 'Notificación recibida y procesada correctamente.' })
  handleWebhook(@Body() body: any, @Query() query: any): Promise<{message: string}> {
    console.log('Webhook recibido:', body, query);
    let paymentId: string | undefined;
    let topic: string | undefined;

    if (body.data?.id || body.type === 'payment' || query.topic === 'payment') {
      paymentId = body.data?.id || query.id || body.id;
      topic = query.topic || body.type;
    } else if (body.topic === 'merchant_order' || query.topic === 'merchant_order' || body.resource) {
      topic = body.topic || query.topic;
    
      if (body.resource) {
        const parts = body.resource.split('/');
        paymentId = parts[parts.length - 1];
      } else {
        paymentId = query.id || body.id;
      }
    } 
    console.log('Normalized:', { id: paymentId, topic: topic });
    if (!paymentId || topic !== 'payment') {
      return Promise.resolve({ message: 'Notification acknowledged but ignored' });
    }
    return this.ordersService.handleWebhook(paymentId, topic)
  }
}