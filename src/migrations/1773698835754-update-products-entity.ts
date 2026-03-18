import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductsEntity1773698835754 implements MigrationInterface {
    name = 'UpdateProductsEntity1773698835754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
    }

}
