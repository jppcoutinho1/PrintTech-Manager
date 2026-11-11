
import express from "express";

import {
    listarEquipamentos,
    buscarEquipamento,
    cadastrarEquipamento,
    atualizarEquipamento,
    excluirEquipamento
} from "../controllers/equipamentosController.js";

const router = express.Router();

router.get("/", listarEquipamentos);
router.get("/:id", buscarEquipamento);
router.post("/", cadastrarEquipamento);
router.put("/:id", atualizarEquipamento);
router.delete("/:id", excluirEquipamento);

export default router;
