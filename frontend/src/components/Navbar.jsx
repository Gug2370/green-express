import { NavLink, Link } from "react-router-dom";

function Navbar({ user, logout }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link className="logo" to="/">
          <span className="logo-mark">G</span> Green Express
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/track">Track</NavLink>
          <NavLink to="/prices">Prices</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        {user ? (
          <div className="nav-user">
            {user.role === "admin" ? <NavLink to="/admin">Admin</NavLink> : <NavLink to="/my-shipments">My shipments</NavLink>}
            <span className="nav-name">{user.name}</span>
            <button className="btn btn-small btn-outline" onClick={logout}>Log out</button>
          </div>
        ) : (
          <div className="nav-user">
            <NavLink to="/login">Log in</NavLink>
            <Link to="/register" className="btn btn-small">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
