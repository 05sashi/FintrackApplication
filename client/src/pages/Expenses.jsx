// src/pages/Expenses.js
import React, { useEffect, useState, useContext, useMemo } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import { AppContext } from '../App';
import { theme as customTheme } from '../theme';
import Modal from '../components/Modal';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ amount: '', category: '', description: '', date: '' });
  
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [openGroups, setOpenGroups] = useState({});

  const { theme } = useContext(AppContext);
  const currentTheme = customTheme[theme];

  const predefinedCategories = ['Groceries', 'Bills', 'Transport', 'Entertainment', 'Health', 'Other'];

  const allCategories = useMemo(() => {
    const custom = expenses.map(e => e.category).filter(c => c && !predefinedCategories.includes(c));
    return [...new Set([...predefinedCategories, ...custom])];
  }, [expenses]);
  
  const fetchExpenses = async () => {
    try {
      const res = await API.get('/transactions');
      setExpenses(res.data.filter((t) => t.type === 'expense'));
    } catch {
      toast.error('Error fetching expenses');
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ amount: '', category: '', description: '', date: '' });
    setShowCustomCategory(false);
    setCustomCategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === 'Other' ? customCategory : formData.category;
    const dataToSubmit = {
      ...formData,
      category: finalCategory,
      type: 'expense',
      amount: Number(formData.amount),
      date: formData.date ? new Date(formData.date) : new Date(),
    };
    try {
      if (editingId) {
        await API.put(`/transactions/${editingId}`, dataToSubmit);
        toast.success('Expense updated');
      } else {
        await API.post('/transactions', dataToSubmit);
        toast.success('Expense added');
      }
      resetForm();
      fetchExpenses();
    } catch {
      toast.error(`Failed to ${editingId ? 'update' : 'add'} expense`);
    }
  };
  
  const handleEditClick = (expense) => {
    setEditingId(expense._id);
    const isPredefined = predefinedCategories.includes(expense.category);
    setFormData({
      amount: expense.amount,
      category: isPredefined ? expense.category : 'Other',
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
    });

    if (!isPredefined) {
      setShowCustomCategory(true);
      setCustomCategory(expense.category);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchExpenses();
      toast.warn('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, category: value });
    setShowCustomCategory(value === 'Other');
  };
  
  const toggleGroup = (category) => {
    setOpenGroups(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const processedExpenses = useMemo(() => {
    let sorted = [...expenses];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        default: return new Date(b.date) - new Date(a.date);
      }
    });

    if (groupByCategory) {
      return sorted.reduce((acc, expense) => {
        const key = expense.category || 'Uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push(expense);
        return acc;
      }, {});
    }
    
    return sorted;
  }, [expenses, sortBy, groupByCategory]);

  const getChartData = () => {
    const sortedByDate = [...expenses].sort((a,b) => new Date(a.date) - new Date(b.date));
    const dataByDate = sortedByDate.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + item.amount;
      return acc;
    }, {});

    return {
      labels: Object.keys(dataByDate),
      datasets: [{
        label: 'Expenses by Date',
        data: Object.values(dataByDate),
        borderColor: theme === 'dark' ? '#F87171' : '#EF4444',
        backgroundColor: theme === 'dark' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        pointBackgroundColor: theme === 'dark' ? '#F87171' : '#EF4444',
        tension: 0.4,
        fill: true,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: theme === 'dark' ? '#E5E7EB' : '#374151' } } },
    scales: {
      y: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' } },
      x: { ticks: { color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }, grid: { color: false } },
    },
  };
  
  useEffect(() => { fetchExpenses(); }, []);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.primary}`}>Expense Manager</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <label className={`${currentTheme.subtext}`}>Group by Category</label>
                    <button onClick={() => setGroupByCategory(!groupByCategory)} className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${groupByCategory ? 'bg-sky-500 text-white' : `${currentTheme.card} ${currentTheme.shadow}`}`}>{groupByCategory ? 'On' : 'Off'}</button>
                </div>
                <select onChange={(e) => setSortBy(e.target.value)} value={sortBy} className={`w-full sm:w-auto p-2 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`}>
                    <option value="date-desc">Sort: Newest</option>
                    <option value="date-asc">Sort: Oldest</option>
                    <option value="amount-desc">Sort: High-Low</option>
                    <option value="amount-asc">Sort: Low-High</option>
                </select>
                <button onClick={() => { setEditingId(null); setFormData({ amount: '', category: '', description: '', date: '' }); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"><Plus size={20} /> Add Expense</button>
            </div>
        </div>
        
        <Modal isOpen={isModalOpen} onClose={resetForm} title={editingId ? 'Edit Expense' : 'Add New Expense'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" placeholder="Amount" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                    <input type="date" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                    <select value={formData.category} onChange={handleCategoryChange} className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`}>
                        <option value="">Select a Category</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {showCustomCategory && (
                        <input type="text" placeholder="Enter Custom Category" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required />
                    )}
                </div>
                <input type="text" placeholder="Description" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
                <div className="flex items-center gap-4 pt-2">
                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition">{editingId ? 'Update Expense' : 'Add Expense'}</button>
                    <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition">Cancel</button>
                </div>
            </form>
        </Modal>

        <div className={`mb-8 p-4 md:p-6 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`} style={{ height: '400px' }}>
            {expenses.length > 0 ? <Line data={getChartData()} options={chartOptions} /> : <div className="flex items-center justify-center h-full text-gray-400">No expense data to display chart.</div>}
        </div>

        {groupByCategory ? (
            <div className="space-y-6">
                {Object.keys(processedExpenses).map(category => (
                    <div key={category} className={`p-4 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
                        <div onClick={() => toggleGroup(category)} className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-xl font-bold text-sky-400">{category} ({processedExpenses[category].length})</h3>
                            {openGroups[category] ? <ChevronUp /> : <ChevronDown />}
                        </div>
                        {openGroups[category] && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {processedExpenses[category].map(exp => <ExpenseCard key={exp._id} expense={exp} onEdit={handleEditClick} onDelete={handleDelete} />)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {processedExpenses.map(exp => <ExpenseCard key={exp._id} expense={exp} onEdit={handleEditClick} onDelete={handleDelete} />)}
            </div>
        )}
    </div>
  );
};

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
    const { theme } = useContext(AppContext);
    const currentTheme = customTheme[theme];
    return(
        <div className={`p-4 rounded-2xl ${currentTheme.card} ${currentTheme.shadow} border-l-4 border-red-500 flex flex-col justify-between`}>
          <div>
            <p className="text-sm font-semibold text-red-500">{expense.category || 'Uncategorized'}</p>
            <h3 className={`font-bold text-xl md:text-2xl ${currentTheme.text}`}>₹{expense.amount.toLocaleString()}</h3>
            <p className={`text-sm mt-1 ${currentTheme.subtext}`}>{expense.description}</p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className={`text-xs ${currentTheme.subtext}`}>{new Date(expense.date).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button onClick={() => onEdit(expense)} className="text-gray-400 hover:text-sky-400 transition"><Pencil size={16} /></button>
              <button onClick={() => onDelete(expense._id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
    );
}

export default Expenses;