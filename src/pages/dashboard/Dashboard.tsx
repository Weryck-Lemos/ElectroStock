export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">

      <aside className="w-64 bg-blue-700 text-white flex flex-col p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 border-b border-blue-500 pb-2">
          Menu
        </h2>
        <ul className="space-y-3">
          <li>
            <a
              href="#"
              className="block px-3 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Fazer um Pedido
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block px-3 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Visualizar Pedidos
            </a>
          </li>
        </ul>
      </aside>

      <div className="flex flex-col flex-1">

        <header className="flex justify-between items-center bg-white shadow px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-700">ElectroStock ⚡</h1>

          <nav className="flex space-x-6 text-gray-700 font-medium">
            <a href="#" className="hover:text-blue-700 transition">Editar Perfil</a>
            <a href="#" className="hover:text-blue-700 transition">Configurações</a>
            <a href="/" className="hover:text-blue-700 transition">Sair</a>
          </nav>
        </header>

        <main className="flex-1 p-10">
          <h2 className="text-3xl font-semibold mb-4">Bem-vindo ao painel!</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Gerencie seus pedidos e controle o estoque de forma prática e moderna.
          </p>
        </main>
      </div>
    </div>
  );
}
