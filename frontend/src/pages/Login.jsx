import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api.js";

function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      alert("Welcome, " + res.data.user.name + "!");
      navigate(res.data.user.role === "admin" ? "/admin" : "/my-shipments");
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <div className="container page small-page">
      <h1>Log in</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <button className="btn">Log in</button>
        <p>
          No account yet? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
