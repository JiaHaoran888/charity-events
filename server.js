const express = require('express');
const pool = require('./event_db');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/organizations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, contact_email, phone FROM organizations');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events/upcoming', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT e.id,e.name,e.short_description,e.event_date,e.location,e.price,e.image_url,c.name AS category, e.status, e.goal_amount, e.raised_amount FROM events e JOIN categories c ON e.category_id=c.id WHERE e.status='active' AND DATE(e.event_date) >= CURDATE() ORDER BY e.event_date ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events/past', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT e.id,e.name,e.short_description,e.event_date,e.location,e.price,e.image_url,c.name AS category, e.status, e.goal_amount, e.raised_amount FROM events e JOIN categories c ON e.category_id=c.id WHERE e.status='active' AND DATE(e.event_date) < CURDATE() ORDER BY e.event_date DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { category, location, start_date, end_date, q } = req.query;
    let sql = "SELECT e.id,e.name,e.short_description,e.event_date,e.location,e.price,e.image_url,c.name AS category,e.status,e.goal_amount,e.raised_amount FROM events e JOIN categories c ON e.category_id=c.id WHERE e.status='active'";
    const params = [];
    if (category) {
      sql += " AND e.category_id = ?";
      params.push(category);
    }
    if (location) {
      sql += " AND e.location LIKE ?";
      params.push('%' + location + '%');
    }
    if (start_date) {
      sql += " AND DATE(e.event_date) >= ?";
      params.push(start_date);
    }
    if (end_date) {
      sql += " AND DATE(e.event_date) <= ?";
      params.push(end_date);
    }
    if (q) {
      sql += " AND (e.name LIKE ? OR e.short_description LIKE ? OR e.description LIKE ?)";
      const like = '%' + q + '%';
      params.push(like, like, like);
    }
    sql += " ORDER BY e.event_date ASC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      "SELECT e.*, c.name AS category, o.name AS organization, o.contact_email, o.phone FROM events e JOIN categories c ON e.category_id=c.id JOIN organizations o ON e.org_id=o.id WHERE e.id = ?",
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Event not found' });
    const event = rows[0];
    const [images] = await pool.query('SELECT url,caption FROM event_images WHERE event_id = ?', [id]);
    const [tickets] = await pool.query('SELECT type, price, quantity FROM tickets WHERE event_id = ?', [id]);
    event.images = images;
    event.tickets = tickets;
    event.progress = event.goal_amount && event.goal_amount > 0 ? Math.min(100, (event.raised_amount / event.goal_amount) * 100) : 0;
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { date, location, category } = req.query;
    let sql = "SELECT e.id,e.name,e.short_description,e.event_date,e.location,e.price,e.image_url,c.name AS category FROM events e JOIN categories c ON e.category_id=c.id WHERE e.status='active'";
    const params = [];
    if (date) {
      sql += " AND DATE(e.event_date) = ?";
      params.push(date);
    }
    if (location) {
      sql += " AND e.location LIKE ?";
      params.push('%' + location + '%');
    }
    if (category) {
      sql += " AND e.category_id = ?";
      params.push(category);
    }
    sql += " ORDER BY e.event_date ASC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/home', async (req, res) => {
  try {
    const [upcoming] = await pool.query(
      "SELECT e.id,e.name,e.short_description,e.event_date,e.location,e.price,e.image_url,c.name AS category,e.goal_amount,e.raised_amount FROM events e JOIN categories c ON e.category_id=c.id WHERE e.status='active' AND DATE(e.event_date) >= CURDATE() ORDER BY e.event_date ASC LIMIT 8"
    );
    const [popular] = await pool.query(
      "SELECT e.id,e.name,e.short_description,e.event_date,e.location,e.price,e.image_url,c.name AS category,e.goal_amount,e.raised_amount FROM events e JOIN categories c ON e.category_id=c.id WHERE e.status='active' ORDER BY e.raised_amount DESC LIMIT 4"
    );
    res.json({ upcoming, popular });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) return next();
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function openUrl(url) {
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`);
  } else if (process.platform === 'darwin') {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`Server listening at ${url}`);
  try {
    openUrl(url);
  } catch (e) {}
});
