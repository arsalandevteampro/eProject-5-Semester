require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Progress = require('./models/Progress');
const Nutrition = require('./models/Nutrition');
const Workout = require('./models/Workout');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-tracker')
  .then(async () => {
    console.log('MongoDB connected');
    
    // Create User
    let user = await User.findOne({ email: 'arsalan@gmail.com' });
    if (!user) {
      // Create it if it wasn't there
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123', salt);
      user = new User({
        name: 'Arsalan',
        email: 'arsalan@gmail.com',
        password: hashedPassword
      });
      await user.save();
      console.log('User arsalan@gmail.com created!');
    } else {
      // Just to be sure, update password to '123'
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('123', salt);
      await user.save();
      console.log('User already exists, password updated to 123!');
    }

    // Clear old data for a fresh dashboard
    await Progress.deleteMany({ user: user._id });
    await Nutrition.deleteMany({ user: user._id });
    await Workout.deleteMany({ user: user._id });

    // Seed Progress
    await Progress.create([
      { user: user._id, date: new Date(Date.now() - 5 * 24*60*60*1000), weight: 80, chest: 100, waist: 85, hips: 95, biceps: 35 },
      { user: user._id, date: new Date(Date.now() - 3 * 24*60*60*1000), weight: 79, chest: 101, waist: 84, hips: 95, biceps: 35 },
      { user: user._id, date: new Date(), weight: 78, chest: 102, waist: 83, hips: 94, biceps: 36 },
    ]);
    
    // Seed Workouts
    await Workout.create([
      { user: user._id, title: 'Upper Body Workout', category: 'strength', exercises: [ { name: 'Bench Press', sets: 4, reps: 8, weight: 60 }, { name: 'Pull Ups', sets: 3, reps: 10 } ] },
      { user: user._id, title: 'Morning Cardio', category: 'cardio', exercises: [ { name: 'Running', sets: 1, reps: 1, weight: 0, notes: '5km run' } ] }
    ]);

    // Seed Nutrition
    await Nutrition.create([
      { user: user._id, date: new Date(), mealType: 'breakfast', items: [ { name: 'Oatmeal', quantity: '1 bowl', calories: 300, protein: 10, carbs: 50, fat: 5 }, { name: 'Eggs', quantity: '3', calories: 210, protein: 18, carbs: 0, fat: 15 } ] },
      { user: user._id, date: new Date(), mealType: 'lunch', items: [ { name: 'Chicken Breast', quantity: '200g', calories: 330, protein: 62, carbs: 0, fat: 7 } ] }
    ]);

    console.log('Data seeded successfully! You can now login with arsalan@gmail.com / 123');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
