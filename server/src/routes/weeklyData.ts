import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateWeeklyData } from '../middleware/validation';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM weekly_data WHERE user_id = $1 ORDER BY week DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', validateWeeklyData, async (req, res) => {
  try {
    const { week, calls, appointments, sales, revenue } = req.body;
    
    const result = await pool.query(
      `INSERT INTO weekly_data (user_id, week, calls, appointments, sales, revenue)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.userId, week, calls, appointments, sales, revenue]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weekly data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', validateWeeklyData, async (req, res) => {
  try {
    const { id } = req.params;
    const { week, calls, appointments, sales, revenue } = req.body;
    
    const result = await pool.query(
      `UPDATE weekly_data 
       SET week = $1, calls = $2, appointments = $3, sales = $4, revenue = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [week, calls, appointments, sales, revenue, id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly data not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating weekly data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM weekly_data WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly data not found' });
    }
    
    res.json({ message: 'Weekly data deleted successfully' });
  } catch (error) {
    console.error('Error deleting weekly data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;