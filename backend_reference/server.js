/**
 * REFERENCE ONLY: This is the backend code requested by the user.
 * It will not run in the browser environment but serves as the implementation guide.
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Email Transporter Config
const transporter = nodemailer.createTransport({
  service: 'gmail', // or SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- ROUTES ---

// Auth (Simplified)
app.post('/api/login', async (req, res) => {
  // In real app: Compare bcrypt hash
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length > 0) {
    res.json({ token: 'fake-jwt-token', user: result.rows[0] });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Get Leads
app.get('/api/leads', async (req, res) => {
  // In real app: get user_id from JWT middleware
  const userId = req.headers['x-user-id']; 
  const result = await pool.query('SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  res.json(result.rows);
});

// Add Lead
app.post('/api/leads', async (req, res) => {
  const { userId, name, email, phone, notes } = req.body;
  const result = await pool.query(
    'INSERT INTO leads (user_id, name, email, phone, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, name, email, phone, notes]
  );
  res.json(result.rows[0]);
});

// Get Dashboard Data
app.get('/api/dashboard', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const today = new Date().toISOString().split('T')[0];
  
  const overdue = await pool.query(
    "SELECT * FROM followups WHERE user_id = $1 AND status = 'pending' AND scheduled_at < NOW()", 
    [userId]
  );
  const todays = await pool.query(
    "SELECT * FROM followups WHERE user_id = $1 AND status = 'pending' AND DATE(scheduled_at) = DATE(NOW())",
    [userId]
  );
  
  res.json({
    overdue: overdue.rows,
    today: todays.rows
  });
});

// --- CRON JOB ---
// Runs every hour to check for upcoming follow-ups in the next hour
cron.schedule('0 * * * *', async () => {
  console.log('Running follow-up reminder job...');
  
  const client = await pool.connect();
  try {
    // Find followups scheduled in the next hour that haven't been notified (logic simplified)
    const result = await client.query(`
      SELECT f.*, u.email as user_email, l.name as lead_name 
      FROM followups f
      JOIN users u ON f.user_id = u.id
      JOIN leads l ON f.lead_id = l.id
      WHERE f.status = 'pending' 
      AND f.scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
    `);

    for (const row of result.rows) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: row.user_email,
        subject: `Reminder: Follow up with ${row.lead_name}`,
        text: `You have a scheduled ${row.type} with ${row.lead_name} at ${row.scheduled_at}. \nNotes: ${row.notes}`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${row.user_email} for lead ${row.lead_name}`);
    }
  } catch (err) {
    console.error('Cron job error', err);
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
