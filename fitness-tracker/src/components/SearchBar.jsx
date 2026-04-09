import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

export default function SearchBar({ onSearchResults, searchType = 'all' }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    type: searchType
  });
  const [isSearching, setIsSearching] = useState(false);

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'workouts', label: 'Workouts' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'progress', label: 'Progress' }
  ];

  const workoutCategories = [
    { value: '', label: 'All Categories' },
    { value: 'strength', label: 'Strength Training' },
    { value: 'cardio', label: 'Cardio' }
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const handleSearch = async () => {
    if (!query.trim() && !filters.category && !filters.dateRange) {
      onSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = getToken();
      let results = [];

      if (filters.type === 'all' || filters.type === 'workouts') {
        const workoutResults = await searchWorkouts(token);
        results.push(...workoutResults.map(item => ({ ...item, type: 'workout' })));
      }

      if (filters.type === 'all' || filters.type === 'nutrition') {
        const nutritionResults = await searchNutrition(token);
        results.push(...nutritionResults.map(item => ({ ...item, type: 'nutrition' })));
      }

      if (filters.type === 'all' || filters.type === 'progress') {
        const progressResults = await searchProgress(token);
        results.push(...progressResults.map(item => ({ ...item, type: 'progress' })));
      }

      // Apply filters
      let filteredResults = results;
      
      if (filters.category && filters.type === 'workouts') {
        filteredResults = filteredResults.filter(item => 
          item.type === 'workout' && item.category === filters.category
        );
      }

      if (filters.dateRange) {
        filteredResults = filterByDateRange(filteredResults, filters.dateRange);
      }

      // Sort by relevance and date
      filteredResults.sort((a, b) => {
        // Sort by type relevance first
        const typeOrder = { workout: 1, nutrition: 2, progress: 3 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        // Then by date (newest first)
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      });

      onSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchWorkouts = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/workouts/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { keyword: query }
      });
      return response.data;
    } catch (error) {
      console.error('Workout search error:', error);
      return [];
    }
  };

  const searchNutrition = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/nutrition/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { keyword: query }
      });
      return response.data;
    } catch (error) {
      console.error('Nutrition search error:', error);
      return [];
    }
  };

  const searchProgress = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/progress/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { keyword: query }
      });
      return response.data;
    } catch (error) {
      console.error('Progress search error:', error);
      return [];
    }
  };

  const filterByDateRange = (results, dateRange) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate;
    switch (dateRange) {
      case 'today':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return results;
    }

    return results.filter(item => {
      const itemDate = new Date(item.createdAt || item.date);
      return itemDate >= startDate;
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else if (!filters.category && !filters.dateRange) {
        onSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filters]);

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search workouts, nutrition, progress..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 text-white placeholder-gray-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 text-white"
          >
            {searchTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {filters.type === 'workouts' && (
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 text-white"
            >
              {workoutCategories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          )}

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 text-white"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Search Stats */}
        {query && (
          <div className="text-sm text-gray-300">
            Searching for "{query}" in {filters.type === 'all' ? 'all categories' : filters.type}...
          </div>
        )}
      </div>
    </div>
  );
}
