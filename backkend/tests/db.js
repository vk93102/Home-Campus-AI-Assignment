// The path option tells dotenv to look one directory up for the .env file
require("dotenv").config({ path: "../.env" });
const { Pool } = require("pg");

console.log("Attempting to connect to the database...");
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`User: ${process.env.DB_USER}`);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log("✅✅✅ Successfully connected to the PostgreSQL database!");
    const res = await client.query("SELECT NOW()");
    console.log("Current time from DB:", res.rows[0].now);
  } catch (err) {
    console.error("❌❌❌ Database connection failed!");
    console.error(err.stack);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

testConnection();
