import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userEmail: string;
        email: string;
        role: string;
        name: string;
        [key: string]: any;
      };
      requestId?: string;
    }
  }
}

// Ensure this file is treated as a module
export {};
