import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { v4 as uuid } from 'uuid';
import { Product } from "../products/products.entity";

@Entity({
  name: 'categories'
})
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({length: 50, unique: true, nullable: false})
  name!: string;

  @Column({unique: true})
  slug!: string;

  @OneToMany(() => Product, product => product.category)
  products!: Product[];
}