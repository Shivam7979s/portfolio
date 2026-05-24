import { Request, Response, NextFunction } from 'express';

type ValidationRule = {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email';
  minLength?: number;
};

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value !== undefined && value !== '') {
        if (rule.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${rule.field} must be a valid email address`);
          }
        }

        if (rule.type === 'number' && isNaN(Number(value))) {
          errors.push(`${rule.field} must be a number`);
        }

        if (rule.minLength && String(value).length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    next();
  };
};
