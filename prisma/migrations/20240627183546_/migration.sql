-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `members` ADD COLUMN `fatherEducationLevel` VARCHAR(191) NULL,
    ADD COLUMN `fatherEducationLevelFifeSituation` VARCHAR(191) NULL,
    ADD COLUMN `fatherFamily` VARCHAR(191) NULL,
    ADD COLUMN `motherEducationLevel` VARCHAR(191) NULL,
    ADD COLUMN `motherEducationLevelFifeSituation` VARCHAR(191) NULL,
    ADD COLUMN `motherFamily` VARCHAR(191) NULL,
    ADD COLUMN `motherName` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
