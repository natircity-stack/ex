import express from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateWeeklyData } from '../middleware/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all weekly data
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM weekly_data 
      ORDER BY start_date DESC
    `;
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    res.status(500).json({ error: 'Failed to fetch weekly data' });
  }
});

// Create new weekly data
router.post('/', validateWeeklyData, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      totalUsers,
      siteActivities,
      wentToBranch,
      duplicates,
      totalOrders,
      ordersShipped,
      shippedOrdersAmount
    } = req.body;

    const query = `
      INSERT INTO weekly_data (
        start_date, end_date, total_users, site_activities, went_to_branch,
        duplicates, total_orders, orders_shipped, shipped_orders_amount, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      startDate, endDate, totalUsers, siteActivities, wentToBranch,
      duplicates, totalOrders, ordersShipped, shippedOrdersAmount
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating weekly data:', error);
    res.status(500).json({ error: 'Failed to create weekly data' });
  }
});

// Update weekly data
router.put('/:id', validateWeeklyData, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      startDate,
      endDate,
      totalUsers,
      siteActivities,
      wentToBranch,
      duplicates,
      totalOrders,
      ordersShipped,
      shippedOrdersAmount
    } = req.body;

    const query = `
      UPDATE weekly_data SET
        start_date = $1, end_date = $2, total_users = $3, site_activities = $4,
        went_to_branch = $5, duplicates = $6, total_orders = $7, orders_shipped = $8,
        shipped_orders_amount = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      startDate, endDate, totalUsers, siteActivities, wentToBranch,
      duplicates, totalOrders, ordersShipped, shippedOrdersAmount, id
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly data not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating weekly data:', error);
    res.status(500).json({ error: 'Failed to update weekly data' });
  }
});

// Delete weekly data
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM weekly_data WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly data not found' });
    }

    res.json({ message: 'Weekly data deleted successfully' });

  } catch (error) {
    console.error('Error deleting weekly data:', error);
    res.status(500).json({ error: 'Failed to delete weekly data' });
  }
});

export default router;