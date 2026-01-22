import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

type Item = {
  id: number;
  name: string;
  description?: string | null;
  stock: number;
};

type CartItem = {
  item: Item;
  quantity: number;
};

type OrderItem = {
  item_id: number;
  quantity: number;
};

type Status = "pending" | "approved" | "rejected" | "finished";

type Order = {
  id: number;
  status: Status;
  items: OrderItem[];
  user_id: number;
};

type Section = "order" | "myOrders" | "profile" | "settings";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type ApiError = { detail?: string };

function getToken() {
  return localStorage.getItem("token") || "";
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingOrdersList, setLoadingOrdersList] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [section, setSection] = useState<Section>("order");

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const statusLabel: Record<Status, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Recusado",
    finished: "Finalizado",
  };

  const statusClass: Record<Status, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    finished: "bg-green-100 text-green-800",
  };

  const getItemName = (id: number) =>
    items.find((i) => i.id === id)?.name ?? `Item #${id}`;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  useEffect(() => {
    const cfg = localStorage.getItem("settings");
    if (cfg) {
      try {
        const s = JSON.parse(cfg) as { notifyEmail: boolean; darkMode: boolean };
        setNotifyEmail(s.notifyEmail);
        setDarkMode(s.darkMode);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify({ notifyEmail, darkMode }));
  }, [notifyEmail, darkMode]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadMe() {
      try {
        const resp = await fetch(`${API_URL}/users/me`, {
          headers: { ...authHeaders() },
        });

        const data = (await resp.json().catch(() => ({}))) as User | ApiError;
        if (!resp.ok) {
          logout();
          return;
        }

        const u = data as User;
        setCurrentUser(u);
        setNewEmail(u.email);
        localStorage.setItem("user", JSON.stringify(u));
      } catch {
        setError("Erro ao carregar usuário. Faça login novamente.");
      }
    }

    loadMe();
  }, [navigate]);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoadingItems(true);
        setError("");

        const resp = await fetch(`${API_URL}/items`, {
          headers: { ...authHeaders() },
        });

        const data = (await resp.json().catch(() => [])) as Item[] | ApiError;

        if (!resp.ok) {
          setError((data as ApiError).detail ?? "Não foi possível carregar os itens do almoxarifado.");
          return;
        }

        setItems(data as Item[]);
      } catch {
        setError("Não foi possível carregar os itens do almoxarifado.");
      } finally {
        setLoadingItems(false);
      }
    }
    fetchItems();
  }, []);

  async function fetchOrders() {
    if (!currentUser) return;

    try {
      setLoadingOrdersList(true);
      setError("");

      const resp = await fetch(`${API_URL}/orders/me`, {
        headers: { ...authHeaders() },
      });

      const data = (await resp.json().catch(() => [])) as Order[] | ApiError;

      if (!resp.ok) {
        setError((data as ApiError).detail ?? "Não foi possível carregar seus pedidos.");
        return;
      }

      setOrders(data as Order[]);

    } catch {
      setError("Não foi possível carregar seus pedidos.");
    } finally {
      setLoadingOrdersList(false);
    }
  }

  useEffect(() => {
    if (section === "myOrders") fetchOrders();
  }, [section, currentUser]);

  function addToCart(item: Item) {
    setError("");
    setSuccess("");
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function updateQuantity(itemId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) => prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci)));
  }

  function removeFromCart(itemId: number) {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }

  async function sendOrder() {
    setError("");
    setSuccess("");

    if (!currentUser) {
      setError("Usuário não identificado. Faça login novamente.");
      return;
    }

    if (cart.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    try {
      setLoadingOrder(true);

      const body = {
        items: cart.map((ci) => ({
          item_id: ci.item.id,
          quantity: ci.quantity,
        })),
      };

      const resp = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      const data = (await resp.json().catch(() => ({}))) as ApiError;

      if (!resp.ok) {
        setError(data.detail ?? "Erro ao enviar pedido.");
        return;
      }

      setSuccess("Pedido enviado com sucesso! Aguarde aprovação do administrador.");
      setCart([]);
    } catch {
      setError("Erro de conexão ao enviar o pedido.");
    } finally {
      setLoadingOrder(false);
    }
  }

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileMsg("");

    if (!currentUser) {
      setProfileError("Usuário não identificado.");
      return;
    }

    const emailChanged = newEmail && newEmail !== currentUser.email;
    const passChanged = !!newPassword;

    if (!emailChanged && !passChanged) {
      setProfileError("Informe novo email e/ou nova senha.");
      return;
    }

    try {
      const body: any = {};
      if (emailChanged) body.email = newEmail;
      if (passChanged) body.password = newPassword;

      const resp = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });

      const data = (await resp.json().catch(() => ({}))) as User | ApiError;

      if (!resp.ok) {
        setProfileError((data as ApiError).detail ?? "Erro ao atualizar perfil.");
        return;
      }

      const updatedUser = data as User;
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setProfileMsg("Perfil atualizado com sucesso.");
      setNewPassword("");
    } catch {
      setProfileError("Erro de conexão ao atualizar perfil.");
    }
  }

  function renderOrderSection() {
    return (
      <main className="flex-1 p-4 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <section className="lg:col-span-2 bg-white rounded-2xl shadow p-4 md:p-6 flex flex-col">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Itens do almoxarifado</h2>

          {loadingItems && <p className="text-gray-500 mb-2">Carregando itens...</p>}

          {!loadingItems && items.length === 0 && (
            <p className="text-gray-500">Nenhum item cadastrado no almoxarifado.</p>
          )}

          {!loadingItems && items.length > 0 && (
            <div className="overflow-x-auto">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="py-2 pr-2">Nome</th>
                      <th className="py-2 pr-2">Descrição</th>
                      <th className="py-2 text-center">Estoque</th>
                      <th className="py-2 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 pr-2 font-medium break-words">{item.name}</td>
                        <td className="py-2 pr-2 text-gray-600">{item.description || "-"}</td>
                        <td className="py-2 text-center">{item.stock}</td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
                          >
                            Adicionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-4 md:p-6 flex flex-col">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Carrinho</h2>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

          {cart.length === 0 ? (
            <p className="text-gray-500">Nenhum item no carrinho. Adicione itens na lista ao lado.</p>
          ) : (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-64 md:max-h-[45vh]">
              {cart.map((ci) => (
                <div key={ci.item.id} className="flex items-center justify-between gap-3 border rounded-xl px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ci.item.name}</p>
                    <p className="text-xs text-gray-500">Estoque: {ci.item.stock}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={ci.quantity}
                      onChange={(e) => updateQuantity(ci.item.id, Number(e.target.value))}
                      className="w-16 border rounded-lg px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(ci.item.id)}
                      className="text-red-500 text-xs hover:underline whitespace-nowrap"
                    >
                      remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={sendOrder}
            disabled={cart.length === 0 || loadingOrder}
            className="mt-4 w-full py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loadingOrder ? "Enviando pedido..." : "Enviar pedido"}
          </button>
        </section>
      </main>
    );
  }

  function renderMyOrdersSection() {
    return (
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Meus pedidos</h2>
          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto px-3 py-1 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Atualizar
          </button>
        </div>

        {loadingOrdersList && <p className="text-gray-500">Carregando pedidos...</p>}

        {!loadingOrdersList && orders.length === 0 && (
          <p className="text-gray-500">Você ainda não realizou pedidos.</p>
        )}

        {!loadingOrdersList && orders.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-4 md:p-5 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-600 break-all">
                      Solicitante: <b>{order.user_email ?? order.user?.email ?? "—"}</b>
                    </p>
                  </div>
                  <span
                    className={
                      "px-3 py-1 text-xs rounded-full font-semibold self-start sm:self-center " +
                      statusClass[order.status]
                    }
                  >
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div className="border-t pt-2 mt-2">
                  <p className="text-sm font-semibold mb-1">Itens:</p>
                  <ul className="text-sm space-y-1">
                    {order.items.map((it) => (
                      <li key={it.item_id} className="flex justify-between gap-2">
                        <span className="truncate">{getItemName(it.item_id)}</span>
                        <span className="whitespace-nowrap">Qtde: {it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  function renderProfileSection() {
    return (
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-xl">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Editar perfil</h2>
        {currentUser && (
          <p className="text-sm text-gray-600 mb-3 break-all">
            Logado como: <b>{currentUser.name}</b> ({currentUser.email})
          </p>
        )}

        <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
          {profileError && <p className="text-sm text-red-500">{profileError}</p>}
          {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Novo email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Deixe vazio para não alterar"
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Salvar alterações
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-gray-800">
      <aside className="w-full md:w-64 bg-blue-700 text-white flex flex-col p-4 md:p-6 shadow-lg flex-shrink-0">
        <h2 className="text-2xl font-bold mb-4 md:mb-6 border-b border-blue-500 pb-2">
          Menu
        </h2>
        <ul className="space-y-2 md:space-y-3">
          <li>
            <button
              className={
                "w-full text-left px-3 py-2 rounded-lg transition text-sm md:text-base " +
                (section === "order" ? "bg-blue-600" : "hover:bg-blue-600")
              }
              onClick={() => setSection("order")}
            >
              Fazer um Pedido
            </button>
          </li>
          <li>
            <button
              className={
                "w-full text-left px-3 py-2 rounded-lg transition text-sm md:text-base " +
                (section === "myOrders" ? "bg-blue-600" : "hover:bg-blue-600")
              }
              onClick={() => setSection("myOrders")}
            >
              Visualizar Pedidos
            </button>
          </li>
        </ul>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white shadow px-4 md:px-8 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold text-blue-700">
            ElectroStock ⚡
          </h1>

          <nav className="flex flex-wrap gap-3 sm:gap-6 text-gray-700 font-medium text-sm md:text-base">
            <button
              onClick={() => setSection("profile")}
              className="hover:text-blue-700 transition"
            >
              Editar Perfil
            </button>
            <button onClick={logout} className="hover:text-blue-700 transition">
              Sair
            </button>
          </nav>
        </header>

        {section === "order" && renderOrderSection()}
        {section === "myOrders" && renderMyOrdersSection()}
        {section === "profile" && renderProfileSection()}
      </div>
    </div>
  );
}
