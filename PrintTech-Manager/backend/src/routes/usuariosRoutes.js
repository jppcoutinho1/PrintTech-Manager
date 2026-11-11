
import express from "express";

import {
    cadastrarUsuario,
    listarUsuarios,
    listarTecnicos,
    editarUsuario,
    alterarStatusUsuario,
    redefinirSenha
} from "../controllers/usuariosController.js";

import {
    autenticarToken,
    autorizarPerfil
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// =====================================
// CADASTRAR USUÁRIO
// Somente administrador
// =====================================

router.post(
    "/",
    autenticarToken,
    autorizarPerfil("administrador"),
    cadastrarUsuario
);

// =====================================
// LISTAR TODOS OS USUÁRIOS
// Somente administrador
// =====================================

router.get(
    "/",
    autenticarToken,
    autorizarPerfil("administrador"),
    listarUsuarios
);

// =====================================
// LISTAR TÉCNICOS
// Administrador e atendente
// =====================================

router.get(
    "/tecnicos",
    autenticarToken,
    autorizarPerfil("administrador", "atendente"),
    listarTecnicos
);

// =====================================
// EDITAR USUÁRIO
// Somente administrador
// =====================================

router.put(
    "/:id",
    autenticarToken,
    autorizarPerfil("administrador"),
    editarUsuario
);

// =====================================
// ATIVAR OU DESATIVAR USUÁRIO
// Somente administrador
// =====================================

router.patch(
    "/:id/status",
    autenticarToken,
    autorizarPerfil("administrador"),
    alterarStatusUsuario
);

// =====================================
// REDEFINIR SENHA
// Somente administrador
// =====================================

router.put(
    "/:id/senha",
    autenticarToken,
    autorizarPerfil("administrador"),
    redefinirSenha
);

export default router;
