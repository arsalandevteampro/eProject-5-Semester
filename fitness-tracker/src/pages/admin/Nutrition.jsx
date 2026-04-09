import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import ConfirmModal from "../../components/admin/ConfirmModal";

export default function Nutrition() {
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    mealType: "breakfast",
    items: [
      { name: "", quantity: "", calories: "", protein: "", carbs: "", fat: "" },
    ],
  });

  useEffect(() => {
    fetchNutritionLogs();
  }, []);

  const fetchNutritionLogs = async () => {
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/nutrition", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNutritionLogs(response.data);
    } catch (error) {
      console.error("Error fetching nutrition logs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (editingLog) {
        await axios.put(
          `http://localhost:5000/api/nutrition/${editingLog._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("http://localhost:5000/api/nutrition", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchNutritionLogs();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving nutrition log:", error);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      const token = getToken();
      await axios.delete(`http://localhost:5000/api/nutrition/${confirmModal.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNutritionLogs();
    } catch (error) {
      console.error("Error deleting nutrition log:", error);
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      date: new Date(log.date).toISOString().split("T")[0],
      mealType: log.mealType,
      items: log.items,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      mealType: "breakfast",
      items: [
        {
          name: "",
          quantity: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        },
      ],
    });
    setEditingLog(null);
  };

  const addFoodItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          quantity: "",
          calories: "",
          protein: "",
          carbs: "",
          fat: "",
        },
      ],
    }));
  };

  const removeFoodItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateFoodItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotals = (items) => {
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + (Number(item.calories) || 0),
        protein: totals.protein + (Number(item.protein) || 0),
        carbs: totals.carbs + (Number(item.carbs) || 0),
        fat: totals.fat + (Number(item.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getTodayTotals = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = nutritionLogs.filter(log => new Date(log.date).toISOString().split("T")[0] === today);
    return todayLogs.reduce(
      (acc, log) => {
        const logTotals = calculateTotals(log.items);
        return {
          calories: acc.calories + logTotals.calories,
          protein: acc.protein + logTotals.protein,
          carbs: acc.carbs + logTotals.carbs,
          fat: acc.fat + logTotals.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const todayTotals = getTodayTotals();

  const getMealTypeColor = (mealType) => {
    const colors = {
      breakfast: "bg-orange-500",
      lunch: "bg-green-500",
      dinner: "bg-blue-500",
      snack: "bg-purple-500",
    };
    return colors[mealType] || "bg-gray-500";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={confirmModal.open}
        message="Are you sure you want to delete this nutrition log? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
          Nutrition Tracking
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:scale-105 transform duration-200"
        >
          Log Meal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🔥</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Today's Calories</h3>
          <p className="text-4xl font-extrabold text-gray-900">{todayTotals.calories}</p>
          <p className="text-xs font-semibold text-green-800">kcal total</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🥩</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Protein</h3>
          <p className="text-4xl font-extrabold text-gray-900">{todayTotals.protein}g</p>
          <p className="text-xs font-semibold text-blue-800">daily intake</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🍞</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Carbs</h3>
          <p className="text-4xl font-extrabold text-gray-900">{todayTotals.carbs}g</p>
          <p className="text-xs font-semibold text-yellow-800">daily energy</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🥑</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Fats</h3>
          <p className="text-4xl font-extrabold text-gray-900">{todayTotals.fat}g</p>
          <p className="text-xs font-semibold text-purple-800">daily healthy fats</p>
        </div>
      </div>

      {/* Nutrition Form */}
      {showForm && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">
            {editingLog ? "Edit Meal Log" : "Log New Meal"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="p-3 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
              />
              <select
                value={formData.mealType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mealType: e.target.value }))
                }
                className="p-3 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
              >
                <option value="breakfast" className="text-black">Breakfast</option>
                <option value="lunch" className="text-black">Lunch</option>
                <option value="dinner" className="text-black">Dinner</option>
                <option value="snack" className="text-black">Snack</option>
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">Food Items</h4>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-black/20 rounded-xl shadow-md"
                >
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Food Name"
                      value={item.name}
                      onChange={(e) =>
                        updateFoodItem(index, "name", e.target.value)
                      }
                      className="p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none col-span-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        updateFoodItem(index, "quantity", e.target.value)
                      }
                      className="p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Calories"
                      value={item.calories}
                      onChange={(e) =>
                        updateFoodItem(index, "calories", e.target.value)
                      }
                      className="p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={item.protein}
                      onChange={(e) =>
                        updateFoodItem(index, "protein", e.target.value)
                      }
                      className="p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={item.carbs}
                      onChange={(e) =>
                        updateFoodItem(index, "carbs", e.target.value)
                      }
                      className="p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={item.fat}
                      onChange={(e) =>
                        updateFoodItem(index, "fat", e.target.value)
                      }
                      className="p-3 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="bg-red-500/80 hover:bg-red-600 text-white w-10 h-10 flex items-center justify-center rounded-lg shadow transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
              type="button"
              onClick={addFoodItem}
              className="mt-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-6 py-2.5 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
            >
                + Add Food Item
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {editingLog ? "Update Meal" : "Log Meal"}
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

      {/* Nutrition Logs List */}
      <div className="space-y-6">
        {nutritionLogs.map((log) => {
          const totals = calculateTotals(log.items);
          return (
            <div
              key={log._id}
              className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {new Date(log.date).toLocaleDateString()}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      log.mealType === 'breakfast'
                        ? 'bg-orange-500/20 text-orange-300'
                        : log.mealType === 'lunch'
                        ? 'bg-green-500/20 text-green-300'
                        : log.mealType === 'dinner'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {log.mealType.charAt(0).toUpperCase() +
                      log.mealType.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-white mb-1">
                    {totals.calories} <span className="text-lg font-medium text-gray-300">cal</span>
                  </p>
                  <div className="flex gap-2 text-xs font-semibold text-gray-300 justify-end">
                    <span className="bg-white/5 px-2 py-1 rounded">P: {totals.protein}g</span>
                    <span className="bg-white/5 px-2 py-1 rounded">C: {totals.carbs}g</span>
                    <span className="bg-white/5 px-2 py-1 rounded">F: {totals.fat}g</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {log.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-xl"
                  >
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-gray-300 font-medium">
                      {item.quantity} • <span className="text-green-400">{item.calories} cal</span>
                      {item.protein && ` • P: ${item.protein}g`}
                      {item.carbs && ` • C: ${item.carbs}g`}
                      {item.fat && ` • F: ${item.fat}g`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer with Totals Summary */}
              <div className="pt-4 mt-2 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Meal Totals</span>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Prot</p>
                    <p className="text-sm font-bold text-blue-400">{totals.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Carb</p>
                    <p className="text-sm font-bold text-green-400">{totals.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Fat</p>
                    <p className="text-sm font-bold text-yellow-400">{totals.fat}g</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleEdit(log)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(log._id)}
                  className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {nutritionLogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No nutrition logs found. Start logging your meals to track your
            nutrition!
          </p>
        </div>
      )}
    </div>
  );
}
