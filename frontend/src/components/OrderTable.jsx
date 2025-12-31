// src/components/OrderTable.jsx
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { FilterMatchMode } from "primereact/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";

export default function OrderTable({ orders = [], statuses = [], merchants = [], isOps = false,selectedStatus,
  onStatusChange, }) {
  const navigate = useNavigate();
  const safeOrders = Array.isArray(orders) ? orders : [];

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    merchant_name: { value: null, matchMode: FilterMatchMode.EQUALS },
    customer_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    customer_contact: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    current_status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const getSeverity = (status) => {
    switch (status) {
      case "created":
        return "info";
      case "picked_up":
        return "warning";
      case "in_transit":
        return "warning";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return null;
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.current_status} severity={getSeverity(rowData.current_status)} />;
  };

  const statusRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Select One"
        className="p-column-filter"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );
  };

  const merchantRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={merchants}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select One"
        className="p-column-filter"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );
  };

  const header = renderHeader();

  return (
    <div className="card">
      <DataTable
        value={safeOrders}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        filters={filters}
        filterDisplay="row"
        globalFilterFields={["order_id", "merchant_name", "customer_name", "customer_contact", "current_status"]}
        header={header}
        emptyMessage="No orders found"
        scrollable={false}
      >
        <Column field="order_id" header="Order ID" sortable filter filterPlaceholder="Search by order ID" />
        <Column
          field="merchant_name"
          header="Merchant"
          sortable
          filter={isOps}
          filterElement={merchantRowFilterTemplate}
        />
        <Column field="customer_name" header="Customer" sortable filter filterPlaceholder="Search by customer" />
        <Column field="customer_contact" header="Contact" sortable filter filterPlaceholder="Search by contact" />
        <Column
          field="current_status"
          header="Status"
          sortable
          body={statusBodyTemplate}
          
        />
        <Column
          field="created_at"
          header="Created"
          sortable
          body={(row) => new Date(row.created_at).toLocaleDateString()}
          filter
          filterPlaceholder="Search by created"
        />
        <Column
          field="updated_at"
          header="Updated"
          sortable
          body={(row) => new Date(row.updated_at).toLocaleString()}
          filter
          filterPlaceholder="Search by updated"
        />
        <Column
          header="Action"
          body={(row) => (
            <Button
              label="View"
              className="p-button-sm p-button-info"
              onClick={() => navigate(`/orders/${row.order_id}`)}
            />
          )}
        />
      </DataTable>
    </div>
  );
}