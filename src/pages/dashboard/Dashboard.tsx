import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <header className="topbar">
        <h1 className="title">ElectroStock ⚡</h1>
        <nav className="topbar-options">
          <a href="#">Editar Perfil</a>
          <a href="#">Configurações</a>
          <a href="/">Sair</a>
        </nav>
      </header>

      <aside className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li><a href="#">Fazer um Pedido</a></li>
          <li><a href="#">Visualizar Pedidos</a></li>
        </ul>
      </aside>

      <main className="main-content">
        <h2>Bem-vindo ao painel!</h2>
        <p>Gerencie seus pedidos e controle o estoque de forma prática e moderna.</p>
      </main>
    </div>
  );
}