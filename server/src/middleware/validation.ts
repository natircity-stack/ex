import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateWeeklyData = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    week: Joi.string().required(),
    calls: Joi.number().integer().min(0).required(),
    appointments: Joi.number().integer().min(0).required(),
    sales: Joi.number().integer().min(0).required(),
    revenue: Joi.number().min(0).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateBonus = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    date: Joi.string().isoDate().required(),
    amount: Joi.number().min(0).required(),
    description: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};