# Green Express

A courier service website built with React, Express, Node.js, and MySQL.

## Features

- Browse Domestic and International services with fixed prices.
- Track shipments and view their status history.
- Register and log in as a customer to book and manage shipments.
- Use the admin page to update parcel status and review contact messages.

## Project structure

```text
green express/
├── backend/
│   ├── database.sql   # MySQL database, tables, relationships, and initial records
│   ├── db.js           # MySQL connection
│   └── server.js       # Express API and database operations
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        ├── components/ # Navigation and footer
        └── pages/      # Home, tracking, booking, customer, and admin screens
```

## Database setup

Run `backend/database.sql` in MySQL Workbench or phpMyAdmin for a fresh setup. It creates the `green_express` database, its tables, foreign key relationships, validation constraints, indexes, two delivery services with fixed prices, and one admin account. Customer, shipment, tracking, and message records are added through the app. This script drops and recreates that database, so do not run it over data you need to keep.

The main entities are users, services, shipments, shipment tracking history, and contact messages. Each service has one fixed price; the selected service price is saved on a new shipment. Primary and foreign keys connect related records. Shipment and tracking updates in the API use database transactions so the current parcel status stays consistent with its history.

## Start the backend

Configure the MySQL connection in `backend/db.js` or set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables.

```bash
cd backend
npm install
npm run dev
```

The API (Application Programming Interface) runs at `http://localhost:8800`.

## Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Database API examples

The API uses parameterized SQL queries for database reads and writes. Examples are the service lookup (`GET /api/services`), new shipment booking (`POST /api/shipments`), and shipment status update (`PUT /api/admin/shipments/:id/status`). See `backend/server.js` for the routes and comments explaining their database operations.
