
import pool from "../config/database.js";

// LISTAR TODOS OS CLIENTES
export async function listarClientes(req, res) {
    try {
        const [clientes] = await pool.query(
            "SELECT * FROM clientes ORDER BY id DESC"
        );

        res.json(clientes);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao consultar clientes."
        });
    }
}

// BUSCAR CLIENTE PELO ID
export async function buscarCliente(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const [clientes] = await pool.query(
            "SELECT * FROM clientes WHERE id = ?",
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        res.json(clientes[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar cliente."
        });
    }
}

// CADASTRAR CLIENTE
export async function cadastrarCliente(req, res) {
    try {
        const {
            nome,
            cpf_cnpj,
            telefone,
            email,
            endereco
        } = req.body;

        if (!nome || !nome.trim()) {
            return res.status(400).json({
                mensagem: "O nome do cliente é obrigatório."
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO clientes
            (nome, cpf_cnpj, telefone, email, endereco)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                cpf_cnpj ?? null,
                telefone ?? null,
                email ?? null,
                endereco ?? null
            ]
        );

        res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso!",
            id: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Este CPF/CNPJ já está cadastrado."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao cadastrar cliente."
        });
    }
}

// ATUALIZAR CLIENTE
export async function atualizarCliente(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const {
            nome,
            cpf_cnpj,
            telefone,
            email,
            endereco
        } = req.body;

        if (!nome || !nome.trim()) {
            return res.status(400).json({
                mensagem: "O nome do cliente é obrigatório."
            });
        }

        const [resultado] = await pool.query(
            `UPDATE clientes
            SET nome = ?, cpf_cnpj = ?, telefone = ?,
                email = ?, endereco = ?
            WHERE id = ?`,
            [
                nome.trim(),
                cpf_cnpj ?? null,
                telefone ?? null,
                email ?? null,
                endereco ?? null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        res.json({
            mensagem: "Cliente atualizado com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Este CPF/CNPJ já pertence a outro cliente."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao atualizar cliente."
        });
    }
}

// EXCLUIR CLIENTE
export async function excluirCliente(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const [resultado] = await pool.query(
            "DELETE FROM clientes WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        res.json({
            mensagem: "Cliente excluído com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensagem: "Não é possível excluir este cliente, pois existem equipamentos vinculados a ele."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao excluir cliente."
        });
    }
}
