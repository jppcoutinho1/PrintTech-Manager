

import { useState, useEffect } from "react";

import "./App.css";



const API = "http://localhost:3001/api";



const clienteVazio = {

  nome: "",

  cpf_cnpj: "",

  telefone: "",

  email: "",

  endereco: ""

};



const equipamentoVazio = {

  cliente_id: "",

  marca: "",

  modelo: "",

  numero_serie: "",

  descricao: ""

};



const ordemVazia = {

  equipamento_id: "",

  tecnico_id: "",

  descricao_problema: "",

  diagnostico: "",

  status: "Aberta"

};



const statusOrdens = [

  "Aberta",

  "Em andamento",

  "Aguardando peça",

  "Concluída",

  "Cancelada"

];



function App() {

  // =====================================
  // LOGIN
  // =====================================
  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);



  // =====================================
  // USUÁRIO LOGADO
  // =====================================
  const [usuario, setUsuario] = useState(() => {

    const salvo = localStorage.getItem("usuario");

    return salvo ? JSON.parse(salvo) : null;

  });



  // =====================================
  // DADOS DO SISTEMA
  // =====================================
  const [clientes, setClientes] = useState([]);

  const [equipamentos, setEquipamentos] = useState([]);

  const [ordens, setOrdens] = useState([]);

  const [tecnicos, setTecnicos] = useState([]);



  const [carregandoPainel, setCarregandoPainel] = useState(false);

  const [erroPainel, setErroPainel] = useState("");



  // =====================================
  // NAVEGAÇÃO
  // =====================================
  const [pagina, setPagina] = useState("dashboard");



  // =====================================
  // CONTROLE DE CLIENTES
  // =====================================
  const [pesquisa, setPesquisa] = useState("");

  const [modalCliente, setModalCliente] = useState(false);

  const [clienteEditando, setClienteEditando] = useState(null);

  const [formCliente, setFormCliente] = useState(clienteVazio);

  const [salvandoCliente, setSalvandoCliente] = useState(false);

  const [erroFormulario, setErroFormulario] = useState("");



  // =====================================
  // CONTROLE DE EQUIPAMENTOS
  // =====================================
  const [pesquisaEquipamento, setPesquisaEquipamento] = useState("");

  const [modalEquipamento, setModalEquipamento] = useState(false);

  const [equipamentoEditando, setEquipamentoEditando] = useState(null);

  const [salvandoEquipamento, setSalvandoEquipamento] = useState(false);

  const [erroEquipamento, setErroEquipamento] = useState("");

  const [formEquipamento, setFormEquipamento] = useState(equipamentoVazio);



  // =====================================
  // CONTROLE DE ORDENS DE SERVIÇO
  // =====================================
  const [pesquisaOrdem, setPesquisaOrdem] = useState("");

  const [filtroStatus, setFiltroStatus] = useState("");



  const [modalOrdem, setModalOrdem] = useState(false);

  const [ordemSelecionada, setOrdemSelecionada] = useState(null);



  const [formOrdem, setFormOrdem] = useState(ordemVazia);

  const [salvandoOrdem, setSalvandoOrdem] = useState(false);

  const [erroOrdem, setErroOrdem] = useState("");



  // =====================================
  // HISTÓRICO DAS ORDENS DE SERVIÇO
  // =====================================
  const [historicoOrdem, setHistoricoOrdem] = useState([]);

  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [erroHistorico, setErroHistorico] = useState("");
  // CONTROLE DE USUÁRIOS
  const [usuarios, setUsuarios] = useState([]);
  const [pesquisaUsuario, setPesquisaUsuario] = useState("");
  const [erroUsuarios, setErroUsuarios] = useState("");
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formUsuario, setFormUsuario] = useState({ nome: "", email: "", senha: "", perfil: "tecnico" });
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [modalSenhaUsuario, setModalSenhaUsuario] = useState(false);
  const [usuarioSenhaSelecionado, setUsuarioSenhaSelecionado] = useState(null);
  const [novaSenhaUsuario, setNovaSenhaUsuario] = useState("");
  const [salvandoNovaSenha, setSalvandoNovaSenha] = useState(false);




  // =====================================
  // REALIZAR LOGIN
  // =====================================
  async function realizarLogin(event) {

    event.preventDefault();



    setErro("");

    setCarregando(true);



    try {

      const resposta = await fetch(`${API}/auth/login`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify({ email, senha })

      });



      const dados = await resposta.json();



      if (!resposta.ok) {

        throw new Error(

          dados.mensagem || "Erro ao realizar login."

        );

      }



      localStorage.setItem("token", dados.token);

      localStorage.setItem("usuario", JSON.stringify(dados.usuario));



      setUsuario(dados.usuario);

      setSenha("");

      setMostrarSenha(false);



    } catch (error) {

      setErro(error.message);



    } finally {

      setCarregando(false);

    }

  }



  // =====================================
  // REQUISIÇÕES AUTENTICADAS
  // =====================================
  async function requisicaoAutenticada(url, opcoes = {}) {

    const token = localStorage.getItem("token");



    const resposta = await fetch(url, {

      ...opcoes,

      headers: {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,

        ...opcoes.headers

      }

    });



    const dados = await resposta.json();



    if (!resposta.ok) {

      throw new Error(

        dados.mensagem || "Não foi possível concluir a operação."

      );

    }



    return dados;

  }



  // =====================================
  // CARREGAR DADOS DO SISTEMA
  // =====================================
  async function carregarPainel() {

    if (!usuario) return;



    setCarregandoPainel(true);

    setErroPainel("");



    try {

      const dadosOrdens = await requisicaoAutenticada(

        `${API}/ordens-servico`

      );



      setOrdens(dadosOrdens);



      if (usuario.perfil !== "tecnico") {

        const [

          dadosClientes,

          dadosEquipamentos,

          dadosTecnicos

        ] = await Promise.all([

          requisicaoAutenticada(`${API}/clientes`),

          requisicaoAutenticada(`${API}/equipamentos`),

          requisicaoAutenticada(`${API}/usuarios/tecnicos`)

        ]);



        setClientes(dadosClientes);

        setEquipamentos(dadosEquipamentos);

        setTecnicos(dadosTecnicos);

      }



    } catch (error) {

      setErroPainel(error.message);



    } finally {

      setCarregandoPainel(false);

    }

  }



  // =====================================
  // CARREGAR DADOS QUANDO O USUÁRIO ENTRAR
  // =====================================
  useEffect(() => {

    if (usuario) {

      carregarPainel();

    }

  }, [usuario]);



  // =====================================
  // SAIR DO SISTEMA
  // =====================================
  function sair() {

    localStorage.removeItem("token");

    localStorage.removeItem("usuario");



    setUsuario(null);

    setClientes([]);

    setEquipamentos([]);

    setOrdens([]);

    setTecnicos([]);

    setPagina("dashboard");



    setHistoricoOrdem([]);

    setErroHistorico("");

    setCarregandoHistorico(false);

  }



  // =====================================
  // MÓDULO DE CLIENTES
  // =====================================
  function abrirNovoCliente() {

    setClienteEditando(null);

    setFormCliente(clienteVazio);

    setErroFormulario("");

    setModalCliente(true);

  }



  function abrirEdicaoCliente(cliente) {

    setClienteEditando(cliente);



    setFormCliente({

      nome: cliente.nome || "",

      cpf_cnpj: cliente.cpf_cnpj || "",

      telefone: cliente.telefone || "",

      email: cliente.email || "",

      endereco: cliente.endereco || ""

    });



    setErroFormulario("");

    setModalCliente(true);

  }



  function alterarCampoCliente(event) {

    const { name, value } = event.target;



    setFormCliente((anterior) => ({

      ...anterior,

      [name]: value

    }));

  }



  async function salvarCliente(event) {

    event.preventDefault();



    setErroFormulario("");

    setSalvandoCliente(true);



    try {

      const editando = Boolean(clienteEditando);



      await requisicaoAutenticada(

        editando

          ? `${API}/clientes/${clienteEditando.id}`

          : `${API}/clientes`,

        {

          method: editando ? "PUT" : "POST",

          body: JSON.stringify(formCliente)

        }

      );



      setModalCliente(false);

      setFormCliente(clienteVazio);

      setClienteEditando(null);



      await carregarPainel();



      alert(

        editando

          ? "Cliente atualizado com sucesso!"

          : "Cliente cadastrado com sucesso!"

      );



    } catch (error) {

      setErroFormulario(error.message);



    } finally {

      setSalvandoCliente(false);

    }

  }



  async function excluirCliente(cliente) {

    const confirmou = window.confirm(

      `Deseja realmente excluir o cliente "${cliente.nome}"?`

    );



    if (!confirmou) return;



    try {

      await requisicaoAutenticada(

        `${API}/clientes/${cliente.id}`,

        {

          method: "DELETE"

        }

      );



      await carregarPainel();



      alert("Cliente excluído com sucesso!");



    } catch (error) {

      alert(error.message);

    }

  }



  // FILTRAR CLIENTES
  const clientesFiltrados = clientes.filter((cliente) => {

    const termo = pesquisa.toLowerCase();



    return (

      cliente.nome?.toLowerCase().includes(termo) ||

      cliente.cpf_cnpj?.toLowerCase().includes(termo) ||

      cliente.email?.toLowerCase().includes(termo)

    );

  });



  // =====================================
  // MÓDULO DE EQUIPAMENTOS
  // =====================================
  function abrirNovoEquipamento() {

    setEquipamentoEditando(null);

    setFormEquipamento(equipamentoVazio);

    setErroEquipamento("");

    setModalEquipamento(true);

  }



  function abrirEdicaoEquipamento(equipamento) {

    setEquipamentoEditando(equipamento);



    setFormEquipamento({

      cliente_id: String(equipamento.cliente_id),

      marca: equipamento.marca || "",

      modelo: equipamento.modelo || "",

      numero_serie: equipamento.numero_serie || "",

      descricao: equipamento.descricao || ""

    });



    setErroEquipamento("");

    setModalEquipamento(true);

  }



  function alterarCampoEquipamento(event) {

    const { name, value } = event.target;



    setFormEquipamento((anterior) => ({

      ...anterior,

      [name]: value

    }));

  }



  async function salvarEquipamento(event) {

    event.preventDefault();



    setErroEquipamento("");

    setSalvandoEquipamento(true);



    try {

      const editando = Boolean(equipamentoEditando);



      const dados = {

        ...formEquipamento,

        cliente_id: Number(formEquipamento.cliente_id)

      };



      await requisicaoAutenticada(

        editando

          ? `${API}/equipamentos/${equipamentoEditando.id}`

          : `${API}/equipamentos`,

        {

          method: editando ? "PUT" : "POST",

          body: JSON.stringify(dados)

        }

      );



      setModalEquipamento(false);

      setEquipamentoEditando(null);

      setFormEquipamento(equipamentoVazio);



      await carregarPainel();



      alert(

        editando

          ? "Equipamento atualizado com sucesso!"

          : "Equipamento cadastrado com sucesso!"

      );



    } catch (error) {

      setErroEquipamento(error.message);



    } finally {

      setSalvandoEquipamento(false);

    }

  }



  async function excluirEquipamento(equipamento) {

    const confirmou = window.confirm(

      `Deseja realmente excluir ${equipamento.marca} ${equipamento.modelo}?`

    );



    if (!confirmou) return;



    try {

      await requisicaoAutenticada(

        `${API}/equipamentos/${equipamento.id}`,

        {

          method: "DELETE"

        }

      );



      await carregarPainel();



      alert("Equipamento excluído com sucesso!");



    } catch (error) {

      alert(error.message);

    }

  }



  // FILTRAR EQUIPAMENTOS
  const equipamentosFiltrados = equipamentos.filter((equipamento) => {

    const termo = pesquisaEquipamento.toLowerCase();



    return (

      equipamento.marca?.toLowerCase().includes(termo) ||

      equipamento.modelo?.toLowerCase().includes(termo) ||

      equipamento.numero_serie?.toLowerCase().includes(termo) ||

      equipamento.nome_cliente?.toLowerCase().includes(termo)

    );

  });



  // =====================================
  // MÓDULO DE ORDENS DE SERVIÇO
  // =====================================
  // CARREGAR HISTÓRICO DA ORDEM
  async function carregarHistoricoOrdem(id) {

    setHistoricoOrdem([]);

    setErroHistorico("");

    setCarregandoHistorico(true);



    try {

      const dados = await requisicaoAutenticada(

        `${API}/ordens-servico/${id}/historico`

      );



      setHistoricoOrdem(Array.isArray(dados) ? dados : []);



    } catch (error) {

      setErroHistorico(error.message);



    } finally {

      setCarregandoHistorico(false);

    }

  }



  // ABRIR NOVA ORDEM
  function abrirNovaOrdem() {

    setOrdemSelecionada(null);



    setHistoricoOrdem([]);

    setErroHistorico("");

    setCarregandoHistorico(false);



    setFormOrdem(ordemVazia);

    setErroOrdem("");

    setModalOrdem(true);

  }



  // ABRIR DETALHES DA ORDEM
  function abrirDetalhesOrdem(ordem) {

    setOrdemSelecionada(ordem);



    setFormOrdem({

      equipamento_id: String(ordem.equipamento_id),

      tecnico_id: ordem.tecnico_id

        ? String(ordem.tecnico_id)

        : "",

      descricao_problema: ordem.descricao_problema || "",

      diagnostico: ordem.diagnostico || "",

      status: ordem.status || "Aberta"

    });



    setErroOrdem("");

    setModalOrdem(true);



    carregarHistoricoOrdem(ordem.id);

  }



  // FECHAR MODAL DA ORDEM
  function fecharModalOrdem() {

    setModalOrdem(false);



    setHistoricoOrdem([]);

    setErroHistorico("");

    setCarregandoHistorico(false);

  }



  // ALTERAR CAMPOS DO FORMULÁRIO
  function alterarCampoOrdem(event) {

    const { name, value } = event.target;



    setFormOrdem((anterior) => ({

      ...anterior,

      [name]: value

    }));

  }



  // SALVAR ORDEM
  async function salvarOrdem(event) {

    event.preventDefault();



    setErroOrdem("");

    setSalvandoOrdem(true);



    try {

      const novaOrdem = !ordemSelecionada;



      let dados;



      if (novaOrdem) {

        dados = {

          equipamento_id: Number(formOrdem.equipamento_id),

          tecnico_id: formOrdem.tecnico_id

            ? Number(formOrdem.tecnico_id)

            : null,

          descricao_problema: formOrdem.descricao_problema

        };



        await requisicaoAutenticada(

          `${API}/ordens-servico`,

          {

            method: "POST",

            body: JSON.stringify(dados)

          }

        );



      } else if (usuario.perfil === "administrador") {

        dados = {

          tecnico_id: formOrdem.tecnico_id

            ? Number(formOrdem.tecnico_id)

            : null,

          descricao_problema: formOrdem.descricao_problema,

          diagnostico: formOrdem.diagnostico,

          status: formOrdem.status

        };



        await requisicaoAutenticada(

          `${API}/ordens-servico/${ordemSelecionada.id}`,

          {

            method: "PUT",

            body: JSON.stringify(dados)

          }

        );



      } else if (usuario.perfil === "tecnico") {

        dados = {

          diagnostico: formOrdem.diagnostico,

          status: formOrdem.status

        };



        await requisicaoAutenticada(

          `${API}/ordens-servico/${ordemSelecionada.id}`,

          {

            method: "PUT",

            body: JSON.stringify(dados)

          }

        );

      }



      fecharModalOrdem();



      setOrdemSelecionada(null);

      setFormOrdem(ordemVazia);



      await carregarPainel();



      alert(

        novaOrdem

          ? "Ordem de serviço aberta com sucesso!"

          : "Ordem de serviço atualizada com sucesso!"

      );



    } catch (error) {

      setErroOrdem(error.message);



    } finally {

      setSalvandoOrdem(false);

    }

  }



  // EXCLUIR ORDEM
  async function excluirOrdem(ordem) {

    const confirmou = window.confirm(

      `Deseja realmente excluir a ordem de serviço #${ordem.id}?`

    );



    if (!confirmou) return;



    try {

      await requisicaoAutenticada(

        `${API}/ordens-servico/${ordem.id}`,

        {

          method: "DELETE"

        }

      );



      await carregarPainel();



      alert("Ordem de serviço excluída com sucesso!");



    } catch (error) {

      alert(error.message);

    }

  }



  // FILTRAR ORDENS
  const ordensFiltradas = ordens.filter((ordem) => {

    const termo = pesquisaOrdem.toLowerCase();



    const correspondePesquisa =

      String(ordem.id).includes(termo) ||

      ordem.nome_cliente?.toLowerCase().includes(termo) ||

      ordem.marca?.toLowerCase().includes(termo) ||

      ordem.modelo?.toLowerCase().includes(termo) ||

      ordem.nome_tecnico?.toLowerCase().includes(termo) ||

      ordem.descricao_problema?.toLowerCase().includes(termo);



    const correspondeStatus =

      !filtroStatus || ordem.status === filtroStatus;



    return correspondePesquisa && correspondeStatus;

  });



  // =====================================
  // FUNÇÕES AUXILIARES
  // =====================================
  function formatarData(data) {

    if (!data) return "-";



    return new Date(data).toLocaleDateString("pt-BR");

  }



  function formatarDataHora(data) {

    if (!data) return "-";



    return new Date(data).toLocaleString("pt-BR", {

      day: "2-digit",

      month: "2-digit",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit"

    });

  }



  function nomePerfil(perfil) {

    const perfis = {

      administrador: "Administrador",

      atendente: "Atendente",

      tecnico: "Técnico"

    };



    return perfis[perfil] || perfil;

  }




  // MÓDULO DE USUÁRIOS
  async function carregarUsuarios() {
    if (usuario?.perfil !== "administrador") return;
    setCarregandoUsuarios(true); setErroUsuarios("");
    try {
      const dados = await requisicaoAutenticada(`${API}/usuarios`);
      setUsuarios(Array.isArray(dados) ? dados : []);
    } catch (error) { setErroUsuarios(error.message); }
    finally { setCarregandoUsuarios(false); }
  }

  function abrirNovoUsuario() {
    setUsuarioEditando(null);
    setFormUsuario({ nome: "", email: "", senha: "", perfil: "tecnico" });
    setErroUsuarios(""); setModalUsuario(true);
  }

  function abrirEdicaoUsuario(item) {
    setUsuarioEditando(item);
    setFormUsuario({ nome: item.nome || "", email: item.email || "", senha: "", perfil: item.perfil || "tecnico" });
    setErroUsuarios(""); setModalUsuario(true);
  }

  function alterarCampoUsuario(event) {
    const { name, value } = event.target;
    setFormUsuario((anterior) => ({ ...anterior, [name]: value }));
  }

  async function salvarUsuario(event) {
    event.preventDefault(); setErroUsuarios(""); setSalvandoUsuario(true);
    try {
      const editando = Boolean(usuarioEditando);
      const dados = { nome: formUsuario.nome.trim(), email: formUsuario.email.trim(), perfil: formUsuario.perfil };
      if (!editando) dados.senha = formUsuario.senha;
      await requisicaoAutenticada(
        editando ? `${API}/usuarios/${usuarioEditando.id}` : `${API}/usuarios`,
        { method: editando ? "PUT" : "POST", body: JSON.stringify(dados) }
      );
      setModalUsuario(false); await carregarUsuarios();
      alert(editando ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!");
    } catch (error) { setErroUsuarios(error.message); }
    finally { setSalvandoUsuario(false); }
  }

  async function alterarStatusUsuario(item) {
    const novoStatus = Number(item.ativo) !== 1;
    if (Number(item.id) === Number(usuario.id) && !novoStatus) {
      alert("Você não pode desativar o próprio usuário enquanto estiver conectado."); return;
    }
    const acao = novoStatus ? "ativar" : "desativar";
    if (!window.confirm(`Deseja realmente ${acao} o usuário "${item.nome}"?`)) return;
    try {
      await requisicaoAutenticada(`${API}/usuarios/${item.id}/status`, {
        method: "PATCH", body: JSON.stringify({ ativo: novoStatus })
      });
      await carregarUsuarios();
      alert(novoStatus ? "Usuário ativado com sucesso!" : "Usuário desativado com sucesso!");
    } catch (error) { alert(error.message); }
  }

  function abrirRedefinicaoSenha(item) {
    setUsuarioSenhaSelecionado(item); setNovaSenhaUsuario("");
    setErroUsuarios(""); setModalSenhaUsuario(true);
  }

  async function salvarNovaSenhaUsuario(event) {
    event.preventDefault(); setSalvandoNovaSenha(true); setErroUsuarios("");
    try {
      await requisicaoAutenticada(`${API}/usuarios/${usuarioSenhaSelecionado.id}/senha`, {
        method: "PUT", body: JSON.stringify({ senha: novaSenhaUsuario })
      });
      setModalSenhaUsuario(false); setNovaSenhaUsuario(""); setUsuarioSenhaSelecionado(null);
      alert("Senha redefinida com sucesso!");
    } catch (error) { setErroUsuarios(error.message); }
    finally { setSalvandoNovaSenha(false); }
  }

  const usuariosFiltrados = usuarios.filter((item) => {
    const termo = pesquisaUsuario.toLowerCase();
    return item.nome?.toLowerCase().includes(termo) ||
      item.email?.toLowerCase().includes(termo) ||
      nomePerfil(item.perfil).toLowerCase().includes(termo);
  });

  // =====================================
  // TELA DE LOGIN
  // =====================================
  if (!usuario) {

    return (

      <div className="pagina-login">

        <div className="painel-login">



          <div className="marca">

            <div className="logo">PT</div>

            <h1>

              PrintTech<span>Manager</span>

            </h1>

          </div>



          <div className="conteudo-login">

            <h2>Bem-vindo de volta!</h2>



            <p>

              Entre com suas credenciais para acessar o sistema.

            </p>



            <form onSubmit={realizarLogin}>

              <label>E-mail</label>



              <input

                type="email"

                placeholder="seu@email.com"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

              />



              <label>Senha</label>



              <div className="campo-senha">

                <input

                  type={mostrarSenha ? "text" : "password"}

                  placeholder="Digite sua senha"

                  value={senha}

                  onChange={(e) => setSenha(e.target.value)}

                  required

                />



                <button

                  type="button"

                  className="botao-visualizar"

                  onClick={() => setMostrarSenha(!mostrarSenha)}

                  aria-label={

                    mostrarSenha ? "Ocultar senha" : "Mostrar senha"

                  }

                >

                  {mostrarSenha ? "🙈" : "👁"}

                </button>

              </div>



              {erro && (

                <div className="mensagem-erro">

                  {erro}

                </div>

              )}



              <button type="submit" disabled={carregando}>

                {carregando ? "Entrando..." : "Entrar no sistema"}

              </button>

            </form>

          </div>



          <footer>

            © 2026 PrintTech Soluções. Todos os direitos reservados.

          </footer>



        </div>



        <div className="painel-apresentacao">

          <div className="apresentacao-texto">

            <span className="etiqueta">

              GESTÃO INTELIGENTE

            </span>



            <h2>Controle total da sua operação.</h2>



            <p>

              Gerencie clientes, equipamentos e ordens de serviço

              em um único lugar.

            </p>



            <div className="destaques">

              <div>✓ Gestão de clientes</div>

              <div>✓ Controle de equipamentos</div>

              <div>✓ Acompanhamento de serviços</div>

            </div>

          </div>

        </div>

      </div>

    );

  }



  // =====================================
  // SISTEMA PRINCIPAL
  // =====================================
  return (

    <div className="layout-sistema">



      {/* MENU LATERAL */}



      <aside className="menu-lateral">



        <div className="marca marca-menu">

          <div className="logo">PT</div>

          <h1>

            PrintTech<span>Manager</span>

          </h1>

        </div>



        <div className="menu-titulo">

          MENU PRINCIPAL

        </div>



        <nav>



          <button

            className={`item-menu ${

              pagina === "dashboard" ? "selecionado" : ""

            }`}

            onClick={() => setPagina("dashboard")}

          >

            <span>▦</span> Dashboard

          </button>



          {usuario.perfil !== "tecnico" && (

            <button

              className={`item-menu ${

                pagina === "clientes" ? "selecionado" : ""

              }`}

              onClick={() => {

                setPagina("clientes");

                setPesquisa("");

              }}

            >

              <span>♙</span> Clientes

            </button>

          )}



          {usuario.perfil !== "tecnico" && (

            <button

              className={`item-menu ${

                pagina === "equipamentos" ? "selecionado" : ""

              }`}

              onClick={() => {

                setPagina("equipamentos");

                setPesquisaEquipamento("");

              }}

            >

              <span>▣</span> Equipamentos

            </button>

          )}



          <button

            className={`item-menu ${

              pagina === "ordens" ? "selecionado" : ""

            }`}

            onClick={() => {

              setPagina("ordens");

              setPesquisaOrdem("");

              setFiltroStatus("");

            }}

          >

            <span>▤</span> Ordens de serviço

          </button>



          {usuario.perfil === "administrador" && (
            <button
              className={`item-menu ${pagina === "usuarios" ? "selecionado" : ""}`}
              onClick={() => { setPagina("usuarios"); setPesquisaUsuario(""); carregarUsuarios(); }}
            >
              <span>♧</span> Usuários
            </button>
          )}



        </nav>



        {/* USUÁRIO E BOTÃO SAIR */}



        <div className="menu-rodape">



          <div className="avatar">

            {usuario.nome.charAt(0).toUpperCase()}

          </div>



          <div className="dados-usuario">

            <strong>{usuario.nome}</strong>

            <span>{nomePerfil(usuario.perfil)}</span>

          </div>



          <button

            className="botao-sair"

            onClick={sair}

            title="Sair"

          >

            ⇥

          </button>



        </div>



      </aside>



      {/* CONTEÚDO PRINCIPAL */}



      <main className="conteudo-principal">



        {/* CABEÇALHO */}



        <header className="topo-painel">



          <div>

            <h2>

              {pagina === "dashboard"

                ? "Dashboard"

                : pagina === "clientes"

                  ? "Clientes"

                  : pagina === "equipamentos"

                    ? "Equipamentos"

                    : pagina === "ordens" ? "Ordens de Serviço" : "Usuários"}

            </h2>



            <p>

              {pagina === "dashboard"

                ? "Visão geral da operação PrintTech."

                : pagina === "clientes"

                  ? "Gerencie os clientes cadastrados no sistema."

                  : pagina === "equipamentos"

                    ? "Gerencie os equipamentos cadastrados no sistema."

                    : pagina === "ordens"
                      ? "Consulte e acompanhe as ordens de serviço."
                      : "Cadastre, edite e gerencie os acessos dos usuários."}

            </p>

          </div>



          <div className="usuario-topo">



            <div className="avatar">

              {usuario.nome.charAt(0).toUpperCase()}

            </div>



            <div>

              <strong>{usuario.nome}</strong>

              <span>{nomePerfil(usuario.perfil)}</span>

            </div>



          </div>



        </header>



        {erroPainel && (

          <div className="mensagem-erro">

            {erroPainel}

          </div>

        )}



        {/* =====================================*

*            DASHBOARD*

*        ===================================== */}



        {pagina === "dashboard" && (

          <>



            <section className="boas-vindas">



              <div>

                <h2>

                  Olá, {usuario.nome.split(" ")[0]}!

                </h2>



                <p>

                  Confira o resumo das atividades do sistema.

                </p>

              </div>



              <button

                onClick={carregarPainel}

                disabled={carregandoPainel}

              >

                ↻ {carregandoPainel ? "Atualizando..." : "Atualizar dados"}

              </button>



            </section>



            {/* INDICADORES */}



            <section className="indicadores">



              {usuario.perfil !== "tecnico" && (

                <>

                  <div className="card-indicador">

                    <div className="icone-indicador azul">♙</div>

                    <span>Total de clientes</span>

                    <strong>{clientes.length}</strong>

                    <small>Clientes cadastrados</small>

                  </div>



                  <div className="card-indicador">

                    <div className="icone-indicador roxo">▣</div>

                    <span>Equipamentos</span>

                    <strong>{equipamentos.length}</strong>

                    <small>Equipamentos cadastrados</small>

                  </div>

                </>

              )}



              <div className="card-indicador">

                <div className="icone-indicador laranja">▤</div>

                <span>Ordens de serviço</span>

                <strong>{ordens.length}</strong>

                <small>Ordens visíveis para seu perfil</small>

              </div>



              <div className="card-indicador">

                <div className="icone-indicador verde">◷</div>

                <span>Em andamento</span>



                <strong>

                  {

                    ordens.filter(

                      (ordem) => ordem.status === "Em andamento"

                    ).length

                  }

                </strong>



                <small>Serviços em execução</small>

              </div>



            </section>



            {/* ORDENS RECENTES */}



            <section className="secao-ordens">



              <div className="titulo-secao">

                <div>

                  <h3>Ordens de serviço recentes</h3>

                  <p>Acompanhe as últimas movimentações.</p>

                </div>

              </div>



              {carregandoPainel ? (

                <p className="estado-vazio">

                  Carregando informações...

                </p>

              ) : ordens.length === 0 ? (

                <p className="estado-vazio">

                  Nenhuma ordem de serviço encontrada.

                </p>

              ) : (

                <div className="tabela-responsiva">



                  <table>

                    <thead>

                      <tr>

                        <th>Nº</th>

                        <th>Cliente</th>

                        <th>Equipamento</th>

                        <th>Técnico</th>

                        <th>Abertura</th>

                        <th>Status</th>

                      </tr>

                    </thead>



                    <tbody>

                      {ordens.slice(0, 8).map((ordem) => (

                        <tr key={ordem.id}>

                          <td>#{ordem.id}</td>

                          <td>{ordem.nome_cliente}</td>

                          <td>

                            {ordem.marca} {ordem.modelo}

                          </td>

                          <td>

                            {ordem.nome_tecnico || "Não atribuído"}

                          </td>

                          <td>{formatarData(ordem.data_abertura)}</td>

                          <td>

                            <span

                              className={`status status-${ordem.status

                                .toLowerCase()

                                .replaceAll(" ", "-")}`}

                            >

                              {ordem.status}

                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>



                </div>

              )}



            </section>



          </>

        )}



        {/* =====================================*

*            TELA DE CLIENTES*

*        ===================================== */}



        {pagina === "clientes" && (

          <section className="secao-clientes">



            <div className="cabecalho-clientes">



              <div>

                <h2>Clientes cadastrados</h2>

                <p>

                  Consulte, cadastre e atualize os dados dos clientes.

                </p>

              </div>



              <button

                className="botao-novo"

                onClick={abrirNovoCliente}

              >

                + Novo cliente

              </button>



            </div>



            <div className="barra-pesquisa">

              <span>⌕</span>



              <input

                type="text"

                placeholder="Pesquisar por nome, CPF/CNPJ ou e-mail..."

                value={pesquisa}

                onChange={(e) => setPesquisa(e.target.value)}

              />

            </div>



            <div className="tabela-clientes">



              {carregandoPainel ? (

                <p className="estado-vazio">

                  Carregando clientes...

                </p>

              ) : clientesFiltrados.length === 0 ? (

                <p className="estado-vazio">

                  Nenhum cliente encontrado.

                </p>

              ) : (



                <div className="tabela-responsiva">



                  <table>

                    <thead>

                      <tr>

                        <th>Cliente</th>

                        <th>CPF/CNPJ</th>

                        <th>Telefone</th>

                        <th>E-mail</th>

                        <th>Cadastro</th>

                        <th>Ações</th>

                      </tr>

                    </thead>



                    <tbody>

                      {clientesFiltrados.map((cliente) => (

                        <tr key={cliente.id}>



                          <td>

                            <strong>{cliente.nome}</strong>

                          </td>



                          <td>{cliente.cpf_cnpj}</td>

                          <td>{cliente.telefone}</td>

                          <td>{cliente.email || "-"}</td>

                          <td>{formatarData(cliente.data_criacao)}</td>



                          <td>

                            <div className="acoes-cliente">



                              <button

                                className="botao-editar"

                                onClick={() => abrirEdicaoCliente(cliente)}

                              >

                                Editar

                              </button>



                              <button

                                className="botao-excluir"

                                onClick={() => excluirCliente(cliente)}

                              >

                                Excluir

                              </button>



                            </div>

                          </td>



                        </tr>

                      ))}

                    </tbody>

                  </table>



                </div>



              )}



            </div>



            <p className="total-clientes">

              Exibindo {clientesFiltrados.length} de {clientes.length} cliente(s).

            </p>



          </section>

        )}



        {/* =====================================*

*            TELA DE EQUIPAMENTOS*

*        ===================================== */}



        {pagina === "equipamentos" && (

          <section className="secao-clientes">



            <div className="cabecalho-clientes">



              <div>

                <h2>Equipamentos cadastrados</h2>

                <p>

                  Consulte e gerencie os equipamentos dos clientes.

                </p>

              </div>



              <button

                className="botao-novo"

                onClick={abrirNovoEquipamento}

              >

                + Novo equipamento

              </button>



            </div>



            <div className="barra-pesquisa">

              <span>⌕</span>



              <input

                type="text"

                placeholder="Pesquisar por marca, modelo, série ou cliente..."

                value={pesquisaEquipamento}

                onChange={(e) => setPesquisaEquipamento(e.target.value)}

              />

            </div>



            <div className="tabela-clientes">



              {carregandoPainel ? (

                <p className="estado-vazio">

                  Carregando equipamentos...

                </p>

              ) : equipamentosFiltrados.length === 0 ? (

                <p className="estado-vazio">

                  Nenhum equipamento encontrado.

                </p>

              ) : (



                <div className="tabela-responsiva">



                  <table>

                    <thead>

                      <tr>

                        <th>Marca</th>

                        <th>Modelo</th>

                        <th>Número de série</th>

                        <th>Cliente</th>

                        <th>Ações</th>

                      </tr>

                    </thead>



                    <tbody>

                      {equipamentosFiltrados.map((equipamento) => (

                        <tr key={equipamento.id}>



                          <td>

                            <strong>{equipamento.marca}</strong>

                          </td>



                          <td>{equipamento.modelo}</td>

                          <td>{equipamento.numero_serie || "-"}</td>

                          <td>{equipamento.nome_cliente}</td>



                          <td>

                            <div className="acoes-cliente">



                              <button

                                className="botao-editar"

                                onClick={() =>

                                  abrirEdicaoEquipamento(equipamento)

                                }

                              >

                                Editar

                              </button>



                              <button

                                className="botao-excluir"

                                onClick={() =>

                                  excluirEquipamento(equipamento)

                                }

                              >

                                Excluir

                              </button>



                            </div>

                          </td>



                        </tr>

                      ))}

                    </tbody>

                  </table>



                </div>



              )}



            </div>



            <p className="total-clientes">

              Exibindo {equipamentosFiltrados.length} de {equipamentos.length} equipamento(s).

            </p>



          </section>

        )}



        {/* =====================================*

*            TELA DE ORDENS DE SERVIÇO*

*        ===================================== */}



        {pagina === "ordens" && (

          <section className="secao-clientes">



            <div className="cabecalho-clientes">



              <div>

                <h2>Ordens de serviço</h2>

                <p>

                  Consulte e acompanhe os serviços realizados.

                </p>

              </div>



              {usuario.perfil !== "tecnico" && (

                <button

                  className="botao-novo"

                  onClick={abrirNovaOrdem}

                  disabled={equipamentos.length === 0}

                >

                  + Nova ordem de serviço

                </button>

              )}



            </div>



            {/* FILTROS */}



            <div className="filtros-ordens">



              <div className="barra-pesquisa">

                <span>⌕</span>



                <input

                  type="text"

                  placeholder="Pesquisar por número, cliente, equipamento, descrição ou técnico..."

                  value={pesquisaOrdem}

                  onChange={(e) => setPesquisaOrdem(e.target.value)}

                />

              </div>



              <select

                value={filtroStatus}

                onChange={(e) => setFiltroStatus(e.target.value)}

              >

                <option value="">Todos os status</option>



                {statusOrdens.map((status) => (

                  <option key={status} value={status}>

                    {status}

                  </option>

                ))}



              </select>



            </div>



            {/* TABELA */}



            <div className="tabela-clientes">



              {carregandoPainel ? (

                <p className="estado-vazio">

                  Carregando ordens de serviço...

                </p>

              ) : ordensFiltradas.length === 0 ? (

                <p className="estado-vazio">

                  Nenhuma ordem de serviço encontrada.

                </p>

              ) : (



                <div className="tabela-responsiva">



                  <table>

                    <thead>

                      <tr>

                        <th>Nº</th>

                        <th>Cliente</th>

                        <th>Equipamento</th>

                        <th>Descrição do problema</th>

                        <th>Técnico</th>

                        <th>Abertura</th>

                        <th>Status</th>

                        <th>Ações</th>

                      </tr>

                    </thead>



                    <tbody>

                      {ordensFiltradas.map((ordem) => (



                        <tr key={ordem.id}>



                          <td>

                            <strong>#{ordem.id}</strong>

                          </td>



                          <td>{ordem.nome_cliente}</td>



                          <td>

                            {ordem.marca} {ordem.modelo}

                          </td>



                          <td className="descricao-tabela">

                            {ordem.descricao_problema || "Não informada"}

                          </td>



                          <td>

                            {ordem.nome_tecnico || "Não atribuído"}

                          </td>



                          <td>

                            {formatarData(ordem.data_abertura)}

                          </td>



                          <td>

                            <span

                              className={`status status-${ordem.status

                                .toLowerCase()

                                .replaceAll(" ", "-")}`}

                            >

                              {ordem.status}

                            </span>

                          </td>



                          <td>

                            <div className="acoes-cliente">



                              <button

                                className="botao-editar"

                                onClick={() => abrirDetalhesOrdem(ordem)}

                              >

                                {usuario.perfil === "atendente"

                                  ? "Visualizar"

                                  : "Detalhes"}

                              </button>



                              {usuario.perfil === "administrador" && (

                                <button

                                  className="botao-excluir"

                                  onClick={() => excluirOrdem(ordem)}

                                >

                                  Excluir

                                </button>

                              )}



                            </div>

                          </td>



                        </tr>



                      ))}

                    </tbody>

                  </table>



                </div>



              )}



            </div>



            <p className="total-clientes">

              Exibindo {ordensFiltradas.length} de {ordens.length} ordem(ns) de serviço.

            </p>



          </section>

        )}




        {/* TELA DE USUÁRIOS */}
        {pagina === "usuarios" && usuario.perfil === "administrador" && (
          <section className="secao-clientes">
            <div className="cabecalho-clientes">
              <div><h2>Usuários cadastrados</h2><p>Gerencie os acessos de administradores, atendentes e técnicos.</p></div>
              <button className="botao-novo" onClick={abrirNovoUsuario}>+ Novo usuário</button>
            </div>
            <div className="barra-pesquisa">
              <span>⌕</span>
              <input type="text" placeholder="Pesquisar por nome, e-mail ou perfil..." value={pesquisaUsuario} onChange={(e) => setPesquisaUsuario(e.target.value)} />
            </div>
            {erroUsuarios && <div className="mensagem-erro">{erroUsuarios}</div>}
            <div className="tabela-clientes">
              {carregandoUsuarios ? <p className="estado-vazio">Carregando usuários...</p> :
                usuariosFiltrados.length === 0 ? <p className="estado-vazio">Nenhum usuário encontrado.</p> : (
                <div className="tabela-responsiva">
                  <table>
                    <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>{usuariosFiltrados.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.nome}</strong></td><td>{item.email}</td><td>{nomePerfil(item.perfil)}</td>
                        <td><span className={`status ${Number(item.ativo) === 1 ? "status-concluida" : "status-cancelada"}`}>{Number(item.ativo) === 1 ? "Ativo" : "Inativo"}</span></td>
                        <td><div className="acoes-cliente">
                          <button className="botao-editar" onClick={() => abrirEdicaoUsuario(item)}>Editar</button>
                          <button className="botao-editar" onClick={() => abrirRedefinicaoSenha(item)}>Senha</button>
                          <button className={Number(item.ativo) === 1 ? "botao-excluir" : "botao-editar"} onClick={() => alterarStatusUsuario(item)} disabled={Number(item.id) === Number(usuario.id) && Number(item.ativo) === 1}>{Number(item.ativo) === 1 ? "Desativar" : "Ativar"}</button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
            <p className="total-clientes">Exibindo {usuariosFiltrados.length} de {usuarios.length} usuário(s).</p>
          </section>
        )}
      </main>



      {/* =====================================*

*          MODAL DE CLIENTES*

*      ===================================== */}



      {modalCliente && (

        <div

          className="fundo-modal"

          onClick={() => setModalCliente(false)}

        >



          <div

            className="modal-cliente"

            onClick={(e) => e.stopPropagation()}

          >



            <div className="cabecalho-modal">



              <div>

                <h2>

                  {clienteEditando ? "Editar cliente" : "Novo cliente"}

                </h2>



                <p>

                  Preencha os dados para{" "}

                  {clienteEditando ? "atualizar" : "cadastrar"} o cliente.

                </p>

              </div>



              <button

                className="fechar-modal"

                onClick={() => setModalCliente(false)}

              >

                ×

              </button>



            </div>



            <form onSubmit={salvarCliente}>



              <label>Nome completo / Razão social *</label>



              <input

                name="nome"

                value={formCliente.nome}

                onChange={alterarCampoCliente}

                placeholder="Digite o nome do cliente"

                required

              />



              <label>CPF/CNPJ *</label>



              <input

                name="cpf_cnpj"

                value={formCliente.cpf_cnpj}

                onChange={alterarCampoCliente}

                placeholder="Digite o CPF ou CNPJ"

                required

              />



              <label>Telefone *</label>



              <input

                name="telefone"

                value={formCliente.telefone}

                onChange={alterarCampoCliente}

                placeholder="(00) 00000-0000"

                required

              />



              <label>E-mail</label>



              <input

                type="email"

                name="email"

                value={formCliente.email}

                onChange={alterarCampoCliente}

                placeholder="cliente@email.com"

              />



              <label>Endereço</label>



              <input

                name="endereco"

                value={formCliente.endereco}

                onChange={alterarCampoCliente}

                placeholder="Rua, número, bairro e cidade"

              />



              {erroFormulario && (

                <div className="mensagem-erro">

                  {erroFormulario}

                </div>

              )}



              <div className="botoes-modal">



                <button

                  type="button"

                  className="botao-cancelar"

                  onClick={() => setModalCliente(false)}

                >

                  Cancelar

                </button>



                <button

                  type="submit"

                  disabled={salvandoCliente}

                >

                  {salvandoCliente

                    ? "Salvando..."

                    : clienteEditando

                      ? "Salvar alterações"

                      : "Cadastrar cliente"}

                </button>



              </div>



            </form>



          </div>



        </div>

      )}



      {/* =====================================*

*          MODAL DE EQUIPAMENTOS*

*      ===================================== */}



      {modalEquipamento && (

        <div

          className="fundo-modal"

          onClick={() => setModalEquipamento(false)}

        >



          <div

            className="modal-cliente"

            onClick={(e) => e.stopPropagation()}

          >



            <div className="cabecalho-modal">



              <div>

                <h2>

                  {equipamentoEditando

                    ? "Editar equipamento"

                    : "Novo equipamento"}

                </h2>



                <p>

                  Preencha as informações do equipamento.

                </p>

              </div>



              <button

                className="fechar-modal"

                onClick={() => setModalEquipamento(false)}

              >

                ×

              </button>



            </div>



            <form onSubmit={salvarEquipamento}>



              <label>Cliente proprietário *</label>



              <select

                name="cliente_id"

                value={formEquipamento.cliente_id}

                onChange={alterarCampoEquipamento}

                required

              >

                <option value="">

                  Selecione um cliente

                </option>



                {clientes.map((cliente) => (

                  <option key={cliente.id} value={cliente.id}>

                    {cliente.nome}

                  </option>

                ))}



              </select>



              <label>Marca *</label>



              <input

                name="marca"

                value={formEquipamento.marca}

                onChange={alterarCampoEquipamento}

                placeholder="Ex.: Epson"

                required

              />



              <label>Modelo *</label>



              <input

                name="modelo"

                value={formEquipamento.modelo}

                onChange={alterarCampoEquipamento}

                placeholder="Ex.: EcoTank L3250"

                required

              />



              <label>Número de série</label>



              <input

                name="numero_serie"

                value={formEquipamento.numero_serie}

                onChange={alterarCampoEquipamento}

                placeholder="Número de série do equipamento"

              />



              <label>Descrição</label>



              <textarea

                name="descricao"

                value={formEquipamento.descricao}

                onChange={alterarCampoEquipamento}

                placeholder="Informações adicionais sobre o equipamento"

                rows="3"

              />



              {erroEquipamento && (

                <div className="mensagem-erro">

                  {erroEquipamento}

                </div>

              )}



              <div className="botoes-modal">



                <button

                  type="button"

                  className="botao-cancelar"

                  onClick={() => setModalEquipamento(false)}

                >

                  Cancelar

                </button>



                <button

                  type="submit"

                  disabled={salvandoEquipamento}

                >

                  {salvandoEquipamento

                    ? "Salvando..."

                    : equipamentoEditando

                      ? "Salvar alterações"

                      : "Cadastrar equipamento"}

                </button>



              </div>



            </form>



          </div>



        </div>

      )}



      {/* =====================================*

*          MODAL DE ORDENS DE SERVIÇO*

*      ===================================== */}



      {modalOrdem && (

        <div

          className="fundo-modal"

          onClick={fecharModalOrdem}

        >



          <div

            className="modal-cliente"

            onClick={(e) => e.stopPropagation()}

          >



            <div className="cabecalho-modal">



              <div>

                <h2>

                  {!ordemSelecionada

                    ? "Nova ordem de serviço"

                    : `Ordem de serviço #${ordemSelecionada.id}`}

                </h2>



                <p>

                  {!ordemSelecionada

                    ? "Preencha os dados para abrir uma nova ordem."

                    : "Consulte ou atualize as informações da ordem."}

                </p>

              </div>



              <button

                className="fechar-modal"

                onClick={fecharModalOrdem}

              >

                ×

              </button>



            </div>



            <form onSubmit={salvarOrdem}>



              {!ordemSelecionada ? (

                <>



                  <label>Equipamento *</label>



                  <select

                    name="equipamento_id"

                    value={formOrdem.equipamento_id}

                    onChange={alterarCampoOrdem}

                    required

                  >

                    <option value="">

                      Selecione um equipamento

                    </option>



                    {equipamentos.map((equipamento) => (

                      <option

                        key={equipamento.id}

                        value={equipamento.id}

                      >

                        {equipamento.marca} {equipamento.modelo} - {equipamento.nome_cliente}

                      </option>

                    ))}



                  </select>



                  <label>Técnico responsável</label>



                  <select

                    name="tecnico_id"

                    value={formOrdem.tecnico_id}

                    onChange={alterarCampoOrdem}

                  >

                    <option value="">

                      Não atribuir técnico agora

                    </option>



                    {tecnicos.map((tecnico) => (

                      <option key={tecnico.id} value={tecnico.id}>

                        {tecnico.nome}

                      </option>

                    ))}



                  </select>



                  <label>Descrição do problema *</label>



                  <textarea

                    name="descricao_problema"

                    value={formOrdem.descricao_problema}

                    onChange={alterarCampoOrdem}

                    placeholder="Descreva o problema apresentado pelo equipamento..."

                    rows="4"

                    required

                  />



                </>

              ) : (

                <>



                  <div className="informacao-ordem">

                    <strong>Cliente:</strong>

                    <span>{ordemSelecionada.nome_cliente}</span>



                    <strong>Equipamento:</strong>

                    <span>

                      {ordemSelecionada.marca} {ordemSelecionada.modelo}

                    </span>



                    <strong>Número de série:</strong>

                    <span>{ordemSelecionada.numero_serie || "-"}</span>



                    <strong>Data de abertura:</strong>

                    <span>

                      {formatarData(ordemSelecionada.data_abertura)}

                    </span>

                  </div>



                  {/* DESCRIÇÃO DO PROBLEMA */}



                  {usuario.perfil === "administrador" ? (

                    <>

                      <label>Descrição do problema</label>



                      <textarea

                        name="descricao_problema"

                        value={formOrdem.descricao_problema}

                        onChange={alterarCampoOrdem}

                        rows="3"

                      />

                    </>

                  ) : (

                    <div className="descricao-problema">

                      <strong>Descrição do problema informado:</strong>



                      <p>

                        {formOrdem.descricao_problema ||

                          "Nenhuma descrição informada."}

                      </p>

                    </div>

                  )}



                  {usuario.perfil === "administrador" && (

                    <>

                      <label>Técnico responsável</label>



                      <select

                        name="tecnico_id"

                        value={formOrdem.tecnico_id}

                        onChange={alterarCampoOrdem}

                      >

                        <option value="">

                          Não atribuído

                        </option>



                        {tecnicos.map((tecnico) => (

                          <option key={tecnico.id} value={tecnico.id}>

                            {tecnico.nome}

                          </option>

                        ))}



                      </select>

                    </>

                  )}



                  <label>Diagnóstico técnico</label>



                  <textarea

                    name="diagnostico"

                    value={formOrdem.diagnostico}

                    onChange={alterarCampoOrdem}

                    placeholder="Descreva o diagnóstico e os procedimentos realizados..."

                    rows="4"

                    disabled={usuario.perfil === "atendente"}

                  />



                  <label>Status da ordem</label>



                  <select

                    name="status"

                    value={formOrdem.status}

                    onChange={alterarCampoOrdem}

                    disabled={usuario.perfil === "atendente"}

                  >

                    {statusOrdens.map((status) => (

                      <option key={status} value={status}>

                        {status}

                      </option>

                    ))}

                  </select>



                  <div className="informacao-ordem">

                    <strong>Responsável pelo cadastro:</strong>

                    <span>

                      {ordemSelecionada.nome_responsavel || "-"}

                    </span>



                    <strong>Conclusão:</strong>

                    <span>

                      {formatarData(ordemSelecionada.data_conclusao)}

                    </span>

                  </div>



                  {/* =====================================*

*                      HISTÓRICO DA ORDEM DE SERVIÇO*

*                  ===================================== */}



                  <section className="secao-historico">



                    <div className="titulo-historico">



                      <div>

                        <h3>Histórico da ordem de serviço</h3>



                        <p>

                          Acompanhe todas as alterações realizadas nesta ordem.

                        </p>

                      </div>



                    </div>



                    {carregandoHistorico ? (



                      <p className="estado-vazio">

                        Carregando histórico...

                      </p>



                    ) : erroHistorico ? (



                      <div className="mensagem-erro">

                        {erroHistorico}

                      </div>



                    ) : historicoOrdem.length === 0 ? (



                      <p className="estado-vazio">

                        Nenhuma movimentação registrada.

                      </p>



                    ) : (



                      <div className="linha-do-tempo">



                        {historicoOrdem.map((item) => (



                          <div

                            className="item-historico"

                            key={item.id}

                          >



                            <div className="marcador-historico"></div>



                            <div className="conteudo-historico">



                              <div className="cabecalho-historico">



                                <strong>

                                  {item.tipo}

                                </strong>



                                <span>

                                  {formatarDataHora(item.data_registro)}

                                </span>



                              </div>



                              <p>

                                {item.descricao}

                              </p>



                              <small>

                                Registrado por:{" "}

                                {item.nome_usuario || "Usuário não identificado"}

                              </small>



                            </div>



                          </div>



                        ))}



                      </div>



                    )}



                  </section>



                </>

              )}



              {erroOrdem && (

                <div className="mensagem-erro">

                  {erroOrdem}

                </div>

              )}



              <div className="botoes-modal">



                <button

                  type="button"

                  className="botao-cancelar"

                  onClick={fecharModalOrdem}

                >

                  Fechar

                </button>



                {(

                  !ordemSelecionada ||

                  usuario.perfil === "administrador" ||

                  usuario.perfil === "tecnico"

                ) && (

                  <button

                    type="submit"

                    disabled={salvandoOrdem}

                  >

                    {salvandoOrdem

                      ? "Salvando..."

                      : !ordemSelecionada

                        ? "Abrir ordem de serviço"

                        : "Salvar alterações"}

                  </button>

                )}



              </div>



            </form>



          </div>



        </div>

      )}




      {/* MODAL DE CADASTRO E EDIÇÃO DE USUÁRIO */}
      {modalUsuario && (
        <div className="fundo-modal" onClick={() => setModalUsuario(false)}>
          <div className="modal-cliente" onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div><h2>{usuarioEditando ? "Editar usuário" : "Novo usuário"}</h2><p>Informe os dados de acesso ao sistema.</p></div>
              <button type="button" className="fechar-modal" onClick={() => setModalUsuario(false)}>×</button>
            </div>
            <form onSubmit={salvarUsuario}>
              <label>Nome completo *</label>
              <input name="nome" value={formUsuario.nome} onChange={alterarCampoUsuario} placeholder="Digite o nome completo" required />
              <label>E-mail *</label>
              <input type="email" name="email" value={formUsuario.email} onChange={alterarCampoUsuario} placeholder="usuario@printtech.com" required />
              {!usuarioEditando && <><label>Senha inicial *</label><input type="password" name="senha" value={formUsuario.senha} onChange={alterarCampoUsuario} placeholder="Mínimo de 8 caracteres" minLength="8" required /></>}
              <label>Perfil *</label>
              <select name="perfil" value={formUsuario.perfil} onChange={alterarCampoUsuario} required>
                <option value="administrador">Administrador</option><option value="atendente">Atendente</option><option value="tecnico">Técnico</option>
              </select>
              {erroUsuarios && <div className="mensagem-erro">{erroUsuarios}</div>}
              <div className="botoes-modal">
                <button type="button" className="botao-cancelar" onClick={() => setModalUsuario(false)}>Cancelar</button>
                <button type="submit" disabled={salvandoUsuario}>{salvandoUsuario ? "Salvando..." : usuarioEditando ? "Salvar alterações" : "Cadastrar usuário"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE REDEFINIÇÃO DE SENHA */}
      {modalSenhaUsuario && usuarioSenhaSelecionado && (
        <div className="fundo-modal" onClick={() => setModalSenhaUsuario(false)}>
          <div className="modal-cliente" onClick={(e) => e.stopPropagation()}>
            <div className="cabecalho-modal">
              <div><h2>Redefinir senha</h2><p>Defina uma nova senha para {usuarioSenhaSelecionado.nome}.</p></div>
              <button type="button" className="fechar-modal" onClick={() => setModalSenhaUsuario(false)}>×</button>
            </div>
            <form onSubmit={salvarNovaSenhaUsuario}>
              <label>Nova senha *</label>
              <input type="password" value={novaSenhaUsuario} onChange={(e) => setNovaSenhaUsuario(e.target.value)} placeholder="Mínimo de 8 caracteres" minLength="8" required />
              {erroUsuarios && <div className="mensagem-erro">{erroUsuarios}</div>}
              <div className="botoes-modal">
                <button type="button" className="botao-cancelar" onClick={() => setModalSenhaUsuario(false)}>Cancelar</button>
                <button type="submit" disabled={salvandoNovaSenha}>{salvandoNovaSenha ? "Salvando..." : "Redefinir senha"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );

}



export default App;
