import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRole } from '../users/enums/userRole.enum';
import { Order } from '../orders/orders.entity';

@Entity({
  name: 'users'
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({length: 50, nullable: false})
  name!: string;

  @Column({length: 50, nullable: false, unique: true})
  email!: string;

  @Column({length: 100, nullable: false})
  password!: string;

  @Column({length: 20})
  phone!: string;

  @Column({length: 50})
  country!: string;

  @Column()
  address!: string;

  @Column({length: 50})
  city!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role!: UserRole;

  @Column({type: 'varchar', nullable: true})
  resetToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires!: Date | null;

  @Column({name: 'is_blocked' ,default: false})
  isBlocked!: boolean;

  @Column({name: 'is_deleted' ,default: false})
  isDeleted!: boolean;

  @OneToMany(() => Order, order => order.user)
  orders!: Order[];
}