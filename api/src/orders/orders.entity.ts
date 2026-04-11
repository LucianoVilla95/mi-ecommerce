import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from '../users/users.entity';
import { OrderDetail } from './orderDetails.entity';

@Index(['user', 'isActive'], { unique: true })
@Entity({
  name: 'orders'
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order)
  details!: OrderDetail[];

  @CreateDateColumn()
  date!: Date;

  @Column({name: 'is_active', default: true})
  isActive!: boolean;
}