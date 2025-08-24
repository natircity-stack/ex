import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateBonus } from '../middleware/validation';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bonuses WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', validateBonus, async (req, res) => {
  try {
    const { date, amount, description } = req.body;
    
    const result = await pool.query(
      `INSERT INTO bonuses (user_id, date, amount, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, date, amount, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bonus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', validateBonus, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, description } = req.body;
    
    const result = await pool.query(
      `UPDATE bonuses 
       SET date = $1, amount = $2, description = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [date, amount, description, id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bonus not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bonus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM bonuses WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bonus not found' });
    }
    
    res.json({ message: 'Bonus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bonus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;