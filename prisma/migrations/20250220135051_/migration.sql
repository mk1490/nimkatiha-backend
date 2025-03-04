/*
  Warnings:

  - You are about to drop the column `parentCountId` on the `course_episodes` table. All the data in the column will be lost.
  - Added the required column `parentCourseId` to the `course_episodes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_accessPermissionGroupId_fkey` ON `users`;

-- AlterTable
ALTER TABLE `course_episodes` DROP COLUMN `parentCountId`,
    ADD COLUMN `parentCourseId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
