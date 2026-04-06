import { Inject, Injectable } from "@nestjs/common";
import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from "mercadopago";
import { Order } from "../orders/orders.entity";

@Injectable()
export class MercadoPagoService {
  constructor (@Inject('MP_CLIENT') private client: MercadoPagoConfig) {}

  async createPreference(order: Order) {
    const preference = new Preference(this.client)
    
    const response = await preference.create({
      body: {
        items: order.details.map(item => ({
          id: item.product.id,
          title: item.product.name,
          description: item.product.description,
          quantity: item.quantity,
          unit_price: Number(item.price)
        })),
        external_reference: order.id.toString(),
        notification_url: 'https://hien-homophonic-negatively.ngrok-free.dev/orders/webhook/mercadopago',
        back_urls: {
          success: 'https://hien-homophonic-negatively.ngrok-free.dev/orders/payment/success',
          failure: 'https://hien-homophonic-negatively.ngrok-free.dev/payment/failure',
          pending: 'https://hien-homophonic-negatively.ngrok-free.dev/payment/pending',
        },
        auto_return: 'approved',
      },
    });
    
    return response;
  }

  async getPayment(paymentId: number) {
    const payment = new Payment(this.client);
    
    return await payment.get({ id: paymentId });
  } 

  async getMerchantOrder(merchantOrderId: number) {
    const merchantOrder = new MerchantOrder(this.client);

    return await merchantOrder.get({ merchantOrderId: merchantOrderId })
  }
}