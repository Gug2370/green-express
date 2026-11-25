import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage, formatDate, formatPrice } from "../api.js";

const STATUSES = ["Booked", "Picked up", "In transit", "Out for delivery", "Delivered", "Cancelled"];

// One row of the shipments table, with its own status form
function ShipmentRow({ shipment, onUpdated }) {
  const [status, setStatus] = useState(shipment.status);
  const [location, setLocation] = useState("");

  async function updateStatus() {
    if (!location.trim()) {
      alert("Please enter the location, for example: New York Sorting Hub, USA.");
      return;
    }
    try {
      const res = await api.put("/admin/shipments/" + shipment.id + "/status", { status, location });
      alert(shipment.tracking_number + ": " + res.data.message);
      setLocation("");
      onUpdated();
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <tr>
      <td><Link to={"/track/" + shipment.tracking_number}>{shipment.tracking_number}</Link></td>
      <td>{shipment.customer_name}</td>
      <td>{shipment.from_city} to {shipment.to_city}</td>
      <td>{shipment.service_name}</td>
      <td>{formatPrice(shipment.price)}</td>
      <td>
        <span className={"status status-" + shipment.status.replaceAll(" ", "-").toLowerCase()}>{shipment.status}</span>
      </td>
      <td>
        <div className="update-form">
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="New status">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location" />
          <button className="btn btn-small" onClick={updateStatus}>Update</button>
        </div>
      </td>
    </tr>
  );
}

function Admin() {
  const [shipments, setShipments] = useState([]);
  const [messages, setMessages] = useState([]);

  function loadData() {
    api.get("/admin/shipments").then((res) => setShipments(res.data)).catch((err) => alert(errorMessage(err)));
    api.get("/admin/messages").then((res) => setMessages(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container page">
      <h1>Admin panel</h1>

      <div className="stats">
        <div><strong>{shipments.length}</strong> shipments</div>
        <div><strong>{shipments.filter((s) => s.status === "Delivered").length}</strong> delivered</div>
        <div><strong>{messages.length}</strong> messages</div>
      </div>

      <h2>All shipments</h2>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Tracking number</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Service</th>
              <th>Price</th>
              <th>Status</th>
              <th>Change status</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <ShipmentRow key={s.id + s.status} shipment={s} onUpdated={loadData} />
            ))}
          </tbody>
        </table>
      </div>

      <h2>Messages from the contact form</h2>
      {messages.map((m) => (
        <div className="card message" key={m.id}>
          <p>
            <strong>{m.name}</strong> ({m.email}) <span className="muted">{formatDate(m.created_at)}</span>
          </p>
          <p>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;
