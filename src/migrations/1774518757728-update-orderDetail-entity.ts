import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderDetailEntity1774518757728 implements MigrationInterface {
    name = 'UpdateOrderDetailEntity1774518757728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "PK_278a6e0f21c9db1653e6f406801"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "PK_278a6e0f21c9db1653e6f406801" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b2a13944a814f28f54b46f8754" ON "order_details" ("order_id", "product_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_42c81b3ff726805ea1975a76d6" ON "orders" ("user_id", "is_active") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_42c81b3ff726805ea1975a76d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2a13944a814f28f54b46f8754"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "PK_278a6e0f21c9db1653e6f406801"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "PK_278a6e0f21c9db1653e6f406801" PRIMARY KEY ("id")`);
    }

}
