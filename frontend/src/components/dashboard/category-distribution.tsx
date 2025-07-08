"use client";

import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { fetchCategories, Category } from '@/services/category-service';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartTypes = ['doughnut', 'bar'] as const;
type ChartType = typeof chartTypes[number];

export function CategoryDistribution() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('doughnut');

  useEffect(() => {
    setLoading(true);
    fetchCategories(100)
      .then(data => {
        setCategories(data);
        setError(null);
      })
      .catch(e => {
        setError(e.message || 'Failed to load categories');
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm w-1/3">Loading category distribution...</div>;
  }
  if (error) {
    return <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm w-1/3 text-red-500">{error}</div>;
  }

  const filtered = categories.filter(c => c.count > 0);
  const labels = filtered.map(c => c.name);
  const data = filtered.map(c => c.count);
  const backgroundColor = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)',
  ];
  const borderColor = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: 'Product Count',
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true, precision: 0 },
    },
  };

  const handlePrev = () => {
    setChartType((prev) => prev === 'doughnut' ? 'bar' : 'doughnut');
  };
  const handleNext = () => {
    setChartType((prev) => prev === 'bar' ? 'doughnut' : 'bar');
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm w-1/3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Category Distribution</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="p-1 rounded hover:bg-muted" aria-label="Previous chart">
            <span className="material-icons">arrow_left</span>
          </button>
          <span className="text-sm text-muted-foreground capitalize">{chartType === 'doughnut' ? 'Donut' : 'Histogram'}</span>
          <button onClick={handleNext} className="p-1 rounded hover:bg-muted" aria-label="Next chart">
            <span className="material-icons">arrow_right</span>
          </button>
        </div>
      </div>
      <div className="relative" style={{ height: 320, minHeight: 320, maxHeight: 320 }}>
        {filtered.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-center h-full">No category data available.</div>
        ) : chartType === 'doughnut' ? (
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        ) : (
          <Bar data={barData} options={{ ...barOptions, maintainAspectRatio: false }} />
        )}
      </div>
    </div>
  );
}
