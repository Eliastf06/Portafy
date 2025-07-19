-- CreateTable
CREATE TABLE `Usuario` (
    `nom_usuario` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contraseña` VARCHAR(191) NOT NULL,
    `tipo_usuario` VARCHAR(191) NOT NULL,
    `foto_perfil` TEXT NULL,
    `biografia` TEXT NULL,
    `red_social` TEXT NULL,

    UNIQUE INDEX `Usuario_nom_usuario_key`(`nom_usuario`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`nom_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proyecto` (
    `id_proyecto` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_usuario` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `categoria` VARCHAR(100) NULL,
    `fecha_publi` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_proyecto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Archivo` (
    `id_archivo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_proyecto` INTEGER NOT NULL,
    `tipo_archivo` VARCHAR(50) NOT NULL,
    `url` TEXT NOT NULL,

    PRIMARY KEY (`id_archivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exp_Lbl` (
    `id_exp` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_usuario` VARCHAR(191) NOT NULL,
    `empresa` VARCHAR(255) NOT NULL,
    `cargo` VARCHAR(255) NOT NULL,
    `fecha_inicio` DATETIME(0) NOT NULL,
    `fecha_salida` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id_exp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Proyecto` ADD CONSTRAINT `Proyecto_nom_usuario_fkey` FOREIGN KEY (`nom_usuario`) REFERENCES `Usuario`(`nom_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Archivo` ADD CONSTRAINT `Archivo_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `Proyecto`(`id_proyecto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exp_Lbl` ADD CONSTRAINT `Exp_Lbl_nom_usuario_fkey` FOREIGN KEY (`nom_usuario`) REFERENCES `Usuario`(`nom_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
