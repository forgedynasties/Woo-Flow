"use client";

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Dummy data for category distribution
const categoryData = {
  labels: ['Furniture', 'Kitchen', 'Electronics', 'Clothing', 'Accessories'],
  datasets: [
    {
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

export function CategoryDistribution() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
      <Doughnut data={categoryData} options={{ responsive: true }} />
    </div>
  );
}
