import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage, formatPrice } from "../api.js";

function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // Load the services from the database when the page opens
  useEffect(() => {
    api
      .get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.log(errorMessage(err)));
  }, []);

  function handleTrack(e) {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert("Please enter a tracking number.");
      return;
    }
    navigate("/track/" + trackingNumber.trim());
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">From New York to London to Tokyo.</h1>
          <p className="hero-text">
            Door-to-door courier for parcels and documents. Book online, we pick up from your door, and you can
            follow every step.
          </p>
        </div>
        <div className="track-band">
          <form className="container track-form" onSubmit={handleTrack}>
            <label htmlFor="tracking">Tracking number</label>
            <div className="track-row">
              <input
                id="tracking"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <button className="btn">Track</button>
            </div>
          </form>
        </div>
      </section>

      <section className="container section">
        <h2>Our services</h2>
        <div className="service-grid">
          {services.map((service) => (
            <div className="service" key={service.id}>
              <p className="service-type">{service.type}</p>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p className="service-price">{formatPrice(service.price)}</p>
              <p className="muted">{service.delivery_days}</p>
            </div>
          ))}
        </div>
        <p>
          <Link to="/prices">View service prices</Link>
        </p>
      </section>

      <section className="section section-grey">
        <div className="container">
          <h2>How it works</h2>
          <ol className="steps">
            <li>
              <h3>Book online</h3>
              <p>Create an account, choose a service, and enter the parcel details. You see the fixed price before booking.</p>
            </li>
            <li>
              <h3>We pick it up</h3>
              <p>Our courier collects the parcel from your door. You pay in cash at pickup.</p>
            </li>
            <li>
              <h3>Track it</h3>
              <p>Follow your parcel with the tracking number until it is delivered.</p>
            </li>
          </ol>
          <Link to="/book" className="btn">Book a shipment</Link>
        </div>
      </section>
    </>
  );
}

export default Home;
