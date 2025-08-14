/*
  Warnings:

  - You are about to drop the column `privado` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `experiencias_laborales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `perfiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `experiencias_laborales` DROP FOREIGN KEY `experiencias_laborales_nom_usuario_fkey`;

-- DropForeignKey
ALTER TABLE `perfiles` DROP FOREIGN KEY `perfiles_nom_usuario_fkey`;

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `privado`;

-- DropTable
DROP TABLE `experiencias_laborales`;

-- DropTable
DROP TABLE `perfiles`;

-- CreateTable
CREATE TABLE `datos_perfil` (
    `id_datos_perfil` INTEGER NOT NULL AUTO_INCREMENT,
    `privacidad` BOOLEAN NOT NULL DEFAULT false,
    `biografia` TEXT NULL,
    `red_social` VARCHAR(191) NULL,
    `foto_perfil` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `experiencia` TEXT NULL,
    `nom_usuario` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `datos_perfil_nom_usuario_key`(`nom_usuario`),
    PRIMARY KEY (`id_datos_perfil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `datos_perfil` ADD CONSTRAINT `datos_perfil_nom_usuario_fkey` FOREIGN KEY (`nom_usuario`) REFERENCES `usuarios`(`nom_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
