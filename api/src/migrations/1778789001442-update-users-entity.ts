import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersEntity1778789001442 implements MigrationInterface {
    name = 'UpdateUsersEntity1778789001442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetTokenExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetTokenExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetToken"`);
    }

}
