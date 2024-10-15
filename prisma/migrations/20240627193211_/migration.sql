/*
  Warnings:

  - You are about to drop the column `educationalAndHistorical` on the `members` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `members` DROP COLUMN `educationalAndHistorical`,
    ADD COLUMN `educational` LONGTEXT NULL,
    ADD COLUMN `executiveHistory` LONGTEXT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
