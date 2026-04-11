import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrdersEntity1774237153080 implements MigrationInterface {
    name = 'UpdateOrdersEntity1774237153080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "date" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "date" DROP DEFAULT`);
    }

}
