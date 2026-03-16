import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./categories.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoriesRepository {
  constructor (@InjectRepository(Category) private readonly categoriesRepository: Repository<Category>) {}
}