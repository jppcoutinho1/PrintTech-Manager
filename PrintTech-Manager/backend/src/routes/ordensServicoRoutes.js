
import express from "express";

import {
    listarOrdensServico,
    buscarOrdemServico,
    cadastrarOrdemServico,
    atualizarOrdemServico,
    excluirOrdemServico,
    listarHistoricoOrdem
} from "../controllers/ordensServicoController.js";

import {
    autenticarToken,
    autorizarPerfil
} from "../middlewares/authMiddleware.js";



const router = express.Router();

// Todas as rotas exigem autenticação
router.use(autenticarToken);

// Consultar ordens: todos os perfis autenticados
router.get(
    "/",
    autorizarPerfil("administrador", "atendente", "tecnico"),
    listarOrdensServico
);

router.get(
    "/:id",
    autorizarPerfil("administrador", "atendente", "tecnico"),
    buscarOrdemServico
);

// Abrir ordem: administrador e atendente
router.post(
    "/",
    autorizarPerfil("administrador", "atendente"),
    cadastrarOrdemServico
);

// Atualizar ordem: administrador e técnico
router.put(
    "/:id",
    autorizarPerfil("administrador", "tecnico"),
    atualizarOrdemServico
);

// Excluir ordem: somente administrador
router.delete(
    "/:id",
    autorizarPerfil("administrador"),
    excluirOrdemServico
);

router.get(
    "/:id/historico",
    autorizarPerfil("administrador", "atendente", "tecnico"),
    listarHistoricoOrdem
);

export default router;
