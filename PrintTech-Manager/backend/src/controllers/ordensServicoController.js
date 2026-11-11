
import pool from "../config/database.js";

// Status permitidos para uma ordem de serviço
const statusPermitidos = [
    "Aberta",
    "Em andamento",
    "Aguardando peça",
    "Concluída",
    "Cancelada"
];


// Listar ordens de serviço conforme o perfil do usuário
export async function listarOrdensServico(req, res) {
    try {
        let consulta = `
            SELECT
                os.*,
                e.marca,
                e.modelo,
                e.numero_serie,
                c.nome AS nome_cliente,
                u.nome AS nome_responsavel,
                t.nome AS nome_tecnico
            FROM ordens_servico os
            INNER JOIN equipamentos e ON os.equipamento_id = e.id
            INNER JOIN clientes c ON e.cliente_id = c.id
            INNER JOIN usuarios u ON os.usuario_id = u.id
            LEFT JOIN usuarios t ON os.tecnico_id = t.id
        `;

        let parametros = [];

        // Se for técnico, mostrar somente suas ordens
        if (req.usuario.perfil === "tecnico") {
            consulta += " WHERE os.tecnico_id = ?";
            parametros.push(req.usuario.id);
        }

        consulta += " ORDER BY os.data_abertura DESC";

        const [ordens] = await pool.query(
            consulta,
            parametros
        );

        return res.status(200).json(ordens);

    } catch (erro) {
        console.error("Erro ao listar ordens:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar ordens de serviço."
        });
    }
}



 // Buscar ordem de serviço pelo ID
export async function buscarOrdemServico(req, res) {
    try {
        const { id } = req.params;

        let consulta = `
            SELECT
                os.*,
                e.marca,
                e.modelo,
                e.numero_serie,
                c.nome AS nome_cliente,
                u.nome AS nome_responsavel,
                t.nome AS nome_tecnico
            FROM ordens_servico os
            INNER JOIN equipamentos e ON os.equipamento_id = e.id
            INNER JOIN clientes c ON e.cliente_id = c.id
            INNER JOIN usuarios u ON os.usuario_id = u.id
            LEFT JOIN usuarios t ON os.tecnico_id = t.id
            WHERE os.id = ?
        `;

        let parametros = [id];

        // Técnico só pode consultar suas próprias ordens
        if (req.usuario.perfil === "tecnico") {
            consulta += " AND os.tecnico_id = ?";
            parametros.push(req.usuario.id);
        }

        const [ordens] = await pool.query(
            consulta,
            parametros
        );

        if (ordens.length === 0) {
            return res.status(404).json({
                mensagem: "Ordem de serviço não encontrada."
            });
        }

        return res.status(200).json(ordens[0]);

    } catch (erro) {
        console.error("Erro ao buscar ordem:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar ordem de serviço."
        });
    }
}


// Cadastrar nova ordem de serviço

// Cadastrar nova ordem de serviço
export async function cadastrarOrdemServico(req, res) {
    try {
        const {
            equipamento_id,
            tecnico_id,
            descricao_problema
        } = req.body;

        // Identificar automaticamente o usuário pelo token JWT
        const usuario_id = req.usuario.id;

        if (!equipamento_id || !descricao_problema) {
            return res.status(400).json({
                mensagem: "Informe o equipamento e a descrição do problema."
            });
        }

        // Verificar se o equipamento existe
        const [equipamentos] = await pool.query(
            "SELECT id FROM equipamentos WHERE id = ?",
            [equipamento_id]
        );

        if (equipamentos.length === 0) {
            return res.status(404).json({
                mensagem: "Equipamento não encontrado."
            });
        }

        // Verificar se o usuário autenticado ainda está ativo
        const [usuarios] = await pool.query(
            "SELECT id FROM usuarios WHERE id = ? AND ativo = 1",
            [usuario_id]
        );

        if (usuarios.length === 0) {
            return res.status(403).json({
                mensagem: "Usuário responsável não encontrado ou inativo."
            });
        }

        // Verificar o técnico, caso tenha sido informado
        if (tecnico_id !== undefined && tecnico_id !== null) {
            const [tecnicos] = await pool.query(
                `SELECT id FROM usuarios
                 WHERE id = ?
                 AND perfil = 'tecnico'
                 AND ativo = 1`,
                [tecnico_id]
            );

            if (tecnicos.length === 0) {
                return res.status(400).json({
                    mensagem: "Técnico não encontrado ou usuário não possui perfil de técnico ativo."
                });
            }
        }

        // Cadastrar ordem de serviço
        const [resultado] = await pool.query(`
            INSERT INTO ordens_servico
            (equipamento_id, tecnico_id, usuario_id, descricao_problema, status)
            VALUES (?, ?, ?, ?, 'Aberta')
        `, [
            equipamento_id,
            tecnico_id ?? null,
            usuario_id,
            descricao_problema
        ]);

        // Registrar abertura no histórico
await pool.query(`
    INSERT INTO historico_ordens
    (ordem_servico_id, usuario_id, tipo, descricao, status_novo)
    VALUES (?, ?, ?, ?, ?)
`, [
    resultado.insertId,
    usuario_id,
    "Abertura",
    "Ordem de serviço cadastrada.",
    "Aberta"
]);

return res.status(201).json({
    mensagem: "Ordem de serviço cadastrada com sucesso!",
    id: resultado.insertId
});

    } catch (erro) {
        console.error("Erro ao cadastrar ordem:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar ordem de serviço."
        });
    }
}



 // Atualizar ordem de serviço

export async function atualizarOrdemServico(req, res) {
    let conexao;

    try {
        const { id } = req.params;
        const {
            tecnico_id,
            descricao_problema,
            diagnostico,
            status
        } = req.body;

        const perfil = req.usuario.perfil;
        const usuarioId = req.usuario.id;

        if (perfil === "atendente") {
            return res.status(403).json({
                mensagem: "Atendentes não possuem permissão para atualizar ordens de serviço."
            });
        }

        if (!["administrador", "tecnico"].includes(perfil)) {
            return res.status(403).json({
                mensagem: "Perfil sem permissão para atualizar ordens."
            });
        }

        conexao = await pool.getConnection();
        await conexao.beginTransaction();

        // Buscar os dados atuais da OS
        const [ordens] = await conexao.query(
            `SELECT id, tecnico_id, status,
                    descricao_problema, diagnostico
             FROM ordens_servico
             WHERE id = ?`,
            [id]
        );

        if (ordens.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: "Ordem de serviço não encontrada."
            });
        }

        const ordem = ordens[0];

        // Verificar se o técnico é responsável pela OS
        if (
            perfil === "tecnico" &&
            Number(ordem.tecnico_id) !== Number(usuarioId)
        ) {
            await conexao.rollback();

            return res.status(403).json({
                mensagem: "Você não tem permissão para atualizar esta ordem."
            });
        }

        if (!status || !statusPermitidos.includes(status)) {
            await conexao.rollback();

            return res.status(400).json({
                mensagem: "Informe um status válido."
            });
        }

        let tecnicoFinal = ordem.tecnico_id;
        let descricaoFinal = ordem.descricao_problema;

        if (perfil === "administrador") {
            if (!descricao_problema) {
                await conexao.rollback();

                return res.status(400).json({
                    mensagem: "Informe a descrição do problema."
                });
            }

            if (tecnico_id !== undefined) {
                tecnicoFinal = tecnico_id;
            }

            descricaoFinal = descricao_problema;

            // Validar técnico informado
            if (tecnicoFinal !== null) {
                const [tecnicos] = await conexao.query(
                    `SELECT id FROM usuarios
                     WHERE id = ?
                     AND perfil = 'tecnico'
                     AND ativo = 1`,
                    [tecnicoFinal]
                );

                if (tecnicos.length === 0) {
                    await conexao.rollback();

                    return res.status(400).json({
                        mensagem: "Técnico não encontrado ou inativo."
                    });
                }
            }
        }

        const diagnosticoFinal = diagnostico ?? null;

        // Atualizar a ordem de serviço
        if (perfil === "tecnico") {
            await conexao.query(
                `UPDATE ordens_servico
                 SET diagnostico = ?,
                     status = ?,
                     data_conclusao = CASE
                         WHEN ? = 'Concluída'
                         THEN COALESCE(data_conclusao, NOW())
                         ELSE NULL
                     END
                 WHERE id = ?`,
                [diagnosticoFinal, status, status, id]
            );
        } else {
            await conexao.query(
                `UPDATE ordens_servico
                 SET tecnico_id = ?,
                     descricao_problema = ?,
                     diagnostico = ?,
                     status = ?,
                     data_conclusao = CASE
                         WHEN ? = 'Concluída'
                         THEN COALESCE(data_conclusao, NOW())
                         ELSE NULL
                     END
                 WHERE id = ?`,
                [
                    tecnicoFinal,
                    descricaoFinal,
                    diagnosticoFinal,
                    status,
                    status,
                    id
                ]
            );
        }

        // Função auxiliar para registrar movimentações
        async function registrarHistorico(
            tipo,
            descricao,
            statusAnterior = null,
            statusNovo = null
        ) {
            await conexao.query(
                `INSERT INTO historico_ordens
                 (ordem_servico_id, usuario_id, tipo,
                  descricao, status_anterior, status_novo)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    usuarioId,
                    tipo,
                    descricao,
                    statusAnterior,
                    statusNovo
                ]
            );
        }

        // Registrar mudança de status
        if (ordem.status !== status) {
            await registrarHistorico(
                "Status",
                `Status alterado de "${ordem.status}" para "${status}".`,
                ordem.status,
                status
            );
        }

        // Registrar mudança de diagnóstico
        if ((ordem.diagnostico ?? "") !== (diagnosticoFinal ?? "")) {
            await registrarHistorico(
                "Diagnóstico",
                diagnosticoFinal
                    ? `Diagnóstico atualizado: ${diagnosticoFinal}`
                    : "Diagnóstico removido."
            );
        }

        // Registrar troca de técnico
        if (
            perfil === "administrador" &&
            Number(ordem.tecnico_id ?? 0) !== Number(tecnicoFinal ?? 0)
        ) {
            await registrarHistorico(
                "Técnico",
                `Técnico responsável alterado de ID ${ordem.tecnico_id ?? "não atribuído"} para ID ${tecnicoFinal ?? "não atribuído"}.`
            );
        }

        // Registrar mudança na descrição do problema
        if (perfil === "administrador" &&
            ordem.descricao_problema !== descricaoFinal) {
            await registrarHistorico(
                "Descrição",
                "Descrição do problema atualizada."
            );
        }

        await conexao.commit();

        return res.status(200).json({
            mensagem: "Ordem de serviço atualizada com sucesso!"
        });

    } catch (erro) {
        if (conexao) {
            await conexao.rollback();
        }

        console.error("Erro ao atualizar ordem:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar ordem de serviço."
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}



// Excluir ordem de serviço
export async function excluirOrdemServico(req, res) {
    try {
        const { id } = req.params;

        const [ordens] = await pool.query(
            "SELECT id FROM ordens_servico WHERE id = ?",
            [id]
        );

        if (ordens.length === 0) {
            return res.status(404).json({
                mensagem: "Ordem de serviço não encontrada."
            });
        }

        await pool.query(
            "DELETE FROM ordens_servico WHERE id = ?",
            [id]
        );

        return res.status(200).json({
            mensagem: "Ordem de serviço excluída com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir ordem:", erro);
        return res.status(500).json({
            mensagem: "Erro ao excluir ordem de serviço."
        });
    }
}


export async function listarHistoricoOrdem(req, res) {
    try {
        const { id } = req.params;

        // Verificar se a OS existe
        const [ordens] = await pool.query(
            `SELECT id, tecnico_id
             FROM ordens_servico
             WHERE id = ?`,
            [id]
        );

        if (ordens.length === 0) {
            return res.status(404).json({
                mensagem: "Ordem de serviço não encontrada."
            });
        }

        const ordem = ordens[0];

        // Técnico só consulta histórico das próprias OS
        if (
            req.usuario.perfil === "tecnico" &&
            Number(ordem.tecnico_id) !== Number(req.usuario.id)
        ) {
            return res.status(403).json({
                mensagem: "Você não tem permissão para consultar este histórico."
            });
        }

        // Buscar movimentações
        const [historico] = await pool.query(
            `SELECT
                h.id,
                h.ordem_servico_id,
                h.tipo,
                h.descricao,
                h.status_anterior,
                h.status_novo,
                h.data_registro,
                u.nome AS nome_usuario
             FROM historico_ordens h
             INNER JOIN usuarios u ON h.usuario_id = u.id
             WHERE h.ordem_servico_id = ?
             ORDER BY h.data_registro ASC, h.id ASC`,
            [id]
        );

        return res.status(200).json(historico);

    } catch (erro) {
        console.error("Erro ao consultar histórico:", erro);

        return res.status(500).json({
            mensagem: "Erro ao consultar histórico da ordem de serviço."
        });
    }
}
