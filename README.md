# Water Crisis Reporting Platform

A full-stack web application for reporting and tracking water-related issues such as scarcity, pollution, leakage, and infrastructure damage. Users can submit geo-tagged reports with image evidence, which are stored in a MySQL database and forwarded via email to designated authorities.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [How to Run](#how-to-run)
- [How to Use](#how-to-use)
- [Who Is This For](#who-is-this-for)
- [License](#license)

---

## Features

- User registration and login with password hashing (bcrypt)
- Report submission form with issue type, description, image upload, and map-based location selection
- Interactive map integration using Leaflet.js and OpenStreetMap for pinpointing issue locations
- Geolocation support to auto-detect user location
- Image upload and storage via Multer
- Report data persisted to both a local JSON file and a MySQL database
- Email notifications sent to administrators on each new report via Nodemailer
- Awareness content including educational videos, conservation facts, and pollution reduction guidance
- Responsive design across all pages

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | HTML, CSS, JavaScript               |
| Backend   | Node.js, Express.js                 |
| Database  | MySQL                               |
| Maps      | Leaflet.js, OpenStreetMap            |
| Email     | Nodemailer (Gmail SMTP)             |
| Uploads   | Multer                              |
| Auth      | bcrypt                              |

---

## Project Structure

```
Water_Crises/
├── index.html           # Landing page with awareness content and navigation
├── registration.html    # User registration form
├── login.html           # User login form
├── MainPage.html        # Main dashboard with educational content and report access
├── report.html          # Issue report form with map-based location picker
├── index.js             # Express.js server (API routes, database, email)
├── package.json         # Node.js dependencies and scripts
├── reports.json         # Local JSON store for submitted reports
├── uploads/             # Directory for uploaded report images
└── node_modules/        # Installed dependencies
```

---

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- A Gmail account with an App Password for email notifications

---

## Database Setup

1. Open your MySQL client and create the database:

```sql
CREATE DATABASE reportApp;
USE reportApp;
```

2. Create the required tables:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_type VARCHAR(255),
    description TEXT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    image_path VARCHAR(255),
    submitted_at DATETIME
);
```

---

## Configuration

Open `index.js` and update the following values before running the application:

**MySQL credentials** (line 22-27):
```js
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'reportApp'
});
```

**Email configuration** (line 89-95):
```js
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com',
        pass: 'YOUR_APP_PASSWORD'
    }
});
```

Update the `from` and `to` fields in the `mailOptions` object (line 144-145) with your sender and receiver email addresses.

---

## How to Run

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Water_Crises.git
cd Water_Crises
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node index.js
```

4. Open `index.html` in your browser or navigate to `http://localhost:3000` if serving static files through Express.

The server runs on port 3000 by default. Set the `PORT` environment variable to change it.

---

## How to Use

1. Open `index.html` in a browser to access the landing page.
2. Click "Register Now" to create an account with a username, email, and password.
3. Log in with your credentials. On successful login, you are redirected to the main dashboard.
4. From the main dashboard, click "Report an Issue" to open the report form.
5. Select the issue type, provide a description, click the location field to open the map, and select the affected area by clicking on the map or using geolocation.
6. Upload a supporting image and submit the report.
7. The report is saved to the database and a notification email is sent to the configured administrator address.

---

## Who Is This For

- Municipal and local government bodies responsible for water infrastructure
- Environmental organizations monitoring water quality and availability
- Community leaders and residents reporting water problems in their area
- NGOs working on water conservation and sanitation
- Students and developers building awareness or civic technology projects

---

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

##  Author

**Sampath Malleboina**

---

<div align="center">
<sub>Built with using HTML, CSS, JavaScript, Node.Js, MAPS</sub>
</div>
