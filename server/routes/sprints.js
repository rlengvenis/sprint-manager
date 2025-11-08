import express from 'express';
import * as sprintService from '../services/sprintService.js';

const router = express.Router();

// GET /api/sprints/current - get current sprint
// NOTE: Must be before /:id route to avoid matching "current" as an ID
router.get('/current', async (req, res) => {
  try {
    const sprint = await sprintService.getCurrentSprint();
    res.json(sprint);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/sprints/history - get completed sprints with member details
// NOTE: Must be before /:id route to avoid matching "history" as an ID
router.get('/history', async (req, res) => {
  try {
    const sprints = await sprintService.getSprintHistory();
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sprints - list all sprints
router.get('/', async (req, res) => {
  try {
    const sprints = await sprintService.getAllSprints();
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sprints/:id - get sprint by id
router.get('/:id', async (req, res) => {
  try {
    const sprint = await sprintService.getSprintById(req.params.id);
    res.json(sprint);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// POST /api/sprints - create sprint
router.post('/', async (req, res) => {
  try {
    const sprint = await sprintService.createSprint(req.body);
    res.status(201).json(sprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/sprints/:id/complete - mark sprint as complete with actual velocity
router.patch('/:id/complete', async (req, res) => {
  try {
    const sprint = await sprintService.completeSprint(req.params.id, req.body.actualVelocity);
    res.json(sprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

