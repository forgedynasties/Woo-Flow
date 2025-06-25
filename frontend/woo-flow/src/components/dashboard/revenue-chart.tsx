"use client";

import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Dummy data for revenue chart
const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [4200, 3800, 5100, 5800, 4900, 6300],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
    },
  ],
};

export function RevenueChart() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
      <Bar data={revenueData} options={{ responsive: true }} />
    </div>
  );
}
