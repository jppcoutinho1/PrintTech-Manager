
import pool from "../config/database.js";
import bcrypt from "bcrypt";

// =====================================
// CADASTRAR NOVO USUÁRIO
// =====================================

export async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, senha, perfil } = req.body;

        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos obrigatórios."
            });
        }

        if (senha.length < 8) {
            return res.status(400).json({
                mensagem: "A senha deve possuir pelo menos 8 caracteres."
            });
        }

        const perfisPermitidos = [
            "administrador",
            "atendente",
            "tecnico"
        ];

        if (!perfisPermitidos.includes(perfil)) {
            return res.status(400).json({
                mensagem: "Perfil de usuário inválido."
            });
        }

        const nomeFormatado = nome.trim();
        const emailFormatado = email.trim().toLowerCase();

        const [usuariosExistentes] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [emailFormatado]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const [resultado] = await pool.query(
            `INSERT INTO usuarios
            (nome, email, senha, perfil)
            VALUES (?, ?, ?, ?)`,
            [
                nomeFormatado,
                emailFormatado,
                senhaCriptografada,
                perfil
            ]
        );

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id: resultado.insertId,
                nome: nomeFormatado,
                email: emailFormatado,
                perfil
            }
        });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
}

// =====================================
// LISTAR TODOS OS USUÁRIOS
// =====================================

export async function listarUsuarios(req, res) {
    try {
        const [usuarios] = await pool.query(`
            SELECT
                id,
                nome,
                email,
                perfil,
                ativo
            FROM usuarios
            ORDER BY nome ASC
        `);

        return res.status(200).json(usuarios);

    } catch (erro) {
        console.error("Erro ao listar usuários:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar usuários."
        });
    }
}

// =====================================
// LISTAR TÉCNICOS ATIVOS
// =====================================

export async function listarTecnicos(req, res) {
    try {
        const [tecnicos] = await pool.query(`
            SELECT id, nome, email
            FROM usuarios
            WHERE perfil = 'tecnico'
            AND ativo = 1
            ORDER BY nome ASC
        `);

        return res.status(200).json(tecnicos);

    } catch (erro) {
        console.error("Erro ao listar técnicos:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar técnicos."
        });
    }
}

// =====================================
// EDITAR USUÁRIO
// =====================================

export async function editarUsuario(req, res) {
    try {
        const id = Number(req.params.id);
        const { nome, email, perfil } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID de usuário inválido."
            });
        }

        if (!nome || !email || !perfil) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos obrigatórios."
            });
        }

        const perfisPermitidos = [
            "administrador",
            "atendente",
            "tecnico"
        ];

        if (!perfisPermitidos.includes(perfil)) {
            return res.status(400).json({
                mensagem: "Perfil de usuário inválido."
            });
        }

        const nomeFormatado = nome.trim();
        const emailFormatado = email.trim().toLowerCase();

        const [usuarios] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ?",
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const [emailExistente] = await pool.query(
            `SELECT id FROM usuarios
            WHERE email = ? AND id <> ?`,
            [emailFormatado, id]
        );

        if (emailExistente.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está sendo utilizado."
            });
        }

        await pool.query(
            `UPDATE usuarios
            SET nome = ?, email = ?, perfil = ?
            WHERE id = ?`,
            [
                nomeFormatado,
                emailFormatado,
                perfil,
                id
            ]
        );

        return res.status(200).json({
            mensagem: "Usuário atualizado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao editar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar usuário."
        });
    }
}

// =====================================
// ATIVAR OU DESATIVAR USUÁRIO
// =====================================

export async function alterarStatusUsuario(req, res) {
    try {
        const id = Number(req.params.id);
        const { ativo } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID de usuário inválido."
            });
        }

        if (typeof ativo !== "boolean" &&
            ativo !== 0 && ativo !== 1) {
            return res.status(400).json({
                mensagem: "Informe um status válido."
            });
        }

        const [usuarios] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ?",
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const status = ativo ? 1 : 0;

        await pool.query(
            "UPDATE usuarios SET ativo = ? WHERE id = ?",
            [status, id]
        );

        return res.status(200).json({
            mensagem: status
                ? "Usuário ativado com sucesso!"
                : "Usuário desativado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao alterar status do usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao alterar status do usuário."
        });
    }
}

// =====================================
// REDEFINIR SENHA
// =====================================

export async function redefinirSenha(req, res) {
    try {
        const { id } = req.params;
        const { senha } = req.body;

        if (!senha || senha.length < 8) {
            return res.status(400).json({
                mensagem: "A senha deve possuir pelo menos 8 caracteres."
            });
        }

        const [usuarios] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ?",
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await pool.query(
            "UPDATE usuarios SET senha = ? WHERE id = ?",
            [senhaCriptografada, id]
        );

        return res.status(200).json({
            mensagem: "Senha redefinida com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);

        return res.status(500).json({
            mensagem: "Erro ao redefinir senha."
        });
    }
}
