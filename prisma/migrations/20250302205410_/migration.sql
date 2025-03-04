-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- CreateTable
CREATE TABLE `course_episode_joined_categories` (
    `id` VARCHAR(191) NOT NULL,
    `parentCountEpisodeId` VARCHAR(191) NOT NULL,
    `parentCategoryId` VARCHAR(191) NOT NULL,
    `parentCourseId` VARCHAR(191) NOT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
