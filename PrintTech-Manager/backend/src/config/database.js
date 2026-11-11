
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão com o banco
export async function testarConexao() {
    const conexao = await pool.getConnection();

    try {
        console.log("Conexão com MySQL estabelecida!");
    } finally {
        conexao.release();
    }
}

export default pool;
