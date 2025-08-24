import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const validateWeeklyData = [
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO date'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO date'),
  body('totalUsers').isInt({ min: 0 }).withMessage('Total users must be a non-negative integer'),
  body('siteActivities').isInt({ min: 0 }).withMessage('Site activities must be a non-negative integer'),
  body('wentToBranch').isInt({ min: 0 }).withMessage('Went to branch must be a non-negative integer'),
  body('duplicates').isInt({ min: 0 }).withMessage('Duplicates must be a non-negative integer'),
  body('totalOrders').isInt({ min: 0 }).withMessage('Total orders must be a non-negative integer'),
  body('ordersShipped').isInt({ min: 0 }).withMessage('Orders shipped must be a non-negative integer'),
  body('shippedOrdersAmount').isFloat({ min: 0 }).withMessage('Shipped orders amount must be a non-negative number'),
  handleValidationErrors
];

export const validateBonus = [
  body('date').isISO8601().withMessage('Date must be a valid ISO date'),
  body('repName').trim().isLength({ min: 1, max: 100 }).withMessage('Rep name must be 1-100 characters'),
  body('bonusAmount').isFloat({ min: 0 }).withMessage('Bonus amount must be a non-negative number'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];