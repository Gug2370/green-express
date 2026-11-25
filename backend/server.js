import express from "express"; // Creates the web server and API routes.
import cors from "cors"; // Lets the frontend call this backend from a different origin.
import bcrypt from "bcryptjs"; // Hashes passwords and checks login passwords against their hashes.
import jwt from "jsonwebtoken"; // Creates and verifies tokens for signed-in users.
import db from "./db.js"; // Provides the MySQL connection used by API routes.

const app = express();
const PORT = 8800;
const JWT_SECRET = process.env.JWT_SECRET || "green_express_secret_change_me";

const STATUSES = ["Booked", "Picked up", "In transit", "Out for delivery", "Delivered", "Cancelled"];

// Keep related database writes together so partial updates can be rolled back.
async function withTransaction(work) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

app.use(cors()); // lets the React app (http://localhost:5173) call this API
app.use(express.json()); // reads JSON sent by the frontend into req.body


// Checks the login token sent by the frontend ("Authorization: Bearer <token>")
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Please log in first." });
  try {
    req.user = jwt.verify(token, JWT_SECRET); // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Your login has expired. Please log in again." });
  }
}

// Only lets administrators through
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Only admins can do this." });
  next();
}

// Example tracking number: GE12345678
function makeTrackingNumber() {
  return "GE" + Math.floor(10000000 + Math.random() * 90000000);
}

app.get("/", (req, res) => {
  res.json("Hello, the Green Express backend is running!");
});


// All services with their prices
app.get("/api/services", async (req, res) => {
  const [services] = await db.query("SELECT * FROM services");
  res.json(services);
});

// Track a parcel. Only cities are shown, never names or phone numbers.
app.get("/api/track/:trackingNumber", async (req, res) => {
  const trackingNumber = req.params.trackingNumber.trim().toUpperCase();
  const [rows] = await db.query(
    `SELECT s.id, s.tracking_number, s.from_city, s.to_city, s.status, s.created_at,
            sv.name AS service_name, sv.delivery_days
       FROM shipments s
       JOIN services sv ON s.service_id = sv.id
      WHERE s.tracking_number = ?`,
    [trackingNumber]
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: "No shipment found with tracking number " + trackingNumber + "." });
  }

  const { id, ...shipment } = rows[0];
  const [history] = await db.query(
    "SELECT status, location, created_at FROM tracking_history WHERE shipment_id = ? ORDER BY created_at DESC, id DESC",
    [id]
  );
  res.json({ ...shipment, history });
});

// Contact form
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Please fill in your name, email and message." });
  }
  await db.query("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
  res.status(201).json({ message: "Thank you! Your message has been sent. We will reply within one working day." });
});


app.post("/api/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "The password must be at least 6 characters." });
  }

  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    return res.status(409).json({ message: "This email is already registered. Please log in." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10); // never store the real password
  await db.query("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)", [
    name,
    email,
    phone,
    hashedPassword,
  ]);
  res.status(201).json({ message: "Account created! You can log in now." });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

  if (rows.length === 0 || !bcrypt.compareSync(password || "", rows[0].password)) {
    return res.status(401).json({ message: "Wrong email or password." });
  }

  const user = rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
});


// The logged-in customer's shipments
app.get("/api/my-shipments", verifyToken, async (req, res) => {
  const [shipments] = await db.query(
    `SELECT s.*, sv.name AS service_name
       FROM shipments s
       JOIN services sv ON s.service_id = sv.id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC`,
    [req.user.id]
  );
  res.json(shipments);
});

// Book a new shipment. The price is always calculated here, on the server.
app.post("/api/shipments", verifyToken, async (req, res) => {
  const s = req.body;
  const required = [
    "service_id", "weight", "description",
    "sender_name", "sender_phone", "from_city", "pickup_address",
    "receiver_name", "receiver_phone", "to_city", "delivery_address",
  ];
  const missing = required.filter((field) => !s[field]);
  if (missing.length > 0) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const weight = Number(s.weight);
  if (!(weight > 0 && weight <= 70)) {
    return res.status(400).json({ message: "The weight must be between 0.1 and 70 kg." });
  }

  const [services] = await db.query("SELECT * FROM services WHERE id = ?", [s.service_id]);
  if (services.length === 0) return res.status(400).json({ message: "Please choose a service." });
  const service = services[0];
  const price = Number(service.price);

  const trackingNumber = makeTrackingNumber();
  await withTransaction(async (connection) => {
    const [result] = await connection.query(
      `INSERT INTO shipments (tracking_number, user_id, service_id, sender_name, sender_phone, from_city, pickup_address,
         receiver_name, receiver_phone, to_city, delivery_address, description, weight, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingNumber, req.user.id, service.id, s.sender_name, s.sender_phone, s.from_city, s.pickup_address,
        s.receiver_name, s.receiver_phone, s.to_city, s.delivery_address, s.description, weight, price,
      ]
    );
    await connection.query("INSERT INTO tracking_history (shipment_id, status, location) VALUES (?, 'Booked', ?)", [
      result.insertId,
      s.from_city,
    ]);
  });

  res.status(201).json({
    message: "Shipment booked! Your tracking number is " + trackingNumber + ".",
    tracking_number: trackingNumber,
    price,
  });
});

// A customer can cancel only before the parcel is picked up
app.put("/api/shipments/:id/cancel", verifyToken, async (req, res) => {
  const result = await withTransaction(async (connection) => {
    // Lock the row so a status update cannot race with a customer cancellation.
    const [rows] = await connection.query("SELECT * FROM shipments WHERE id = ? AND user_id = ? FOR UPDATE", [
      req.params.id,
      req.user.id,
    ]);
    if (rows.length === 0) return { error: 404, message: "Shipment not found." };
    if (rows[0].status !== "Booked") {
      return { error: 400, message: "Only shipments that have not been picked up yet can be cancelled." };
    }
    await connection.query("UPDATE shipments SET status = 'Cancelled' WHERE id = ?", [req.params.id]);
    await connection.query("INSERT INTO tracking_history (shipment_id, status, location) VALUES (?, 'Cancelled', ?)", [
      req.params.id,
      rows[0].from_city,
    ]);
    return { tracking_number: rows[0].tracking_number };
  });
  if (result.error) return res.status(result.error).json({ message: result.message });
  res.json({ message: "Shipment " + result.tracking_number + " has been cancelled." });
});


app.get("/api/admin/shipments", verifyToken, isAdmin, async (req, res) => {
  const [shipments] = await db.query(
    `SELECT s.*, sv.name AS service_name, u.name AS customer_name
       FROM shipments s
       JOIN services sv ON s.service_id = sv.id
       JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC`
  );
  res.json(shipments);
});

// Change the status of a shipment and add it to the tracking history
app.put("/api/admin/shipments/:id/status", verifyToken, isAdmin, async (req, res) => {
  const { status, location } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: "Please choose a valid status." });
  if (!location) return res.status(400).json({ message: "Please enter the location." });

  const updated = await withTransaction(async (connection) => {
    const [result] = await connection.query("UPDATE shipments SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return false;
    await connection.query("INSERT INTO tracking_history (shipment_id, status, location) VALUES (?, ?, ?)", [
      req.params.id,
      status,
      location,
    ]);
    return true;
  });
  if (!updated) return res.status(404).json({ message: "Shipment not found." });
  res.json({ message: "Status updated to \"" + status + "\"." });
});

app.get("/api/admin/messages", verifyToken, isAdmin, async (req, res) => {
  const [messages] = await db.query("SELECT * FROM messages ORDER BY created_at DESC");
  res.json(messages);
});

app.use((err, req, res, next) => {
  if (err.status === 400) return res.status(400).json({ message: "The data sent to the server is not valid." });
  console.log(err);
  res.status(500).json({ message: "Something went wrong on the server. Is MySQL running?" });
});

app.listen(PORT, () => {
  console.log("Backend running on http://localhost:" + PORT);
});
