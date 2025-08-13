-- CreateTable
CREATE TABLE `usuarios` (
    `nom_usuario` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contrasena` VARCHAR(191) NOT NULL,
    `tipo_usuario` ENUM('programador', 'visual') NOT NULL,
    `foto_perfil` VARCHAR(191) NULL,
    `biografia` TEXT NULL,
    `red_social` VARCHAR(191) NULL,

    UNIQUE INDEX `usuarios_nom_usuario_key`(`nom_usuario`),
    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`nom_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiencias_laborales` (
    `id_exp` INTEGER NOT NULL AUTO_INCREMENT,
    `empresa` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_salida` DATETIME(3) NOT NULL,
    `nom_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_exp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyectos` (
    `id_proyecto` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `fecha_publi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nom_usuario` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_proyecto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `archivos` (
    `id_archivo` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_archivo` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `id_proyecto` INTEGER NOT NULL,

    PRIMARY KEY (`id_archivo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `experiencias_laborales` ADD CONSTRAINT `experiencias_laborales_nom_usuario_fkey` FOREIGN KEY (`nom_usuario`) REFERENCES `usuarios`(`nom_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_nom_usuario_fkey` FOREIGN KEY (`nom_usuario`) REFERENCES `usuarios`(`nom_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `archivos` ADD CONSTRAINT `archivos_id_proyecto_fkey` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos`(`id_proyecto`) ON DELETE RESTRICT ON UPDATE CASCADE;
