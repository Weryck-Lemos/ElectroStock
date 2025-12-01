import { useEffect, useState } from "react";

type Item = { id: number; name: string; stock: number };
type OrderItem = { item_id: number; quantity: number };
type Status = "pending" | "approved" | "rejected" | "finished";
type Order = { id: number; user_email: string; items: OrderItem[]; status: Status };

export default function DashboardAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [tab, setTab] = useState<Status | "reports">("pending");

  useEffect(() => {
    async function load() {
      try {
        const [it, od] = await Promise.all([
          fetch("http://127.0.0.1:8000/items"),
          fetch("http://127.0.0.1:8000/orders"),
        ]);
        setItems(await it.json());
        setOrders(await od.json());
      } catch {
        setError("Erro ao carregar dados.");
      }
    }
    load();
  }, []);

  const getItemName = (id: number) =>
    items.find((i) => i.id === id)?.name ?? `Item #${id}`;

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

  async function updateStatus(id: number, action: "approve" | "reject" | "finish") {
    setError("");
    setSuccess("");
    setLoadingAction(id);

    try {
      const resp = await fetch(`http://127.0.0.1:8000/orders/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.detail ?? "Erro ao atualizar pedido.");
        return;
      }

      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));

      const txt =
        action === "approve" ? "aprovado" :
        action === "reject" ? "recusado" : "finalizado";

      setSuccess(`Pedido #${id} ${txt}.`);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoadingAction(null);
    }
  }

  const filteredOrders =
    tab === "reports" ? [] : orders.filter((o) => o.status === tab);

  const totalPedidos = orders.length;

  const totalItens = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  const totalPorStatus = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<Status, number>
  );

  const usuariosUnicos = new Set(orders.map((o) => o.user_email)).size;

  const pedidosPorItem = (() => {
    const mapa = new Map<number, number>();
    orders.forEach((o) =>
      o.items.forEach((it) =>
        mapa.set(it.item_id, (mapa.get(it.item_id) ?? 0) + it.quantity)
      )
    );
    return Array.from(mapa.entries())
      .map(([item_id, total]) => ({ item_id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  })();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 text-gray-800">
      <aside className="w-full md:w-64 bg-blue-700 text-white flex flex-col p-4 md:p-6 shadow-lg flex-shrink-0">
        <h2 className="text-2xl font-bold mb-4 md:mb-6 border-b border-blue-500 pb-2">
          Admin
        </h2>

        <ul className="space-y-2 md:space-y-3">
          {(["pending", "approved", "rejected", "finished"] as Status[]).map((s) => (
            <li key={s}>
              <button
                onClick={() => setTab(s)}
                className={
                  "w-full text-left px-3 py-2 rounded-lg transition text-sm md:text-base " +
                  (tab === s ? "bg-blue-600" : "hover:bg-blue-600")
                }
              >
                {statusLabel[s]}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => setTab("reports")}
              className={
                "w-full text-left px-3 py-2 rounded-lg transition text-sm md:text-base " +
                (tab === "reports" ? "bg-blue-600" : "hover:bg-blue-600")
              }
            >
              Relatórios
            </button>
          </li>
        </ul>
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white shadow px-4 md:px-8 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold text-blue-700">
            ElectroStock ⚡ – Admin
          </h1>
          <nav className="flex flex-wrap gap-3 sm:gap-6 text-gray-700 font-medium text-sm md:text-base">
            <a href="/" className="hover:text-blue-700 transition">
              Sair
            </a>
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-5">
            {tab === "reports" ? "Relatórios" : statusLabel[tab]}
          </h2>

          {error && <p className="text-red-500 mb-3">{error}</p>}
          {success && tab !== "reports" && (
            <p className="text-green-600 mb-3">{success}</p>
          )}

          {tab === "reports" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow p-4">
                  <p className="text-xs text-gray-500">Total de pedidos</p>
                  <p className="text-2xl font-bold">{totalPedidos}</p>
                </div>
                <div className="bg-white rounded-2xl shadow p-4">
                  <p className="text-xs text-gray-500">Total de itens solicitados</p>
                  <p className="text-2xl font-bold">{totalItens}</p>
                </div>
                <div className="bg-white rounded-2xl shadow p-4">
                  <p className="text-xs text-gray-500">Usuários diferentes</p>
                  <p className="text-2xl font-bold">{usuariosUnicos}</p>
                </div>
                <div className="bg-white rounded-2xl shadow p-4">
                  <p className="text-xs text-gray-500">Pedidos finalizados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalPorStatus.finished ?? 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    Pedidos por status
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Pendentes</span>
                      <span>{totalPorStatus.pending ?? 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Aprovados</span>
                      <span>{totalPorStatus.approved ?? 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Recusados</span>
                      <span>{totalPorStatus.rejected ?? 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Finalizados</span>
                      <span>{totalPorStatus.finished ?? 0}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    Top 5 itens mais pedidos
                  </h3>
                  {pedidosPorItem.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Ainda não há itens em pedidos.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-1 pr-2">Item</th>
                            <th className="py-1 text-right">Qtde total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidosPorItem.map((it) => (
                            <tr key={it.item_id} className="border-b last:border-0">
                              <td className="py-1 pr-2">{getItemName(it.item_id)}</td>
                              <td className="py-1 text-right">{it.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredOrders.length === 0 ? (
                <p className="text-gray-500">Nenhum pedido nesta categoria.</p>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow p-4 md:p-5 flex flex-col"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-500">
                          Pedido #{order.id}
                        </p>
                        <p className="text-sm text-gray-600 break-all">
                          Solicitante: <b>{order.user_email}</b>
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

                    <ul className="mt-3 border-t pt-3 text-sm space-y-1">
                      {order.items.map((i) => (
                        <li
                          key={i.item_id}
                          className="flex justify-between gap-2"
                        >
                          <span className="truncate">
                            {getItemName(i.item_id)}
                          </span>
                          <span className="whitespace-nowrap">
                            Qtde: {i.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, "approve")}
                            disabled={loadingAction === order.id}
                            className="flex-1 min-w-[120px] py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm"
                          >
                            Aprovar
                          </button>

                          <button
                            onClick={() => updateStatus(order.id, "reject")}
                            disabled={loadingAction === order.id}
                            className="flex-1 min-w-[120px] py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm"
                          >
                            Recusar
                          </button>
                        </>
                      )}

                      {order.status === "approved" && (
                        <button
                          onClick={() => updateStatus(order.id, "finish")}
                          disabled={loadingAction === order.id}
                          className="flex-1 min-w-[140px] py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm"
                        >
                          Finalizar
                        </button>
                      )}

                      {(order.status === "rejected" ||
                        order.status === "finished") && (
                        <p className="text-xs text-gray-500">
                          Nenhuma ação disponível.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
