// controllers/exportController.js
const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const format = req.query.format || 'pdf';
    
    // Fetch all user data
    const [user, workouts, nutrition, progress] = await Promise.all([
      User.findById(userId).select('-password'),
      Workout.find({ user: userId }).sort({ createdAt: -1 }),
      Nutrition.find({ user: userId }).sort({ date: -1 }),
      Progress.find({ user: userId }).sort({ date: -1 })
    ]);

    if (format === 'csv') {
      return exportCSV(res, { user, workouts, nutrition, progress });
    } else {
      return exportPDF(res, { user, workouts, nutrition, progress });
    }
  } catch (err) {
    res.status(500).json({ message: "Error exporting data", error: err.message });
  }
};

const exportPDF = (res, data) => {
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=fitness-data.pdf');
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Add content to PDF
  doc.fontSize(24).text('Fitness Tracker Report', { align: 'center' });
  doc.moveDown();
  
  // User Information
  doc.fontSize(18).text('User Information');
  doc.fontSize(12).text(`Name: ${data.user.name}`);
  doc.fontSize(12).text(`Email: ${data.user.email}`);
  doc.fontSize(12).text(`Member Since: ${new Date(data.user.createdAt).toLocaleDateString()}`);
  doc.moveDown();
  
  // Workouts Summary
  doc.fontSize(18).text('Workouts Summary');
  doc.fontSize(12).text(`Total Workouts: ${data.workouts.length}`);
  if (data.workouts.length > 0) {
    data.workouts.slice(0, 5).forEach((workout, index) => {
      doc.fontSize(10).text(`${index + 1}. ${workout.title} (${workout.category}) - ${new Date(workout.createdAt).toLocaleDateString()}`);
    });
  }
  doc.moveDown();
  
  // Nutrition Summary
  doc.fontSize(18).text('Nutrition Summary');
  doc.fontSize(12).text(`Total Nutrition Logs: ${data.nutrition.length}`);
  if (data.nutrition.length > 0) {
    const totalCalories = data.nutrition.reduce((sum, log) => {
      return sum + log.items.reduce((itemSum, item) => itemSum + (Number(item.calories) || 0), 0);
    }, 0);
    doc.fontSize(12).text(`Total Calories Logged: ${totalCalories}`);
  }
  doc.moveDown();
  
  // Progress Summary
  doc.fontSize(18).text('Progress Summary');
  doc.fontSize(12).text(`Total Progress Entries: ${data.progress.length}`);
  if (data.progress.length > 0) {
    const latestProgress = data.progress[0];
    if (latestProgress.weight) doc.fontSize(12).text(`Latest Weight: ${latestProgress.weight} kg`);
    if (latestProgress.bodyFat) doc.fontSize(12).text(`Latest Body Fat: ${latestProgress.bodyFat}%`);
  }
  
  // Finalize PDF
  doc.end();
};

const exportCSV = (res, data) => {
  try {
    // Prepare data for CSV export
    const exportData = {
      user: [{
        name: data.user.name,
        email: data.user.email,
        memberSince: new Date(data.user.createdAt).toLocaleDateString()
      }],
      workouts: data.workouts.map(w => ({
        title: w.title,
        category: w.category,
        exercises: w.exercises.length,
        date: new Date(w.createdAt).toLocaleDateString()
      })),
      nutrition: data.nutrition.map(n => ({
        date: new Date(n.date).toLocaleDateString(),
        mealType: n.mealType,
        totalCalories: n.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
      })),
      progress: data.progress.map(p => ({
        date: new Date(p.date).toLocaleDateString(),
        weight: p.weight || '',
        bodyFat: p.bodyFat || '',
        muscleMass: p.muscleMass || ''
      }))
    };

    // Create CSV for each data type
    const userParser = new Parser({ fields: ['name', 'email', 'memberSince'] });
    const workoutParser = new Parser({ fields: ['title', 'category', 'exercises', 'date'] });
    const nutritionParser = new Parser({ fields: ['date', 'mealType', 'totalCalories'] });
    const progressParser = new Parser({ fields: ['date', 'weight', 'bodyFat', 'muscleMass'] });

    const csvData = {
      user: userParser.parse(exportData.user),
      workouts: workoutParser.parse(exportData.workouts),
      nutrition: nutritionParser.parse(exportData.nutrition),
      progress: progressParser.parse(exportData.progress)
    };

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fitness-data.csv');
    
    // Send CSV data
    res.send(`User Information\n${csvData.user}\n\nWorkouts\n${csvData.workouts}\n\nNutrition\n${csvData.nutrition}\n\nProgress\n${csvData.progress}`);
  } catch (err) {
    res.status(500).json({ message: "Error creating CSV", error: err.message });
  }
};

module.exports = { exportUserData };
