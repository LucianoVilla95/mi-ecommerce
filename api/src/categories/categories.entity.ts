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

  @Column({name: 'img_url', default: 'https://emprendepyme.net/wp-content/uploads/2023/03/cualidades-producto.jpg'})
  imgUrl!: string;

  @Column({name: 'img_public_id', nullable: true})
  imgPublicId!: string;

  @Column({unique: true})
  slug!: string;

  @OneToMany(() => Product, product => product.category)
  products!: Product[];
}