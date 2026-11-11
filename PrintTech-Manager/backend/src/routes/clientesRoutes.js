
import express from "express";

import {
    listarClientes,
    buscarCliente,
    cadastrarCliente,
    atualizarCliente,
    excluirCliente
} from "../controllers/clientesController.js";

const router = express.Router();

// GET: listar clientes
router.get("/", listarClientes);

// GET: buscar cliente pelo ID
router.get("/:id", buscarCliente);

// POST: cadastrar cliente
router.post("/", cadastrarCliente);

// PUT: atualizar cliente
router.put("/:id", atualizarCliente);

// DELETE: excluir cliente
router.delete("/:id", excluirCliente);

export default router;
