import { useEffect, useState } from "react";
import api, { errorMessage, formatDate, formatPrice } from "../api.js";

function MyShipments() {
  const [shipments, setShipments] = useState([]);

  async function loadShipments() {
    try {
      const res = await api.get("/my-shipments");
      setShipments(res.data);
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  useEffect(() => { loadShipments(); }, []);

  async function cancelShipment(id) {
    try {
      const res = await api.put(`/shipments/${id}/cancel`);
      alert(res.data.message);
      loadShipments();
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <div className="container page">
      <h1>My shipments</h1>
      {shipments.length === 0 ? <p className="muted">You have not booked a shipment yet.</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Tracking</th><th>Route</th><th>Service</th><th>Status</th><th>Price</th><th>Booked</th><th /></tr></thead>
          <tbody>{shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td><strong>{shipment.tracking_number}</strong></td>
              <td>{shipment.from_city} → {shipment.to_city}</td>
              <td>{shipment.service_name}</td>
              <td><span className="status">{shipment.status}</span></td>
              <td>{formatPrice(shipment.price)}</td>
              <td>{formatDate(shipment.created_at)}</td>
              <td>{shipment.status === "Booked" && <button className="btn btn-small btn-outline" onClick={() => cancelShipment(shipment.id)}>Cancel</button>}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

export default MyShipments;
