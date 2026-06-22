import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Order } from './orders.entity';
import { Product } from '../products/products.entity';

@Entity({
  name: 'order_details'
})
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => Order, order => order.details, { onDelete: 'CASCADE' })
  @JoinColumn({name: 'order_id'})
  order!: Order;

  @Index()
  @ManyToOne(() => Product, product => product.orderDetails)
  @JoinColumn({name: 'product_id'})
  product!: Product;

  @Column()
  quantity!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  price!: number;
}