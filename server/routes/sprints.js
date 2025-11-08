import express from 'express';
import Sprint from '../models/Sprint.js';

const router = express.Router();

// GET /api/sprints/current - get current sprint (latest without actualVelocity)
// NOTE: Must be before /:id route to avoid matching "current" as an ID
router.get('/current', async (req, res) => {
  try {
    const sprint = await Sprint.findOne({
      actualVelocity: null
    }).sort({ createdAt: -1 });

    if (!sprint) {
      return res.status(404).json({ error: 'No current sprint found' });
    }

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sprints/history - get completed sprints
// NOTE: Must be before /:id route to avoid matching "history" as an ID
router.get('/history', async (req, res) => {
  try {
    const sprints = await Sprint.find({
      actualVelocity: { $ne: null }
    }).sort({ completedAt: -1 });

    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sprints - list all sprints
router.get('/', async (req, res) => {
  try {
    const sprints = await Sprint.find().sort({ createdAt: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sprints/:id - get sprint by id
router.get('/:id', async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sprints - create sprint
router.post('/', async (req, res) => {
  try {
    const sprint = new Sprint(req.body);
    await sprint.save();
    res.status(201).json(sprint);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/sprints/:id/complete - mark sprint as complete with actual velocity
router.patch('/:id/complete', async (req, res) => {
  try {
    const { actualVelocity } = req.body;
    
    if (actualVelocity === undefined) {
      return res.status(400).json({ error: 'actualVelocity is required' });
    }

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    sprint.actualVelocity = actualVelocity;
    sprint.completedAt = new Date();
    await sprint.save();

    res.json(sprint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

