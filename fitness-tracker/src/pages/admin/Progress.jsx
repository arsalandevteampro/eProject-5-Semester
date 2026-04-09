import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { useSettings } from '../../contexts/SettingsContext';
import { convertWeight, convertBackWeight, convertMeasurement, convertBackMeasurement } from '../../utils/units';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Progress() {
  const { settings } = useSettings();
  const [progressData, setProgressData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    muscleMass: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    notes: ''
  });

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:5000/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      // Convert inputs back to metric for storage
      const dataToSave = {
        ...formData,
        weight: convertBackWeight(formData.weight, settings.units.weight),
        muscleMass: convertBackWeight(formData.muscleMass, settings.units.weight),
        chest: convertBackMeasurement(formData.chest, settings.units.measurements),
        waist: convertBackMeasurement(formData.waist, settings.units.measurements),
        hips: convertBackMeasurement(formData.hips, settings.units.measurements),
        biceps: convertBackMeasurement(formData.biceps, settings.units.measurements),
        thighs: convertBackMeasurement(formData.thighs, settings.units.measurements),
      };

      if (editingEntry) {
        await axios.put(`http://localhost:5000/api/progress/${editingEntry._id}`, dataToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/progress', dataToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchProgressData();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving progress entry:', error);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:5000/api/progress/${confirmModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProgressData();
    } catch (error) {
      console.error('Error deleting progress entry:', error);
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      date: new Date(entry.date).toISOString().split('T')[0],
      weight: convertWeight(entry.weight, settings.units.weight) || '',
      bodyFat: entry.bodyFat || '',
      muscleMass: convertWeight(entry.muscleMass, settings.units.weight) || '',
      chest: convertMeasurement(entry.chest, settings.units.measurements) || '',
      waist: convertMeasurement(entry.waist, settings.units.measurements) || '',
      hips: convertMeasurement(entry.hips, settings.units.measurements) || '',
      biceps: convertMeasurement(entry.biceps, settings.units.measurements) || '',
      thighs: convertMeasurement(entry.thighs, settings.units.measurements) || '',
      notes: entry.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      muscleMass: '',
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: '',
      notes: ''
    });
    setEditingEntry(null);
  };

  const prepareChartData = (field, label, color) => {
    const sortedData = [...progressData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const isWeightField = field === 'weight' || field === 'muscleMass';
    const isMeasurementField = ['chest', 'waist', 'hips', 'biceps', 'thighs'].includes(field);
    
    return {
      labels: sortedData.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [{
        label: isWeightField ? `${label} (${settings.units.weight})` : 
               isMeasurementField ? `${label} (${settings.units.measurements})` : label,
        data: sortedData.map(entry => {
          let val = entry[field];
          if (isWeightField) val = convertWeight(val, settings.units.weight);
          if (isMeasurementField) val = convertMeasurement(val, settings.units.measurements);
          return val;
        }).filter(val => val !== '' && val !== null),
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        borderWidth: 3,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white', font: { size: 14, weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 4,
        padding: 8,
      }
    },
    scales: {
      x: {
        ticks: { color: 'white', font: { size: 13, weight: '600' } },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: 'white', font: { size: 13, weight: '600' }, beginAtZero: true },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const getLatestValue = (field) => {
    if (progressData.length === 0) return 'N/A';
    const latest = progressData.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    );
    let val = latest[field];
    if ((field === 'weight' || field === 'muscleMass') && val !== undefined) {
      val = convertWeight(val, settings.units.weight);
    } else if (['chest', 'waist', 'hips', 'biceps', 'thighs'].includes(field) && val !== undefined) {
      val = convertMeasurement(val, settings.units.measurements);
    }
    return val || 'N/A';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={confirmModal.open}
        message="Are you sure you want to delete this progress entry? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
          Progress Tracking
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:scale-105 transform duration-200"
        >
          Log Progress
        </button>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">⚖️</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Current Weight</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">
            {getLatestValue('weight')}{getLatestValue('weight') !== 'N/A' && ` ${settings.units.weight}`}
          </p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🎯</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Body Fat %</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{getLatestValue('bodyFat')}{getLatestValue('bodyFat') !== 'N/A' && '%'}</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">💪</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Muscle Mass</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">
            {getLatestValue('muscleMass')}{getLatestValue('muscleMass') !== 'N/A' && ` ${settings.units.weight}`}
          </p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">📝</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Entries</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{progressData.length}</p>
        </div>
      </div>

      {/* Progress Form */}
      {showForm && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">
            {editingEntry ? 'Edit Progress Entry' : 'Log New Progress'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                step="0.1"
                placeholder={`Weight (${settings.units.weight})`}
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Body Fat %"
                value={formData.bodyFat}
                onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <input
                type="number"
                step="0.1"
                placeholder={`Muscle Mass (${settings.units.weight})`}
                value={formData.muscleMass}
                onChange={(e) => setFormData(prev => ({ ...prev, muscleMass: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="number"
                step="0.1"
                placeholder={`Chest (${settings.units.measurements})`}
                value={formData.chest}
                onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <input
                type="number"
                step="0.1"
                placeholder={`Waist (${settings.units.measurements})`}
                value={formData.waist}
                onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <input
                type="number"
                step="0.1"
                placeholder={`Hips (${settings.units.measurements})`}
                value={formData.hips}
                onChange={(e) => setFormData(prev => ({ ...prev, hips: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <input
                type="number"
                step="0.1"
                placeholder={`Biceps (${settings.units.measurements})`}
                value={formData.biceps}
                onChange={(e) => setFormData(prev => ({ ...prev, biceps: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
              <input
                type="number"
                step="0.1"
                placeholder={`Thighs (${settings.units.measurements})`}
                value={formData.thighs}
                onChange={(e) => setFormData(prev => ({ ...prev, thighs: e.target.value }))}
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {editingEntry ? 'Update Entry' : 'Log Progress'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress Charts */}
      {progressData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Weight Progress</h3>
            <div className="h-64">
              <Line data={prepareChartData('weight', 'Weight', 'rgba(147, 51, 234, 0.9)')} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Body Fat Progress</h3>
            <div className="h-64">
              <Line data={prepareChartData('bodyFat', 'Body Fat %', 'rgba(239, 68, 68, 0.9)')} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {progressData.map((entry) => (
          <div key={entry._id} className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white tracking-wide">
                {new Date(entry.date).toLocaleDateString()}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(entry)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {entry.weight && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Weight</span><br />
                  <span className="text-white font-bold">{convertWeight(entry.weight, settings.units.weight)} {settings.units.weight}</span>
                </div>
              )}
              {entry.bodyFat && <div className="bg-black/20 rounded-xl p-3 text-center"><span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Body Fat</span><br /><span className="text-white font-bold">{entry.bodyFat}%</span></div>}
              {entry.muscleMass && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Muscle</span><br />
                  <span className="text-white font-bold">{convertWeight(entry.muscleMass, settings.units.weight)} {settings.units.weight}</span>
                </div>
              )}
              {entry.chest && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Chest</span><br />
                  <span className="text-white font-bold">{convertMeasurement(entry.chest, settings.units.measurements)} {settings.units.measurements}</span>
                </div>
              )}
              {entry.waist && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Waist</span><br />
                  <span className="text-white font-bold">{convertMeasurement(entry.waist, settings.units.measurements)} {settings.units.measurements}</span>
                </div>
              )}
              {entry.hips && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Hips</span><br />
                  <span className="text-white font-bold">{convertMeasurement(entry.hips, settings.units.measurements)} {settings.units.measurements}</span>
                </div>
              )}
              {entry.biceps && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Biceps</span><br />
                  <span className="text-white font-bold">{convertMeasurement(entry.biceps, settings.units.measurements)} {settings.units.measurements}</span>
                </div>
              )}
              {entry.thighs && (
                <div className="bg-black/20 rounded-xl p-3 text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Thighs</span><br />
                  <span className="text-white font-bold">{convertMeasurement(entry.thighs, settings.units.measurements)} {settings.units.measurements}</span>
                </div>
              )}
            </div>

            {entry.notes && (
              <div className="bg-black/20 rounded-xl p-4 mt-4">
                <p className="text-gray-300 text-sm italic">"{entry.notes}"</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {progressData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No progress entries found. Start logging your progress to track your fitness journey!</p>
        </div>
      )}
    </div>
  );
}
