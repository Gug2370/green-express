import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Track from "./pages/Track.jsx";
import Prices from "./pages/Prices.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyShipments from "./pages/MyShipments.jsx";
import BookShipment from "./pages/BookShipment.jsx";
import Admin from "./pages/Admin.jsx";

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Navbar user={user} logout={logout} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/:number" element={<Track />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-shipments" element={user ? <MyShipments /> : <Navigate to="/login" />} />
          <Route path="/book" element={user ? <BookShipment user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === "admin" ? <Admin /> : <Navigate to="/login" />} />
          <Route path="*" element={<div className="container page"><h1>Page not found</h1></div>} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
