-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `coachs` ADD COLUMN `mobileNumber` VARCHAR(191) NULL,
    ADD COLUMN `nationalCode` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
