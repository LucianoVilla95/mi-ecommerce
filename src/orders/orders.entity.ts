import { User } from 'src/users/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { OrderDetail } from './orderDetails.entity';

@Entity({
  name: 'orders'
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({name: 'user_id'})
  user: User;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order)
  details: OrderDetail[];

  @Column()
  date: Date;

  @Column({name: 'is_active', default: true})
  isActive: boolean;
}