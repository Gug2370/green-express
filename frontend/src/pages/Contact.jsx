import { useState } from "react";
import api, { errorMessage } from "../api.js";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/contact", form);
      alert(res.data.message);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <div className="container page">
      <h1>Contact us</h1>
      <div className="two-columns">
        <form className="card form" onSubmit={handleSubmit}>
          <label>
            Your name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Message
            <textarea name="message" rows="5" value={form.message} onChange={handleChange} required />
          </label>
          <button className="btn">Send message</button>
        </form>

        <div>
          <h2>Locations</h2>
          <p>New York, USA · London, UK · Tokyo, Japan</p>
          <p>Phone: +8210010010010</p>
          <p>Email: greenexpress@example.com</p>
          <p>Open Sunday to Friday, 9:00 to 18:00</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
