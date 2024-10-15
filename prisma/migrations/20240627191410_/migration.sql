/*
  Warnings:

  - You are about to alter the column `fatherEducationLevel` on the `members` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `fatherEducationLevelFifeSituation` on the `members` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `motherEducationLevel` on the `members` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `motherEducationLevelFifeSituation` on the `members` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `members` MODIFY `fatherEducationLevel` INTEGER NULL,
    MODIFY `fatherEducationLevelFifeSituation` INTEGER NULL,
    MODIFY `motherEducationLevel` INTEGER NULL,
    MODIFY `motherEducationLevelFifeSituation` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
