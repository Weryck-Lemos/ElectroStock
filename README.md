# ⚡ ElectroStock

Sistema web desenvolvido como parte da disciplina **Desenvolvimento de Software para a Web** — Universidade Federal do Ceará (UFC), semestre **2025.2**.

O **ElectroStock** é uma aplicação full stack para simular o gerenciamento de itens de um almoxarifado e o fluxo de pedidos (usuário solicita, administrador aprova/recusa/finaliza).

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

