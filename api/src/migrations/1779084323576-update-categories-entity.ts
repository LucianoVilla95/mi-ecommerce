import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCategoriesEntity1779084323576 implements MigrationInterface {
    name = 'UpdateCategoriesEntity1779084323576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "img_url" character varying NOT NULL DEFAULT 'https://emprendepyme.net/wp-content/uploads/2023/03/cualidades-producto.jpg'`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "img_public_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "img_public_id"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "img_url"`);
    }

}
