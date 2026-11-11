# PrintTech-Manager
Sistema web para gerenciamento de assistência técnica, com controle de clientes, equipamentos, ordens de serviço, usuários e histórico de atendimentos. Desenvolvido com React, Node.js, Express e MySQL.

# PrintTech Manager

**Sistema Web de Gerenciamento de Assistência Técnica**

O PrintTech Manager é uma aplicação web desenvolvida para auxiliar na organização e no gerenciamento das atividades de uma assistência técnica especializada em impressoras.

O sistema foi projetado para centralizar informações de clientes, equipamentos, ordens de serviço e usuários, proporcionando uma experiência moderna, organizada e de fácil utilização.

## Objetivo do Projeto

Desenvolver uma solução web que facilite o gerenciamento dos processos de assistência técnica, permitindo maior controle das ordens de serviço, acompanhamento dos atendimentos e organização das informações.

## Funcionalidades

- **Autenticação:** acesso ao sistema por meio de login e senha, utilizando autenticação JWT.
- **Dashboard:** painel inicial para acesso às funcionalidades do sistema.
- **Gerenciamento de clientes:** cadastro, consulta, edição e exclusão de clientes.
- **Gerenciamento de equipamentos:** cadastro e organização dos equipamentos vinculados aos clientes.
- **Ordens de serviço:** abertura, edição, atribuição de técnicos e acompanhamento dos serviços.
- **Histórico de atendimentos:** registro das alterações e movimentações realizadas nas ordens de serviço.
- **Gerenciamento de usuários:** cadastro, edição, ativação, desativação e redefinição de senhas.
- **Controle de acesso:** permissões específicas conforme o perfil do usuário.

## Perfis de Usuário

O sistema possui três perfis de acesso:

| Perfil | Permissões |
|---|---|
| Administrador | Gerenciamento de usuários e acesso administrativo às funcionalidades. |
| Atendente | Gerenciamento de clientes, equipamentos e ordens de serviço. |
| Técnico | Acesso às funcionalidades permitidas para acompanhamento e execução dos serviços. |

## Tecnologias Utilizadas

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express
- JavaScript
- JSON Web Token (JWT)

### Banco de Dados
- MySQL

### Comunicação
- API REST
- Requisições HTTP entre frontend e backend.

## Estrutura do Projeto

```text
PrintTech-Manager/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── Routes/
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Instalação e Execução

### Pré-requisitos

Antes de iniciar, certifique-se de possuir:

- Node.js instalado.
- MySQL instalado e configurado.
- Git instalado.
- Um editor de código, como Visual Studio Code.

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd PrintTech-Manager
```

### 2. Configurar o Backend

Acesse a pasta:

```bash
cd Backend
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente necessárias para a conexão com o banco de dados e para a autenticação, conforme a configuração utilizada pelo projeto.

### 3. Configurar o Frontend

Abra outro terminal e acesse a pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

### 4. Executar a aplicação

Inicie o Backend e o Frontend utilizando os scripts configurados nos respectivos arquivos `package.json`.

A aplicação utiliza a API local:

```text
http://localhost:3001/api
```

A interface é executada pelo servidor de desenvolvimento do Vite, utilizando o endereço apresentado no terminal.

## Segurança

O projeto utiliza autenticação JWT e controle de acesso por perfil de usuário.

**Importante:** não compartilhe arquivos `.env`, senhas, tokens ou credenciais de acesso. Esses arquivos e informações confidenciais não devem ser publicados no repositório.

## Contexto Acadêmico

Projeto desenvolvido como atividade acadêmica do curso de **Análise e Desenvolvimento de Sistemas**, na **Multivix**, com aplicação prática de conhecimentos relacionados ao desenvolvimento web, integração com banco de dados, APIs e autenticação de usuários.

## Autor

**João Pedro Pereira Coutinho**

Curso: Análise e Desenvolvimento de Sistemas  
Instituição: Multivix

---

*PrintTech Manager — Organização, controle e eficiência na gestão de assistência técnica.*
