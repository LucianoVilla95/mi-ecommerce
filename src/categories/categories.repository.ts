import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./categories.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoriesRepository {
  constructor (@InjectRepository(Category) private readonly categoriesRepository: Repository<Category>) {}

  async getCategoryByName(name: string): Promise<Category | null> {
    return await this.categoriesRepository.findOne({where: {name}});
  }

  async createCategory(name: string, slug: string): Promise<Category> {
    const category: Category = await this.categoriesRepository.create({name, slug});
    return await this.categoriesRepository.save(category);
  }

  async getCategories(): Promise<Category[]> {
    const categories: Category[] = await this.categoriesRepository.find();
    return categories;
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const category: Category | null = await this.categoriesRepository.findOne({ where: {id} });
    return category; 
  }
}