import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from '../categories/categories.entity';
import { OrderDetail } from '../orders/orderDetails.entity';

@Entity({
  name: 'products'
})
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({length: 100, nullable: false})
  name!: string;

  @Column('text', {nullable: false})
  description!: string;

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

  @Column({nullable: false})
  stock!: number;

  @Column({name: 'img_url', default: 'https://emprendepyme.net/wp-content/uploads/2023/03/cualidades-producto.jpg'})
  imgUrl!: string;

  @Column({name: 'img_public_id'})
  imgPublicId!: string;

  @Column()
  slug!: string;

  @Column({name: 'is_active', default: true})
  isActive!: boolean;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({name: 'category_id'})
  category!: Category;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.product)
  orderDetails!: OrderDetail[];
}