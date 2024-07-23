import { Request, Response, NextFunction } from 'express';

interface User {
  id: string;
  name: string;
  username: string;
  technologies: Technology[];
}

interface Technology {
  id: string;
  title: string;
  studied: boolean;
  deadline: Date;
  created_at: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const users: User[] = [];

export const checkExistsUserAccount = (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.headers;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username header is required' });
  }

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not exists' });
  }

  req.user = user;
  return next();
};

export const getUsers = () => users;
