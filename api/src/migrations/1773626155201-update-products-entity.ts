import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductsEntity1773626155201 implements MigrationInterface {
    name = 'UpdateProductsEntity1773626155201'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "img_public_id" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "img_public_id"`);
    }

}
