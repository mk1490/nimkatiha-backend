/*
  Warnings:

  - You are about to drop the column `time` on the `tests` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `published_tests` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `endDescription` VARCHAR(191) NULL,
    ADD COLUMN `time` INTEGER NULL;

-- AlterTable
ALTER TABLE `tests` DROP COLUMN `time`;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
