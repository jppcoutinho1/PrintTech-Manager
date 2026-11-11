
import pool from "./src/config/database.js";
import bcrypt from "bcrypt";

async function criarUsuarios() {
    try {
        // Criptografar as senhas
        const senhaAdmin = await bcrypt.hash("Admin@12345", 10);
        const senhaTecnico = await bcrypt.hash("Tecnico@12345", 10);

        // Cadastrar administrador e técnico
        const [resultado] = await pool.query(`
            INSERT INTO usuarios
            (nome, email, senha, perfil, ativo)
            VALUES
            (?, ?, ?, ?, 1),
            (?, ?, ?, ?, 1)
        `, [
            "Administrador",
            "admin@printtech.com",
            senhaAdmin,
            "administrador",

            "Técnico Exemplo",
            "tecnico@printtech.com",
            senhaTecnico,
            "tecnico"
        ]);

        console.log("Usuários cadastrados com sucesso!");
        console.log("Primeiro ID:", resultado.insertId);
        console.log("Segundo ID:", resultado.insertId + 1);

    } catch (erro) {
        console.error("Erro ao cadastrar usuários:", erro.message);

    } finally {
        await pool.end();
    }
}

criarUsuarios();
