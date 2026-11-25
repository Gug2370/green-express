import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage, formatPrice } from "../api.js";

function BookShipment({ user }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    service_id: "",
    weight: "",
    description: "",
    sender_name: user.name,
    sender_phone: user.phone || "",
    from_city: "",
    pickup_address: "",
    receiver_name: "",
    receiver_phone: "",
    to_city: "",
    delivery_address: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/services").then((res) => setServices(res.data));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Show the selected service's fixed price; the backend uses the same database value.
  const service = services.find((s) => s.id === Number(form.service_id));
  const price = service ? Number(service.price) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/shipments", form);
      alert(res.data.message + "\nPrice: " + formatPrice(res.data.price) + " (pay the courier at pickup)");
      navigate("/my-shipments");
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <div className="container page">
      <h1>Book a shipment</h1>
      <form className="book-form" onSubmit={handleSubmit}>
        <fieldset className="card form">
          <legend>Parcel</legend>
          <label>
            Service
            <select name="service_id" value={form.service_id} onChange={handleChange} required>
              <option value="">Choose a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.delivery_days})</option>
              ))}
            </select>
          </label>
          <label>
            Weight (kg)
            <input name="weight" type="number" step="0.1" min="0.1" max="70" value={form.weight} onChange={handleChange} required />
          </label>
          <label>
            What is inside?
            <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. books, clothes, documents" required />
          </label>
          <p className="price-preview">
            Price: <strong>{service ? formatPrice(price) : "choose a service"}</strong>
          </p>
        </fieldset>

        <fieldset className="card form">
          <legend>Sender (pickup)</legend>
          <label>
            Name
            <input name="sender_name" value={form.sender_name} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input name="sender_phone" value={form.sender_phone} onChange={handleChange} required />
          </label>
          <label>
            City
            <input name="from_city" value={form.from_city} onChange={handleChange} placeholder="e.g. New York, USA" required />
          </label>
          <label>
            Pickup address
            <input name="pickup_address" value={form.pickup_address} onChange={handleChange} required />
          </label>
        </fieldset>

        <fieldset className="card form">
          <legend>Receiver (delivery)</legend>
          <label>
            Name
            <input name="receiver_name" value={form.receiver_name} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input name="receiver_phone" value={form.receiver_phone} onChange={handleChange} required />
          </label>
          <label>
            City (and country if abroad)
            <input name="to_city" value={form.to_city} onChange={handleChange} placeholder="e.g. London, UK" required />
          </label>
          <label>
            Delivery address
            <input name="delivery_address" value={form.delivery_address} onChange={handleChange} required />
          </label>
        </fieldset>

        <button className="btn btn-big">Book shipment</button>
      </form>
    </div>
  );
}

export default BookShipment;
