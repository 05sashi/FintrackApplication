// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, ArrowRight, CheckCircle } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { AppContext } from '../App';
import { theme as customTheme, gradients } from '../theme';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const currentTheme = customTheme[theme];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      toast.success('Welcome back to Fintrack 🎯');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.background}`}>
      {/* Left Side */}
      <div className={`w-1/2 relative hidden lg:flex flex-col justify-between p-12 ${gradients.background}`}>
        <div>
          <h1 className="text-5xl font-bold text-white">Fintrack</h1>
          <p className="mt-4 text-white/70 text-lg">Take control of your finances. Effortlessly.</p>
        </div>
        <div className="space-y-4">
          <p className="flex items-center text-white/90"><CheckCircle className="w-5 h-5 mr-3 text-sky-400" />Real-time expense and income tracking</p>
          <p className="flex items-center text-white/90"><CheckCircle className="w-5 h-5 mr-3 text-sky-400" />Advanced filtering and reporting</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
          <p className="text-white italic">“Fintrack has revolutionized how I manage my money. It's intuitive, powerful, and beautiful.”</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-5 right-5">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className={`w-full max-w-md p-10 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
          <h2 className={`text-4xl font-bold text-center mb-6 ${gradients.header}`}>Welcome Back</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={`text-sm font-medium ${currentTheme.subtext}`}>Email</label>
              <input name="email" type="email" className={`w-full p-3 mt-1 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className={`text-sm font-medium ${currentTheme.subtext}`}>Password</label>
              <input name="password" type="password" className={`w-full p-3 mt-1 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className={`w-full py-3 rounded-lg text-white font-semibold ${currentTheme.accent} ${currentTheme.accentHover} transition-colors flex items-center justify-center`}>Login <ArrowRight className="w-5 h-5 ml-2" /></button>
            <p className={`text-center text-sm ${currentTheme.subtext}`}>Don’t have an account?{' '}<Link to="/register" className={`font-medium ${currentTheme.primary} hover:underline`}>Register</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;