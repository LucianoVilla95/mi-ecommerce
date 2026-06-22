import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntities1781593525224 implements MigrationInterface {
    name = 'UpdateEntities1781593525224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_3ff3367344edec5de2355a562ee"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2a13944a814f28f54b46f8754"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42c81b3ff726805ea1975a76d6"`);
        await queryRunner.query(`CREATE INDEX "IDX_3ff3367344edec5de2355a562e" ON "order_details" ("order_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce1f689e43b39edd9330cadaeb" ON "order_details" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a922b820eeef29ac1c6800e826" ON "orders" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_3ff3367344edec5de2355a562ee" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_3ff3367344edec5de2355a562ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a922b820eeef29ac1c6800e826"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce1f689e43b39edd9330cadaeb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3ff3367344edec5de2355a562e"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_42c81b3ff726805ea1975a76d6" ON "orders" ("is_active", "user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b2a13944a814f28f54b46f8754" ON "order_details" ("order_id", "product_id") `);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_3ff3367344edec5de2355a562ee" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
