import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateBonus } from '../middleware/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all bonuses
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM bonuses 
      ORDER BY date DESC
    `;
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
});

// Create new bonus
router.post('/', validateBonus, async (req, res) => {
  try {
    const { date, repName, bonusAmount, notes } = req.body;

    const query = `
      INSERT INTO bonuses (date, rep_name, bonus_amount, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const values = [date, repName, bonusAmount, notes || ''];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating bonus:', error);
    res.status(500).json({ error: 'Failed to create bonus' });
  }
});

// Update bonus
router.put('/:id', validateBonus, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, repName, bonusAmount, notes } = req.body;

    const query = `
      UPDATE bonuses SET
        date = $1, rep_name = $2, bonus_amount = $3, notes = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;

    const values = [date, repName, bonusAmount, notes || '', id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating bonus:', error);
    res.status(500).json({ error: 'Failed to update bonus' });
  }
});

// Delete bonus
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM bonuses WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    res.json({ message: 'Bonus deleted successfully' });

  } catch (error) {
    console.error('Error deleting bonus:', error);
    res.status(500).json({ error: 'Failed to delete bonus' });
  }
});

export default router;