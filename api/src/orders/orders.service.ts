import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { Order } from './orders.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { AddProductsDto } from './dtos/addProductDto.dto';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/products.entity';
import { JwtPayload } from '../users/dtos/jwtPayload.dto';
import { DataSource, EntityManager, DeleteResult } from 'typeorm';
import { OrderDetail } from './orderDetails.entity';
import { RemoveProductsDto } from './dtos/removeProductDto.dto';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { AddToCartDto } from './dtos/addToCartDto.dto';

@Injectable()
export class OrdersService {
  constructor (private readonly ordersRepository: OrdersRepository,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
    private readonly mercadoPagoService: MercadoPagoService
  ) {}

  async getOrCreateOrder(sub: string, manager?: EntityManager): Promise<Order> {
      const user: Omit<User, 'password'> = await this.usersService.getUserById(sub);
      
      let order: Order | null = await this.ordersRepository.getOrderByUser(user, manager);
      
      if (!order) order = await this.ordersRepository.createOrder(user, manager);
      
      return order;
  }

  async getOrderDetail(order: Order, product: Product, manager?: EntityManager) {
    const orderDetail: OrderDetail | null = await this.ordersRepository.getOrderDetail(order, product, manager);

    return orderDetail;
  }

  async mergeCart({sub}: JwtPayload, {items}: AddToCartDto): Promise<{message: string}> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const order: Order = await this.getOrCreateOrder(sub, manager);
      
      for (const item of items) {
        const product: Product = await this.productsService.getProductById(item.productId, manager);
        let orderDetailExisting: OrderDetail | null = await this.getOrderDetail(order, product, manager);

        if (orderDetailExisting) {
          const totalQuantity: number = orderDetailExisting.quantity + item.quantity;
        
          if (totalQuantity > product.stock) {
            orderDetailExisting.quantity = Math.min(totalQuantity, product.stock);
          } else {
            orderDetailExisting.quantity = totalQuantity;
          }
          await this.ordersRepository.updateOrderDetail(orderDetailExisting,manager);
          
        } else {
          await this.ordersRepository.createOrderDetail(order, product, item.quantity, product.price, manager);
        }
      }
      return {
        message: 'Products added successfully!',
      };
    });
  }

  async addProduct({sub}: JwtPayload, {productId, quantity}: AddProductsDto): Promise<{message: string}> {
    return await this.dataSource.transaction<{message: string}>(async (manager: EntityManager) => {
      const order: Order = await this.getOrCreateOrder(sub, manager);
      const product: Product = await this.productsService.getProductById(productId, manager);
      let orderDetailExisting: OrderDetail | null = await this.getOrderDetail(order, product, manager);

      if (orderDetailExisting) {
        const totalQuantity: number = orderDetailExisting.quantity + quantity;
        if (totalQuantity > product.stock) throw new BadRequestException('Insufficient stock');
        orderDetailExisting.quantity = totalQuantity;
        await this.ordersRepository.updateOrderDetail(orderDetailExisting, manager);
      } else {
        await this.ordersRepository.createOrderDetail(order, product, quantity, product.price, manager);
      }

      return {
        message: 'Product added successfully!'
      }
    });
  }

  async removeProduct(id: string, sub: string, manager?: EntityManager): Promise<{message: string}> {
    const user: Omit<User, 'password'> = await this.usersService.getUserById(sub);

    const order: Order | null = await this.ordersRepository.getOrderByUser(user, manager);

    if (!order) {
      throw new NotFoundException('No active shopping cart found for this user');
    }

    const result: DeleteResult = await this.ordersRepository.deleteOrderDetail(id, manager);

    if (!result.affected) throw new NotFoundException('Product not found in your shopping cart');

    return {
      message: 'Product removed successfully!'
    }
  }

  async updateQuantity({sub}: JwtPayload, id: string, {quantity}: RemoveProductsDto): Promise<{message: string}> {
    return await this.dataSource.transaction<{message: string}>(async (manager: EntityManager) => {
      const order: Order = await this.getOrCreateOrder(sub, manager);
      const product: Product = await this.productsService.getProductById(id, manager);
      const orderDetailExisting: OrderDetail | null = await this.getOrderDetail(order, product, manager);
      
      if (!orderDetailExisting) throw new NotFoundException('Product not in cart');

      if (quantity === 0) return await this.removeProduct(orderDetailExisting.id, sub, manager);

      if (quantity > product.stock) throw new BadRequestException('Insufficient stock');

      orderDetailExisting.quantity = quantity;
      await this.ordersRepository.updateOrderDetail(orderDetailExisting, manager);

      return {
        message: 'Cart updated successfully!'
      }
    });
  }

  async getOrder({sub}: JwtPayload): Promise<Omit<Order, 'user' | 'date' | 'isActive'> & {userId: string, total: number}> {
    const order: Order = await this.getOrCreateOrder(sub);

    const details = order.details || [];
    
    const total = details.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return {
      id: order.id,
      userId: sub,
      details: details,
      total,
    };
  }

  async getOrderById(id: string, manager?: EntityManager): Promise<Order> {
    const order: Order | null = await this.ordersRepository.getOrderById(id, manager);

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async checkout ({sub}: JwtPayload): Promise<{url: string}> {
    const order = await this.dataSource.transaction<Order>(async (manager: EntityManager) => {
      const activeOrder: Order = await this.getOrCreateOrder(sub, manager);

      if (!activeOrder.details || activeOrder.details.length === 0) {
        throw new NotFoundException('Empty cart');
      }

      for (const item of activeOrder.details) {
        const product: Product = await this.productsService.getProductById(item.product.id, manager);
        if (item.quantity > product.stock) throw new BadRequestException('Insufficient stock');
      }

      return activeOrder;
    });

    const preference = await this.mercadoPagoService.createPreference(order);

    if (!preference.init_point) throw new InternalServerErrorException('No payment URL generated');
    
    const url: string = preference.init_point;

    return {url};       
  }


  async processOrder(orderId: string) {
    await this.dataSource.transaction<void | {message: string}>(async (manager: EntityManager) => {
      const order: Order = await this.getOrderById(orderId, manager);
      if (!order.isActive) {
        return { message: 'Order already processed' };
      }
      for (const item of order.details) {
        const product = await this.productsService.getProductById(item.product.id, manager);
        if (product.stock < item.quantity) throw new BadRequestException(`Critical: Insufficient stock for product ${product.name} during processing`);
        product.stock -= item.quantity;
        await this.productsService.updateStock(product, manager);
      }
      order.isActive = false;
      await this.ordersRepository.updateOrder(order, manager)
    });
  }

  async handleWebhook(id: string, topic: string): Promise<{message: string}> {
    if (!id || !topic) {
      return { message: 'Invalid webhook data' };
    }

    if (topic !== 'payment') {
      return { message: `Topic ${topic} ignored` };
    }
    
    try {
      const payment = await this.mercadoPagoService.getPayment(Number(id));

      if (!payment.external_reference) {
        return { message: 'No external reference found in payment' };
      }

      if (payment.status !== 'approved') {
        return { message: `Payment not approved. Current status: ${payment.status}` };
      }

      await this.processOrder(payment.external_reference);

      return { message: 'Purchase made successfully' };

    } catch (error) {
      console.error('Webhook error:', error);
      
      throw new InternalServerErrorException('Error processing payment webhook');
    }
  }
}