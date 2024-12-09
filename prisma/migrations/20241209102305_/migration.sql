/*
  Warnings:

  - You are about to drop the column `isRandom` on the `published_tests` table. All the data in the column will be lost.
  - You are about to drop the column `questionRandomNumbers` on the `published_tests` table. All the data in the column will be lost.
  - You are about to drop the column `testTemplateId` on the `published_tests` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `published_tests` DROP COLUMN `isRandom`,
    DROP COLUMN `questionRandomNumbers`,
    DROP COLUMN `testTemplateId`,
    ADD COLUMN `title` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `published_test_question_items` (
    `id` VARCHAR(191) NOT NULL,
    `testTemplateId` VARCHAR(191) NOT NULL,
    `isRandom` BOOLEAN NOT NULL,
    `questionRandomNumbers` INTEGER NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
