import { useEffect, useState } from "react";
import api, { errorMessage, formatPrice } from "../api.js";

function Prices() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/services").then((res) => setServices(res.data)).catch((err) => setError(errorMessage(err)));
  }, []);

  const service = services.find((item) => String(item.id) === serviceId);
  const price = service ? Number(service.price) : null;

  return (
    <div className="container page small-page">
      <h1>Service prices</h1>
      <p className="lead">Choose a service to see its fixed price.</p>
      <section className="card form">
        <label>Delivery service
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
            <option value="">Choose a service</option>
            {services.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        {price !== null && <div className="price-result"><span>Fixed price</span><strong>{formatPrice(price)}</strong></div>}
      </section>
    </div>
  );
}

export default Prices;
