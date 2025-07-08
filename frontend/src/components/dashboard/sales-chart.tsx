"use client";

import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dummy data for product sales chart
const productData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Product Sales',
      data: [65, 59, 80, 81, 56, 90],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

export function SalesChart() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Product Sales Trend</h2>
      <Line data={productData} options={{ responsive: true }} />
    </div>
  );
}
