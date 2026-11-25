import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api.js";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const navigate = useNavigate();

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const res = await api.post("/register", form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <div className="container page small-page">
      <h1>Create an account</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <label>Full name<input name="name" value={form.name} onChange={handleChange} required /></label>
        <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
        <label>Phone<input name="phone" value={form.phone} onChange={handleChange} /></label>
        <label>Password<input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} required /></label>
        <button className="btn">Register</button>
        <p>Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}

export default Register;
