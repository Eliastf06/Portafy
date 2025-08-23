/*
  Warnings:

  - You are about to drop the column `biografia` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `foto_perfil` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `red_social` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `biografia`,
    DROP COLUMN `foto_perfil`,
    DROP COLUMN `red_social`,
    ADD COLUMN `privado` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `perfiles` (
    `id_perfil` INTEGER NOT NULL AUTO_INCREMENT,
    `biografia` TEXT NULL,
    `foto_perfil` VARCHAR(255) NULL,
    `red_social` VARCHAR(255) NULL,
    `datos_contacto` VARCHAR(255) NULL,
    `nom_usuario` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `perfiles_nom_usuario_key`(`nom_usuario`),
    PRIMARY KEY (`id_perfil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfiles` ADD CONSTRAINT `perfiles_nom_usuario_fkey` FOREIGN KEY (`nom_usuario`) REFERENCES `usuarios`(`nom_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
