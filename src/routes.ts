import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { checkExistsUserAccount, getUsers } from './middlewares';

interface Technology {
  id: string;
  title: string;
  studied: boolean;
  deadline: Date;
  created_at: Date;
}

interface User {
  id: string;
  name: string;
  username: string;
  technologies: Technology[];
}

const router = Router();

router.post('/users', (req: Request, res: Response) => {
  const { name, username } = req.body;
  const users = getUsers();

  if (!name || !username) {
    return res.status(400).json({ error: 'Name and username are required' });
  }

  const existingUser = users.find(user => user.username === username);

  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    username,
    technologies: [],
  };

  users.push(newUser);
  return res.status(201).json(newUser);
});

router.get('/technologies', checkExistsUserAccount, (req: Request, res: Response) => {
  const user = req.user!;
  return res.json(user.technologies);
});

router.post('/technologies', checkExistsUserAccount, (req: Request, res: Response) => {
  const user = req.user!;
  const { title, deadline } = req.body;

  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title and deadline are required' });
  }

  const newTechnology: Technology = {
    id: uuidv4(),
    title,
    studied: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.technologies.push(newTechnology);
  return res.status(201).json(newTechnology);
});

router.put('/technologies/:id', checkExistsUserAccount, (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { title, deadline } = req.body;

  const technology = user.technologies.find(tech => tech.id === id);

  if (!technology) {
    return res.status(404).json({ error: 'Technology not found' });
  }

  technology.title = title || technology.title;
  technology.deadline = deadline ? new Date(deadline) : technology.deadline;

  return res.json(technology);
});

router.patch('/technologies/:id/studied', checkExistsUserAccount, (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const technology = user.technologies.find(tech => tech.id === id);

  if (!technology) {
    return res.status(404).json({ error: 'Technology not found' });
  }

  technology.studied = true;
  return res.json(technology);
});

router.delete('/technologies/:id', checkExistsUserAccount, (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const techIndex = user.technologies.findIndex(tech => tech.id === id);

  if (techIndex === -1) {
    return res.status(404).json({ error: 'Technology not found' });
  }

  user.technologies.splice(techIndex, 1);
  return res.status(200).json(user.technologies);
});

export default router;
