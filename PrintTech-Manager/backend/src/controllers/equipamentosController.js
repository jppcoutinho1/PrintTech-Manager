
import pool from "../config/database.js";

// LISTAR TODOS OS EQUIPAMENTOS
export async function listarEquipamentos(req, res) {
    try {
        const [equipamentos] = await pool.query(`
            SELECT 
                e.*,
                c.nome AS nome_cliente
            FROM equipamentos e
            INNER JOIN clientes c ON e.cliente_id = c.id
            ORDER BY e.id DESC
        `);

        res.json(equipamentos);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao consultar equipamentos."
        });
    }
}

// BUSCAR EQUIPAMENTO PELO ID
export async function buscarEquipamento(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const [equipamentos] = await pool.query(`
            SELECT 
                e.*,
                c.nome AS nome_cliente
            FROM equipamentos e
            INNER JOIN clientes c ON e.cliente_id = c.id
            WHERE e.id = ?
        `, [id]);

        if (equipamentos.length === 0) {
            return res.status(404).json({
                mensagem: "Equipamento não encontrado."
            });
        }

        res.json(equipamentos[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar equipamento."
        });
    }
}

// CADASTRAR EQUIPAMENTO
export async function cadastrarEquipamento(req, res) {
    try {
        const {
            cliente_id,
            marca,
            modelo,
            numero_serie,
            descricao
        } = req.body;

        const clienteId = Number(cliente_id);

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            return res.status(400).json({
                mensagem: "Informe um ID de cliente válido."
            });
        }

        if (!marca || !marca.trim() || !modelo || !modelo.trim()) {
            return res.status(400).json({
                mensagem: "Marca e modelo são obrigatórios."
            });
        }

        const [resultado] = await pool.query(`
            INSERT INTO equipamentos
            (cliente_id, marca, modelo, numero_serie, descricao)
            VALUES (?, ?, ?, ?, ?)
        `, [
            clienteId,
            marca.trim(),
            modelo.trim(),
            numero_serie ?? null,
            descricao ?? null
        ]);

        res.status(201).json({
            mensagem: "Equipamento cadastrado com sucesso!",
            id: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                mensagem: "O cliente informado não existe."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao cadastrar equipamento."
        });
    }
}

// ATUALIZAR EQUIPAMENTO
export async function atualizarEquipamento(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const {
            cliente_id,
            marca,
            modelo,
            numero_serie,
            descricao
        } = req.body;

        const clienteId = Number(cliente_id);

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            return res.status(400).json({
                mensagem: "Informe um ID de cliente válido."
            });
        }

        if (!marca || !marca.trim() || !modelo || !modelo.trim()) {
            return res.status(400).json({
                mensagem: "Marca e modelo são obrigatórios."
            });
        }

        const [equipamentoExistente] = await pool.query(
            "SELECT id FROM equipamentos WHERE id = ?",
            [id]
        );

        if (equipamentoExistente.length === 0) {
            return res.status(404).json({
                mensagem: "Equipamento não encontrado."
            });
        }

        await pool.query(`
            UPDATE equipamentos
            SET cliente_id = ?,
                marca = ?,
                modelo = ?,
                numero_serie = ?,
                descricao = ?
            WHERE id = ?
        `, [
            clienteId,
            marca.trim(),
            modelo.trim(),
            numero_serie ?? null,
            descricao ?? null,
            id
        ]);

        res.json({
            mensagem: "Equipamento atualizado com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                mensagem: "O cliente informado não existe."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao atualizar equipamento."
        });
    }
}

// EXCLUIR EQUIPAMENTO
export async function excluirEquipamento(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const [resultado] = await pool.query(
            "DELETE FROM equipamentos WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Equipamento não encontrado."
            });
        }

        res.json({
            mensagem: "Equipamento excluído com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensagem: "Não é possível excluir este equipamento, pois ele possui ordens de serviço vinculadas."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao excluir equipamento."
        });
    }
}
