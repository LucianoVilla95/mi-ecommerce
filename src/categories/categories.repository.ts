import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./categories.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoriesRepository {
  constructor (@InjectRepository(Category) private readonly categoriesRepository: Repository<Category>) {}

  async getCategoryByName(formattedName: string): Promise<Category | null> {
    return await this.categoriesRepository.findOne({where: {name: formattedName}});
  }

  async createCategory(formattedName: string, slug: string): Promise<Category> {
    const category: Category = await this.categoriesRepository.create({name: formattedName, slug});
    return await this.categoriesRepository.save(category);
  }

  async getCategories(): Promise<Category[]> {
    const categories: Category[] = await this.categoriesRepository.find();
    return categories;
  }
}