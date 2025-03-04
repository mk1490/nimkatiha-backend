/*
  Warnings:

  - You are about to drop the column `parentCountEpisodeId` on the `course_episode_joined_categories` table. All the data in the column will be lost.
  - You are about to drop the column `parentCourseId` on the `course_episode_joined_categories` table. All the data in the column will be lost.
  - Added the required column `parentCourseEpisodeId` to the `course_episode_joined_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `course_episode_joined_categories` DROP COLUMN `parentCountEpisodeId`,
    DROP COLUMN `parentCourseId`,
    ADD COLUMN `parentCourseEpisodeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
