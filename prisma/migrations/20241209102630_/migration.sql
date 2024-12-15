/*
  Warnings:

  - Added the required column `parentPublishedTestId` to the `published_test_question_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `published_test_question_items` ADD COLUMN `parentPublishedTestId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
