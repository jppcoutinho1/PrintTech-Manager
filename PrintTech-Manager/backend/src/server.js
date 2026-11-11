
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { testarConexao } from "./config/database.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import equipamentosRoutes from "./routes/equipamentosRoutes.js";
import ordensServicoRoutes from "./routes/ordensServicoRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

import {
    autenticarToken,
    autorizarPerfil
} from "./middlewares/authMiddleware.js";

dotenv.config();

// Inicialização do Express
const app = express();

// Configurações
app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "PrintTech Manager API funcionando!",
        banco: "MySQL"
    });
});

// Rotas da aplicação
app.use(
    "/api/clientes",
    autenticarToken,
    autorizarPerfil("administrador", "atendente"),
    clientesRoutes
);
app.use(
    "/api/equipamentos",
    autenticarToken,
    autorizarPerfil("administrador", "atendente"),
    equipamentosRoutes
);
app.use("/api/ordens-servico", ordensServicoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Inicialização do servidor
const PORT = process.env.PORT || 3001;

async function iniciarServidor() {
    try {
        await testarConexao();

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });

    } catch (erro) {
        console.error("Erro ao conectar com MySQL:", erro.message);
        process.exit(1);
    }
}

iniciarServidor();
