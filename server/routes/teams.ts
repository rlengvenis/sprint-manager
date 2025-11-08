import express, { Request, Response } from 'express';
import Team from '../models/Team.js';

const router = express.Router();

// GET /api/teams - get the team (returns first team or creates if none exists)
router.get('/', async (req: Request, res: Response) => {
  try {
    let team = await Team.findOne();
    if (!team) {
      return res.status(404).json({ error: 'No team found. Please create a team first.' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/teams/:id - get team by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/teams - create or replace team
router.post('/', async (req: Request, res: Response) => {
  try {
    // Delete existing team if any (single team only)
    await Team.deleteMany({});
    
    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// PUT /api/teams - update the team (there's only one)
router.put('/', async (req: Request, res: Response) => {
  try {
    let team = await Team.findOne();
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    Object.assign(team, req.body);
    await team.save();
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;

