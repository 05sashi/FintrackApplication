// src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { theme as customTheme } from '../theme';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const { theme } = useContext(AppContext);
  const currentTheme = customTheme[theme];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  const incomes = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [totalIncome, totalExpense],
      backgroundColor: [
        theme === 'dark' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(22, 163, 74, 0.7)',
        theme === 'dark' ? 'rgba(248, 113, 113, 0.7)' : 'rgba(239, 68, 68, 0.7)',
      ],
      borderColor: [
        theme === 'dark' ? '#22C55E' : '#16A34A',
        theme === 'dark' ? '#F87171' : '#EF4444',
      ],
      borderWidth: 2,
    }],
  };

  const categoryTotals = expenses.reduce((acc, t) => {
    const cat = t.category || 'Other';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});
  
  const barData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: 'Expenses by Category',
      data: Object.values(categoryTotals),
      backgroundColor: theme === 'dark' ? 'rgba(248, 113, 113, 0.7)' : 'rgba(239, 68, 68, 0.7)',
      borderColor: theme === 'dark' ? '#F87171' : '#EF4444',
      borderWidth: 2,
      borderRadius: 5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: theme === 'dark' ? '#E5E7EB' : '#374151', font: { size: 14 } } },
    },
    scales: {
      y: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
      x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: false } },
    },
  };

  if (transactions.length === 0) {
    return (
      <div className={`text-center p-6 md:p-10 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
        <Wallet size={60} className={`mx-auto mb-4 ${currentTheme.primary}`} />
        <h2 className={`text-2xl md:text-3xl font-bold ${currentTheme.text}`}>Welcome to Fintrack!</h2>
        <p className={`mt-2 mb-6 ${currentTheme.subtext}`}>It looks like you haven't added any transactions yet.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/income" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
            <TrendingUp size={20} /> Add Income
          </Link>
          <Link to="/expenses" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition">
            <TrendingDown size={20} /> Add Expense
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${currentTheme.primary}`}>Dashboard Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 p-4 md:p-6 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
          <h3 className="text-xl font-semibold mb-4">Expenses by Category</h3>
          <div className="h-64 md:h-96">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className={`p-4 md:p-6 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
          <h3 className="text-xl font-semibold mb-4">Income vs Expenses</h3>
          <div className="h-64 md:h-96">
            <Pie data={pieData} options={{ ...chartOptions, scales: {} }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;