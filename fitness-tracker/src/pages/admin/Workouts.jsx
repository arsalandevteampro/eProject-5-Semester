import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import { useSettings } from "../../contexts/SettingsContext";
import { convertWeight, convertBackWeight } from "../../utils/units";
import ConfirmModal from "../../components/admin/ConfirmModal";

export default function Workouts() {
  const { settings } = useSettings();
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({
    title: "",
    category: "strength",
    exercises: [{ name: "", sets: "", reps: "", weight: "", duration: "", distance: "", notes: "" }],
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/workouts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(response.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      
      // Convert weights back to metric for storage
      const dataToSave = {
        ...formData,
        exercises: formData.exercises.map(ex => ({
          ...ex,
          weight: convertBackWeight(ex.weight, settings.units.weight)
        }))
      };

      if (editingWorkout) {
        await axios.put(
          `http://localhost:5000/api/workouts/${editingWorkout._id}`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/workouts", dataToSave, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchWorkouts();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:5000/api/workouts/${confirmModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      title: workout.title,
      category: workout.category,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        weight: convertWeight(ex.weight, settings.units.weight) || ""
      })),
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "strength",
      exercises: [{ name: "", sets: "", reps: "", weight: "", duration: "", distance: "", notes: "" }],
    });
    setEditingWorkout(null);
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { name: "", sets: "", reps: "", weight: "", duration: "", distance: "", notes: "" },
      ],
    }));
  };

  const removeExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const updateExercise = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      ),
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={confirmModal.open}
        message="Are you sure you want to delete this workout? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
          Workout Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:scale-105 active:scale-95 duration-200"
        >
          Add New Workout
        </button>
      </div>

      {/* Workout Form */}
      {showForm && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">
            {editingWorkout ? "Edit Workout" : "Create New Workout"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Workout Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              >
                <option value="strength" className="text-black">Strength Training</option>
                <option value="cardio" className="text-black">Cardio</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-white/90 pb-2">Exercises</h4>
              {formData.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-black/40 rounded-2xl shadow-inner relative group"
                >
                  <div className="md:col-span-6 lg:col-span-4">
                    <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Exercise Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bench Press"
                      value={exercise.name}
                      onChange={(e) =>
                        updateExercise(index, "name", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      required
                    />
                  </div>
                  {formData.category === "strength" ? (
                    <>
                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Sets</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(index, "sets", e.target.value)
                          }
                          className="w-full p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Reps</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(index, "reps", e.target.value)
                          }
                          className="w-full p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-2">
                        <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Weight ({settings.units.weight})</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={exercise.weight}
                          onChange={(e) =>
                            updateExercise(index, "weight", e.target.value)
                          }
                          className="w-full p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="md:col-span-2 lg:col-span-2">
                        <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Duration (min)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={exercise.duration}
                          onChange={(e) =>
                            updateExercise(index, "duration", e.target.value)
                          }
                          className="w-full p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-2">
                        <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Distance (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={exercise.distance}
                          onChange={(e) =>
                            updateExercise(index, "distance", e.target.value)
                          }
                          className="w-full p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </>
                  )}
                  <div className="md:col-span-12 lg:col-span-4">
                    <label className="text-xs font-medium text-gray-400 uppercase mb-1 block">Notes</label>
                    <div className="flex gap-2 min-w-0">
                      <input
                        type="text"
                        placeholder="e.g. focus on form"
                        value={exercise.notes}
                        onChange={(e) =>
                          updateExercise(index, "notes", e.target.value)
                        }
                        className="flex-1 min-w-0 p-2.5 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      {formData.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-3.5 py-2.5 rounded-lg transition-all flex items-center justify-center font-bold"
                          title="Remove Exercise"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExercise}
                className="w-full md:w-auto bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-6 py-2.5 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span> Add Exercise
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {editingWorkout ? "Update Workout" : "Create Workout"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workouts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <div
            key={workout._id}
            className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white tracking-wide">
                {workout.title}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  workout.category === "strength"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-green-500/20 text-green-300"
                }`}
              >
                {workout.category}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="text-sm bg-black/20 rounded-xl p-3 flex justify-between">
                  <span className="font-semibold text-white">{exercise.name}</span>
                  <span className="text-gray-300">
                    {workout.category === 'strength' ? (
                      <>
                        {exercise.sets}×{exercise.reps}
                        {exercise.weight && ` @ ${convertWeight(exercise.weight, settings.units.weight)}${settings.units.weight}`}
                      </>
                    ) : (
                      <>
                        {exercise.duration} mins
                        {exercise.distance && ` • ${exercise.distance} km`}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(workout)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(workout._id)}
                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {workouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No workouts found. Create your first workout to get started!
          </p>
        </div>
      )}
    </div>
  );
}
