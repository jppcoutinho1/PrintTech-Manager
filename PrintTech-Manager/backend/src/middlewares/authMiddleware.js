
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

// Verificar se o usuário está autenticado e ativo
export async function autenticarToken(req, res, next) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho) {
        return res.status(401).json({
            mensagem: "Acesso negado. Token não informado."
        });
    }

    const partes = cabecalho.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            mensagem: "Formato do token inválido."
        });
    }

    const token = partes[1];

    let dadosUsuario;

    // 1. Validar o token JWT
    try {
        dadosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (erro) {
        return res.status(401).json({
            mensagem: "Token inválido ou expirado."
        });
    }

    // 2. Consultar o usuário no banco de dados
    try {
        const [usuarios] = await pool.query(
            `SELECT id, nome, email, perfil, ativo
             FROM usuarios
             WHERE id = ?`,
            [dadosUsuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const usuario = usuarios[0];

        // 3. Verificar se o usuário está ativo
        if (Number(usuario.ativo) !== 1) {
            return res.status(403).json({
                mensagem: "Acesso bloqueado. Seu usuário está desativado."
            });
        }

        // 4. Atualizar os dados do usuário na requisição
        req.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        };

        next();

    } catch (erro) {
        console.error("Erro ao verificar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao verificar autenticação do usuário."
        });
    }
}

// Verificar o perfil do usuário
export function autorizarPerfil(...perfisPermitidos) {
    return (req, res, next) => {

        if (!req.usuario) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado."
            });
        }

        if (!perfisPermitidos.includes(req.usuario.perfil)) {
            return res.status(403).json({
                mensagem: "Você não tem permissão para acessar este recurso."
            });
        }

        next();
    };
}
