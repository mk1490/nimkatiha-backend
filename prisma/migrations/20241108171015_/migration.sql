-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `family` VARCHAR(191) NULL,
    `fatherName` VARCHAR(191) NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `metaData` VARCHAR(191) NULL,
    `creatorId` VARCHAR(191) NULL,
    `accessPermissionGroupId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_permission_group` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `isDeletable` BOOLEAN NOT NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_permission_group_items` (
    `id` VARCHAR(191) NOT NULL,
    `userOrParentAccessPermissionId` VARCHAR(191) NULL,
    `providerKey` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `providerKey` VARCHAR(191) NOT NULL,
    `providerValue` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ipgs` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NULL,
    `merchantId` VARCHAR(191) NOT NULL,
    `terminalId` VARCHAR(191) NOT NULL,
    `terminalKey` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reuqestcodes` (
    `id` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `baseData` (
    `id` VARCHAR(191) NOT NULL,
    `providerKey` VARCHAR(191) NOT NULL,
    `providerValue` VARCHAR(191) NOT NULL,
    `providerData` VARCHAR(191) NULL,
    `providerData_2` VARCHAR(191) NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `family` VARCHAR(191) NULL,
    `nationalCode` VARCHAR(191) NULL,
    `disabilityStatus` INTEGER NULL,
    `disabilityDescription` VARCHAR(191) NULL,
    `partnerJob` VARCHAR(191) NULL,
    `educationLevel` INTEGER NULL,
    `maritalStatus` INTEGER NULL,
    `religion` VARCHAR(191) NULL,
    `diseaseBackground` INTEGER NULL,
    `diseaseBackgroundDescription` VARCHAR(191) NULL,
    `childrenCounts` INTEGER NULL,
    `birthDate` VARCHAR(191) NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `fatherName` VARCHAR(191) NULL,
    `fatherFamily` VARCHAR(191) NULL,
    `fatherEducationLevel` INTEGER NULL,
    `fatherEducationLevelFifeSituation` INTEGER NULL,
    `motherName` VARCHAR(191) NULL,
    `motherFamily` VARCHAR(191) NULL,
    `motherEducationLevel` INTEGER NULL,
    `motherEducationLevelFifeSituation` INTEGER NULL,
    `singleChild` INTEGER NULL,
    `familyMembers` INTEGER NULL,
    `status` INTEGER NULL,
    `city` VARCHAR(191) NULL,
    `educational` LONGTEXT NULL,
    `executiveHistory` LONGTEXT NULL,
    `educationalAndHistorical` LONGTEXT NULL,
    `educationalCourses` LONGTEXT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `questionnaireId` VARCHAR(191) NULL,
    `creatorId` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members_product_items` (
    `id` VARCHAR(191) NOT NULL,
    `parentMemberId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `ownProduct` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imageSlider` (
    `id` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profileImageSlider` (
    `id` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NOT NULL,
    `targetUrl` VARCHAR(191) NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `upload_document_template` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `maximumSizeInMb` INTEGER NOT NULL,
    `isRequired` BOOLEAN NOT NULL,
    `showWhen` VARCHAR(191) NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploadedDocuments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rejectionTemplates` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `creationTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creatorId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `markets` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `activityStartDate` DATETIME(3) NOT NULL,
    `activityEndDate` DATETIME(3) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `location` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `market_desks` (
    `id` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `parentMarketId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reversed_markets` (
    `id` VARCHAR(191) NOT NULL,
    `marketId` VARCHAR(191) NOT NULL,
    `deskId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `isPurchased` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` VARCHAR(191) NOT NULL,
    `cityId` INTEGER NOT NULL,
    `provinceId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(65, 30) NOT NULL,
    `longitude` DECIMAL(65, 30) NOT NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_templates` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_template_disabled_form` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_accessPermissionGroupId_fkey` FOREIGN KEY (`accessPermissionGroupId`) REFERENCES `access_permission_group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;