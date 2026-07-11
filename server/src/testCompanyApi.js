import mongoose from 'mongoose';
import Event from './models/Event.js';
import Skill from './models/Skill.js';
import Goal from './models/Goal.js';
import Task from './models/Task.js';
import PerformanceReview from './models/PerformanceReview.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dhameliyakishan96:dhameliyakishan@hrms-cluster.dia8ndg.mongodb.net/hrms-pro?retryWrites=true&w=majority&appName=hrms-cluster';

async function checkCollections() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const events = await Event.countDocuments();
    console.log(`Events: ${events}`);

    const skills = await Skill.countDocuments();
    console.log(`Skills: ${skills}`);

    const goals = await Goal.countDocuments();
    console.log(`Goals: ${goals}`);

    const tasks = await Task.countDocuments();
    console.log(`Tasks: ${tasks}`);

    const reviews = await PerformanceReview.countDocuments();
    console.log(`Reviews: ${reviews}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCollections();
