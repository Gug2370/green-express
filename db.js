import mysql from "mysql2";

// Connection pool lets Express reuse MySQL connections across API requests.
// Set DB_USER and DB_PASSWORD if your local MySQL credentials are different.
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "green_express",
});

// .promise() lets us use async/await: const [rows] = await db.query(...)
export default db.promise();
