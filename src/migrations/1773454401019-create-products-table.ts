import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1773454401019 implements MigrationInterface {
    name = 'CreateProductsTable1773454401019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, "img_url" character varying NOT NULL DEFAULT 'https://emprendepyme.net/wp-content/uploads/2023/03/cualidades-producto.jpg', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isBlocked"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_blocked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_deleted"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_blocked"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isBlocked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
