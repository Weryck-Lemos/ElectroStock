# ElectroStock API

Backend da aplicação **ElectroStock**, um sistema de **controle de estoque** e **gestão de pedidos** para componentes eletrônicos. A API oferece cadastro e autenticação de usuários com JWT, gerenciamento de categorias e itens do estoque e um fluxo de aprovação de pedidos com controle de acesso por perfil.

O projeto foi desenvolvido com foco em boas práticas de estruturação de backend com FastAPI, validações com Pydantic, persistência em SQLite e documentação automática via OpenAPI.

---

## Funcionalidades

### Autenticação e autorização
- Registro de usuário
- Login com geração de token JWT
- Rotas protegidas via Bearer token
- Controle de acesso por perfil `user` e `admin`

### Estoque
- CRUD de categorias
- CRUD de itens com vínculo a categoria
- Controle de quantidade em estoque

### Pedidos
- Criação de pedidos com itens e quantidades
- Listagem de pedidos do usuário
- Listagem geral de pedidos (admin)
- Fluxo de status `pending` `approved` `rejected` `finished`
- Itens do pedido armazenados em tabela associativa

---

## Stack e ferramentas utilizadas

- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- SQLite
- JWT JSON Web Token
- python-multipart para login via form-data no padrão OAuth2

---

## Estrutura do projeto

Organização modular por responsabilidade.

- `main.py` ponto de entrada do backend
- `app/main.py` instancia o FastAPI e registra os routers
- `app/routers/` rotas por domínio `auth` `users` `items` `categories` `orders` `order-items`
- `app/models/` modelos SQLAlchemy e tabelas
- `app/schemas/` schemas Pydantic de request e response
- `app/services/` regras de negócio
- `app/database.py` conexão e sessão do banco
- `app/core/` configurações e segurança

---

## 📋 Visão Geral

### Funcionalidades principais
- **Autenticação com JWT** (registro e login)
- **Usuário**
  - Visualiza itens disponíveis
  - Monta carrinho e **cria pedidos**
  - Acompanha status dos próprios pedidos
  - Edita perfil (email e/ou senha)
- **Administrador (admin)**
  - Visualiza pedidos por status (pendente/aprovado/recusado/finalizado)
  - Aprova, recusa e finaliza pedidos
  - Acesso a relatórios resumidos no painel admin

---

## 🧱 Modelo de Dados (ER)

Entidades principais (mínimo de 5 entidades relacionadas):
- **User**: usuários cadastrados (role `user` ou `admin`)
- **Category**: categorias de itens
- **Item**: itens do almoxarifado, vinculados a uma categoria
- **Order**: pedido criado por um usuário, com status
- **OrderItem**: itens dentro do pedido (associação entre Order e Item)

Diagrama ER (Mermaid):

```mermaid
erDiagram
  USERS {
    int id PK
    string name
    string email "unique"
    string password_hash
    string role "user|admin"
  }

  CATEGORIES {
    int id PK
    string name
  }

  ITEMS {
    int id PK
    string name
    string description
    int stock
    int category_id FK
  }

  ORDERS {
    int id PK
    int user_id FK
    string status
  }

  ORDER_ITEMS {
    int id PK
    int order_id FK
    int item_id FK
    int quantity
  }

  USERS ||--o{ ORDERS : "faz"
  CATEGORIES ||--o{ ITEMS : "contém"
  ORDERS ||--o{ ORDER_ITEMS : "inclui"
  ITEMS ||--o{ ORDER_ITEMS : "é solicitado em"

