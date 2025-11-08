import express, { Request, Response } from 'express';
import * as teamService from '../services/teamService.js';

const router = express.Router();

// GET /api/teams - get the team
router.get('/', async (req: Request, res: Response) => {
  try {
    const team = await teamService.getTeam();
    res.json(team);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// GET /api/teams/:id - get team by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json(team);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// POST /api/teams - create or replace team
router.post('/', async (req: Request, res: Response) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// PUT /api/teams - update the team
router.put('/', async (req: Request, res: Response) => {
  try {
    const team = await teamService.updateTeam(req.body);
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;

