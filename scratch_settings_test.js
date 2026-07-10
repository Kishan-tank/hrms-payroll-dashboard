import mongoose from 'mongoose';
import UserSetting from './server/src/models/UserSetting.js';
import User from './server/src/models/user.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  const users = await User.find({ role: 'hr-manager' }).limit(1);
  if (!users.length) {
    console.log('No HR user');
    process.exit(1);
  }
  const user = users[0];
  console.log('User:', user.email);

  const reqUser = { _id: user._id, id: user._id.toString() };
  const userId = reqUser._id || reqUser.id;

  let settings = await UserSetting.findOne({ userId });
  if (!settings) {
    settings = await UserSetting.create({ userId });
    console.log('Created new settings');
  } else {
    console.log('Found existing settings');
  }
  console.log(settings);

  process.exit(0);
}

run();
