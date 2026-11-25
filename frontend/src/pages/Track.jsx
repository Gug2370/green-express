import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errorMessage, formatDate } from "../api.js";

const STEPS = ["Booked", "Picked up", "In transit", "Out for delivery", "Delivered"];

function Track() {
  const { number } = useParams();
  const [input, setInput] = useState(number || "");
  const [shipment, setShipment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!number) return;
    let ignore = false; // stops a second alert when React runs this effect twice in development
    setShipment(null);
    api
      .get("/track/" + number)
      .then((res) => !ignore && setShipment(res.data))
      .catch((err) => !ignore && alert(errorMessage(err)));
    return () => {
      ignore = true;
    };
  }, [number]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) {
      alert("Please enter a tracking number.");
      return;
    }
    navigate("/track/" + input.trim());
  }

  const currentStep = shipment ? STEPS.indexOf(shipment.status) : -1;

  return (
    <div className="container page">
      <h1>Track a parcel</h1>
      <form className="track-row track-page-form" onSubmit={handleSubmit}>
        <input placeholder="Enter tracking number" value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn">Track</button>
      </form>

      {shipment && (
        <div className="card">
          <div className="track-head">
            <div>
              <h2 className="tracking-number">{shipment.tracking_number}</h2>
              <p>
                {shipment.from_city} to {shipment.to_city}
              </p>
            </div>
            <span className={"status status-" + shipment.status.replaceAll(" ", "-").toLowerCase()}>
              {shipment.status}
            </span>
          </div>

          <p className="muted">
            {shipment.service_name} ({shipment.delivery_days}). Booked on {formatDate(shipment.created_at)}.
          </p>

          {shipment.status === "Cancelled" ? (
            <p className="cancelled-text">This shipment was cancelled.</p>
          ) : (
            <ol className="progress">
              {STEPS.map((step, i) => (
                <li key={step} className={i <= currentStep ? "done" : ""}>
                  {step}
                </li>
              ))}
            </ol>
          )}

          <h3>Tracking history</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date and time</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {shipment.history.map((item, i) => (
                <tr key={i}>
                  <td>{formatDate(item.created_at)}</td>
                  <td>{item.status}</td>
                  <td>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default Track;
