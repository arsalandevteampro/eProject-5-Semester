// controllers/workoutController.js
const Workout = require("../models/Workout");
const Notification = require("../models/Notification");

const addWorkout = async (req, res) => {
  const { title, category, exercises } = req.body;

  try {
    const newWorkout = new Workout({
      user: req.user._id,
      title,
      category,
      exercises,
    });

    await newWorkout.save();
    
    // Create a notification if user has workoutReminders enabled
    if (req.user.settings?.notifications?.workoutReminders !== false) {
      await Notification.create({
        user: req.user._id,
        message: `Workout "${title}" logged successfully!`,
      });
    }
    res.status(201).json(newWorkout);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add workout", error: err.message });
  }
};

const getUserWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(workouts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching workouts", error: err.message });
  }
};

const updateWorkout = async (req, res) => {
  const workoutId = req.params.id;

  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: workoutId, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!workout) return res.status(404).json({ message: "Workout not found" });

    res.json(workout);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update workout", error: err.message });
  }
};

const deleteWorkout = async (req, res) => {
  const workoutId = req.params.id;

  try {
    const deleted = await Workout.findOneAndDelete({
      _id: workoutId,
      user: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: "Workout not found" });

    res.json({ message: "Workout deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete workout", error: err.message });
  }
};

const searchWorkouts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const query = {
      user: req.user._id,
    };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } }, // keyword match
        { notes: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category; // e.g., "cardio" or "strength"
    }

    const workouts = await Workout.find(query).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = {
  addWorkout,
  getUserWorkouts,
  updateWorkout,
  deleteWorkout,
  searchWorkouts,
};
