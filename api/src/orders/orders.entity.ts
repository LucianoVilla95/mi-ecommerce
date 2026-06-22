import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { User } from '../users/users.entity';
import { OrderDetail } from './orderDetails.entity';

@Entity({
  name: 'orders'
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => User, user => user.orders,  { onDelete: 'CASCADE' })
  @JoinColumn({name: 'user_id'})
  user!: User;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, { cascade: true })
  details!: OrderDetail[];

  @CreateDateColumn()
  date!: Date;

  @Column({name: 'is_active', default: true})
  isActive!: boolean;
}