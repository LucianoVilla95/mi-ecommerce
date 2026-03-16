import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { v4 as uuid } from 'uuid';
import { Product } from "src/products/products.entity";

@Entity({
  name: 'categories'
})
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({length: 50, nullable: false})
  name: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}