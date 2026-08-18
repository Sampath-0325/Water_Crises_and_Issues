// Import dependencies
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');


const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sampath@2006',
  database: 'reportApp'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// User registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send('All fields are required.');

  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send('Database error');
    if (results.length > 0) return res.status(400).send('Email already exists.');

    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (err) => {
        if (err) return res.status(500).send('Error creating user');
        res.status(200).send('User registered successfully');
      }
    );
  });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Both username and password are required.');

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).send('Database error');
    if (results.length === 0) return res.status(400).send('Invalid username or password.');

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(400).send('Invalid username or password.');

    res.status(200).json({ message: 'Login successful!' });
  });
});

// Handle report submission
const nodemailer = require('nodemailer');

// Email transporter setup (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'malleboinasampath11@gmail.com',     // replace with your official email
    pass: 'vkps rpqw zxdo evnm'            // use an app-specific password, not your main one
  }
});

// Inside app.post('/report', ...)
app.post('/report', upload.single('image'), (req, res) => {
  const { 'issue-type': issueType, description, location } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!issueType || !description || !location) {
    return res.status(400).send('All fields are required.');
  }

  const locationCoords = location.split(',').map(coord => coord.trim());

  if (locationCoords.length !== 2) {
    return res.status(400).send('Invalid location format.');
  }

  const report = {
    issueType,
    description,
    location: {
      latitude: locationCoords[0],
      longitude: locationCoords[1]
    },
    image: image ? `/uploads/${image}` : null,
    submittedAt: new Date()
  };

  const reportsFilePath = path.join(__dirname, 'reports.json');

  fs.readFile(reportsFilePath, (err, data) => {
    let reports = [];
    if (!err) {
      try {
        reports = JSON.parse(data);
      } catch (e) {
        console.error('Invalid JSON:', e);
      }
    }

    reports.push(report);

    fs.writeFile(reportsFilePath, JSON.stringify(reports, null, 2), async (err) => {
      if (err) {
        return res.status(500).send('Failed to save the report.');
      }

      // ✉️ Prepare email
      const mailOptions = {
        from: 'your.official.email@gmail.com',
        to: 'malleboinasampath7@gmail.com', // Replace with your official receiver email
        subject: 'New Water Issue Report Submitted',
        html: `
          <h3>New Report Submitted</h3>
          <p><strong>Issue Type:</strong> ${report.issueType}</p>
          <p><strong>Description:</strong> ${report.description}</p>
          <p><strong>Location:</strong> Latitude: ${report.location.latitude}, Longitude: ${report.location.longitude}</p>
          <p><strong>Submitted At:</strong> ${report.submittedAt}</p>
          ${image ? `<p><strong>Image:</strong> <a href="http://yourdomain.com/uploads/${image}">View Image</a></p>` : ''}
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('📨 Report emailed successfully');
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr.message);
      }

      res.status(200).send('Report submitted successfully.');
    });
  });
});


// Import reports from JSON file to DB
const reportsPath = path.join(__dirname, 'reports.json');
fs.readFile(reportsPath, 'utf8', (err, data) => {
  if (err) return console.error('Error reading reports.json:', err);

  let reports;
  try {
    reports = JSON.parse(data);
  } catch (e) {
    return console.error('Invalid JSON format in reports.json');
  }

  reports.forEach(report => {
    const { issueType, description, location, image, submittedAt } = report;
    try {
      let latitude, longitude;

      if (typeof location === 'string') {
        const [latRaw, lngRaw] = location.split(',');
        latitude = parseFloat(latRaw.replace(/[^\d.-]/g, ''));
        longitude = parseFloat(lngRaw.replace(/[^\d.-]/g, ''));
      } else if (typeof location === 'object') {
        latitude = parseFloat(location.latitude);
        longitude = parseFloat(location.longitude);
      }

      if (isNaN(latitude) || isNaN(longitude)) throw new Error('Invalid coordinates');

      const sql = `INSERT INTO reports (issue_type, description, latitude, longitude, image_path, submitted_at) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [issueType, description, latitude, longitude, image, new Date(submittedAt)];

      db.query(sql, values, (err, result) => {
        if (err) console.error('Failed to insert report:', err.sqlMessage);
        else console.log('Report inserted with ID:', result.insertId);
      });

    } catch (e) {
      console.error('Skipping invalid report:', e.message);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});