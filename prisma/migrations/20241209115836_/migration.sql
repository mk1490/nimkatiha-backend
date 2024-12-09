/*
  Warnings:

  - You are about to drop the `answered_tests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- DropTable
DROP TABLE `answered_tests`;

-- CreateTable
CREATE TABLE `member_answered_tests` (
    `id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `publishedTestItemId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `stringifyData` LONGTEXT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
