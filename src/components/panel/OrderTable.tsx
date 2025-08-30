import { useEffect, useState } from "react";
import axios from "axios";
import "./OrderTable.css";

interface Order {
  id: string;
  client: string;
  descripcion: string;
  plan: string;
  status: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
}
interface OrderTableProps {
  orders: Order[] | null;
}
export default function OrderTable({ orders = [] }: OrderTableProps) {
  const [ordersData, setOrdersData] = useState<Order[]>([...orders]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  // Calcular rango de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = ordersData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="orders-section">
      <div className="section-header">
        <h3>Nuevos Pedidos</h3>
        <button className="btn-secondary">Ver Todos</button>
      </div>

      <div className="table-container">
        {loading && <p>Cargando...</p>}
        {error && !loading && <p style={{ color: "tomato" }}>{error}</p>}

        {!loading && !error && (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Fecha Creación</th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td className="client-name">{order.client}</td>
                      <td>{order.descripcion}</td>
                      <td className="plan">{order.plan}</td>
                      <td>
                        <span
                          className={`status-badge ${String(order.status || "")
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {order.status === "pendiente pago"
                            ? "Pendiente"
                            : order.status === "pagado"
                            ? "Pagado"
                            : "En progreso"}
                        </span>
                      </td>
                      <td className="date">
                        {order.fecha_creacion.slice(0, 10)}
                      </td>
                      <td className="date">{order.ultima_actualizacion}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="action-btn view"
                            title="Ver detalles"
                          >
                            👁
                          </button>
                          <button className="action-btn edit" title="Editar">
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
                      No hay pedidos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ⬅ Anterior
                </button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Siguiente ➡
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
