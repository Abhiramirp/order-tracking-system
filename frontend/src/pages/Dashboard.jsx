// src/pages/Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { getOrderStatuses} from "../api/orders.api";
import OrderTable from "../components/OrderTable";
import { connectOrderSocket } from "../api/websocket";
import { useAuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
    const { user } = useAuthContext();
  const navigate = useNavigate();
  const toast = useRef(null);
const [selectedStatus, setSelectedStatus] = useState("ACTIVE");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({
    order_id: "",
    product_name: "",
    customer_name: "",
    customer_contact: "",
    customer_address: "",
  
  });

const loadOrders = async (override = {}) => {
  try {
    const params = {
      ...(selectedStatus && { status: selectedStatus }),
      ...override
    };

    const res = await api.get("/orders", { params });
    setOrders(res.data.orders || []);
  } catch (err) {
    console.error("Failed to load orders", err);
    setOrders([]);
  }
};

  useEffect(() => {
  const init = async () => {
    try {
      const res = await getOrderStatuses();

      const enumStatuses = res.data.statuses.map((s) => ({
        label: s.replace("_", " ").toUpperCase(),
        value: s
      }));

      setStatuses([
        { label: "ACTIVE ORDERS", value: "ACTIVE" },
        ...enumStatuses
      ]);

      setSelectedStatus("ACTIVE");

      
      loadOrders({ status: "ACTIVE" });
    } catch (err) {
      console.error("Dashboard init failed", err);
    }
  };

  init();
}, [user.role]);



  useEffect(() => {
    const ws = connectOrderSocket(localStorage.getItem("token"), (msg) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === msg.order_id
            ? { ...o, current_status: msg.current_status, updated_at: msg.timestamp }
            : o
        ).concat(
          prev.some((o) => o.order_id === msg.order_id) ? [] : [msg] // add new if not exists
        )
      );
    });
    return () => ws.close();
  }, []);

  const handleCreateOrder = async () => {
    try {
      await api.post("/orders", form);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Order created successfully",
        life: 3000,
      });
      setDialogVisible(false);
      setForm({
        order_id: "",
        product_name: "",
        customer_name: "",
        customer_contact: "",
        customer_address: "",
        merchant_name : user.username,
      });
      // No need to reload; WebSocket will push the new order
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to create order";
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 4000,
      });
    }
  };

  const dialogFooter = (
    <>
      <Button label="Cancel" icon="pi pi-times" onClick={() => setDialogVisible(false)} className="p-button-text" />
      <Button label="Create" icon="pi pi-check" onClick={handleCreateOrder} />
    </>
  );

  return (
    <>
      <Toast ref={toast} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Orders</h2>
        <span>{user.username} ({user.role})</span>
      </div>

      <OrderTable
  orders={orders}
  statuses={statuses}
  isOps={user.role === "operations_team"}
  selectedStatus={selectedStatus}
  onStatusChange={(status) => {
    setSelectedStatus(status);
    loadOrders({ status });
  }}
/>


      {user.role === "merchant" && (
        <Button
          icon="pi pi-plus"
          className="p-button-rounded p-button-success"
          aria-label="Create Order"
          onClick={() => setDialogVisible(true)}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            width: "60px",
            height: "60px",
            zIndex: 1000,
          }}
        />
      )}

      <Dialog
        header="Create New Order"
        visible={dialogVisible}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "641px": "100vw" }}
        footer={dialogFooter}
        onHide={() => setDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="order_id">Order ID *</label>
            <InputText
              id="order_id"
              value={form.order_id}
              onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              required
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="product_name">Product Name *</label>
            <InputText
              id="product_name"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              required
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="customer_name">Customer Name *</label>
            <InputText
              id="customer_name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              required
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="customer_contact">Customer Contact *</label>
            <InputText
              id="customer_contact"
              value={form.customer_contact}
              onChange={(e) => setForm({ ...form, customer_contact: e.target.value })}
              required
            />
          </div>
          <div className="p-field" style={{ marginBottom: "1rem" }}>
            <label htmlFor="customer_address">Customer Address *</label>
            <InputText
              id="customer_address"
              value={form.customer_address}
              onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
              required
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}