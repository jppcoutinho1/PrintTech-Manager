
import pool from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Realizar login
export async function login(req, res) {
    try {
        const { email, senha } = req.body;

        // Validar os campos
        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe o e-mail e a senha."
            });
        }

        // Buscar usuário pelo e-mail
        const [usuarios] = await pool.query(
            `SELECT id, nome, email, senha, perfil, ativo
             FROM usuarios
             WHERE email = ?`,
            [email.trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });
        }

        const usuario = usuarios[0];

        // Verificar se o usuário está ativo
        if (!usuario.ativo) {
            return res.status(403).json({
                mensagem: "Usuário inativo. Entre em contato com o administrador."
            });
        }

        // Comparar senha digitada com senha criptografada
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos."
            });
        }

        // Verificar se a chave JWT está configurada
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurado.");
        }

        // Gerar token de autenticação
        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        // Retornar token e dados do usuário
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    } catch (erro) {
        console.error("Erro no login:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao realizar login."
        });
    }
}
