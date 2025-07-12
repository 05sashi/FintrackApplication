// src/pages/Income.js
import React, { useEffect, useState, useContext, useMemo } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import { AppContext } from '../App';
import { theme as customTheme } from '../theme';
import Modal from '../components/Modal';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
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

const Income = () => {
  const [incomes, setIncomes] = useState([]);
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

  const predefinedCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Rental', 'Other'];

  const allCategories = useMemo(() => {
    const custom = incomes.map(i => i.category).filter(c => c && !predefinedCategories.includes(c));
    return [...new Set([...predefinedCategories, ...custom])];
  }, [incomes]);
  
  const fetchIncomes = async () => {
    try {
      const res = await API.get('/transactions');
      setIncomes(res.data.filter((t) => t.type === 'income'));
    } catch {
      toast.error('Error fetching income');
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
      type: 'income',
      amount: Number(formData.amount),
      date: formData.date ? new Date(formData.date) : new Date(),
    };
    
    try {
      if (editingId) {
        await API.put(`/transactions/${editingId}`, dataToSubmit);
        toast.success('Income updated');
      } else {
        await API.post('/transactions', dataToSubmit);
        toast.success('Income added');
      }
      resetForm();
      fetchIncomes();
    } catch {
      toast.error(`Failed to ${editingId ? 'update' : 'add'} income`);
    }
  };

  const handleEditClick = (income) => {
    setEditingId(income._id);
    const isPredefined = predefinedCategories.includes(income.category);
    setFormData({
      amount: income.amount,
      category: isPredefined ? income.category : 'Other',
      description: income.description,
      date: new Date(income.date).toISOString().split('T')[0],
    });

    if (!isPredefined) {
      setShowCustomCategory(true);
      setCustomCategory(income.category);
    }
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchIncomes();
      toast.warn('Income deleted');
    } catch {
      toast.error('Failed to delete income');
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

  const processedIncomes = useMemo(() => {
    let sorted = [...incomes];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        default: return new Date(b.date) - new Date(a.date);
      }
    });

    if (groupByCategory) {
      return sorted.reduce((acc, income) => {
        const key = income.category || 'Uncategorized';
        if (!acc[key]) acc[key] = [];
        acc[key].push(income);
        return acc;
      }, {});
    }
    
    return sorted;
  }, [incomes, sortBy, groupByCategory]);
  
  const getChartData = () => {
    const sortedByDate = [...incomes].sort((a,b) => new Date(a.date) - new Date(b.date));
    const dataByDate = sortedByDate.reduce((acc, item) => {
      const date = new Date(item.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + item.amount;
      return acc;
    }, {});
    
    return {
      labels: Object.keys(dataByDate),
      datasets: [{
        label: 'Income by Date',
        data: Object.values(dataByDate),
        borderColor: theme === 'dark' ? '#22C55E' : '#16A34A',
        backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(22, 163, 74, 0.2)',
        pointBackgroundColor: theme === 'dark' ? '#22C55E' : '#16A34A',
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

  useEffect(() => { fetchIncomes(); }, []);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.primary}`}>Income Manager</h2>
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
                <button onClick={() => { setEditingId(null); setFormData({ amount: '', category: '', description: '', date: '' }); setIsModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                    <Plus size={20} /> Add Income
                </button>
            </div>
        </div>
        
        <Modal isOpen={isModalOpen} onClose={resetForm} title={editingId ? 'Edit Income' : 'Add New Income'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" placeholder="Amount" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text}`} value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                    <input type="date" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text}`} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                    <select value={formData.category} onChange={handleCategoryChange} className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text}`}>
                        <option value="">Select a Category</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {showCustomCategory && (
                        <input type="text" placeholder="Enter Custom Category" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text}`} value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required />
                    )}
                </div>
                <input type="text" placeholder="Description" className={`w-full p-3 rounded-lg ${currentTheme.input} ${currentTheme.text}`} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                <div className="flex items-center gap-4 pt-2">
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition">{editingId ? 'Update Income' : 'Add Income'}</button>
                    <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition">Cancel</button>
                </div>
            </form>
        </Modal>

        <div className={`mb-8 p-4 md:p-6 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`} style={{ height: '400px' }}>
            {incomes.length > 0 ? <Line data={getChartData()} options={chartOptions} /> : <div className="flex items-center justify-center h-full text-gray-400">No income data to display chart.</div>}
        </div>

        {groupByCategory ? (
            <div className="space-y-6">
                {Object.keys(processedIncomes).map(category => (
                    <div key={category} className={`p-4 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
                        <div onClick={() => toggleGroup(category)} className="flex justify-between items-center cursor-pointer">
                            <h3 className="text-xl font-bold text-sky-400">{category} ({processedIncomes[category].length})</h3>
                            {openGroups[category] ? <ChevronUp /> : <ChevronDown />}
                        </div>
                        {openGroups[category] && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {processedIncomes[category].map(inc => <IncomeCard key={inc._id} income={inc} onEdit={handleEditClick} onDelete={handleDelete} />)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {processedIncomes.map(inc => <IncomeCard key={inc._id} income={inc} onEdit={handleEditClick} onDelete={handleDelete} />)}
            </div>
        )}
    </div>
  );
};

const IncomeCard = ({ income, onEdit, onDelete }) => {
  const { theme } = useContext(AppContext);
  const currentTheme = customTheme[theme];
  return (
    <div className={`p-4 rounded-2xl ${currentTheme.card} ${currentTheme.shadow} border-l-4 border-green-500 flex flex-col justify-between`}>
      <div>
        <p className="text-sm font-semibold text-green-500">{income.category || 'Uncategorized'}</p>
        <h3 className={`font-bold text-xl md:text-2xl ${currentTheme.text}`}>₹{income.amount.toLocaleString()}</h3>
        <p className={`text-sm mt-1 ${currentTheme.subtext}`}>{income.description}</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className={`text-xs ${currentTheme.subtext}`}>{new Date(income.date).toLocaleDateString()}</p>
        <div className="flex gap-2">
          <button onClick={() => onEdit(income)} className="text-gray-400 hover:text-sky-400 transition"><Pencil size={16} /></button>
          <button onClick={() => onDelete(income._id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default Income;