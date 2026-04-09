const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

const addProgress = async (req, res) => {
  try {
    const newProgress = new Progress({
      user: req.user._id,
      ...req.body
    });

    await newProgress.save();
    
    // Create a notification if user has progressUpdates enabled
    if (req.user.settings?.notifications?.progressUpdates !== false) {
      await Notification.create({
        user: req.user._id,
        message: `Progress entry for ${new Date(req.body.date).toLocaleDateString()} logged successfully!`,
      });
    }
    res.status(201).json(newProgress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log progress', error: err.message });
  }
};

const getProgressLogs = async (req, res) => {
  try {
    const logs = await Progress.find({ user: req.user._id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const updated = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Progress entry not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update progress', error: err.message });
  }
};

const deleteProgress = async (req, res) => {
  try {
    const deleted = await Progress.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Progress entry not found' });
    res.json({ message: 'Progress entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

module.exports = {
  addProgress,
  getProgressLogs,
  updateProgress,
  deleteProgress
};
