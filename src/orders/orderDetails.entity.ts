import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Order } from './orders.entity';
import { Product } from '../products/products.entity';

@Index(['order', 'product'], { unique: true })
@Entity({
  name: 'order_details'
})
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @ManyToOne(() => Order, order => order.details)
  @JoinColumn({name: 'order_id'})
  order!: Order;

  @ManyToOne(() => Product, product => product.orderDetails)
  @JoinColumn({name: 'product_id'})
  product!: Product;

  @Column()
  quantity!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false
  })
  price!: number;
}