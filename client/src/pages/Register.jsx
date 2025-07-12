// src/pages/Register.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sun, Moon, UserPlus, CheckCircle } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { AppContext } from '../App';
import { theme as customTheme, gradients } from '../theme';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const currentTheme = customTheme[theme];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', form);
      toast.success('Account created successfully! 🚀');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${currentTheme.background}`}>
      {/* Left Side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-5 left-5">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
        <div className={`w-full max-w-md p-10 rounded-2xl ${currentTheme.card} ${currentTheme.shadow}`}>
          <h2 className={`text-4xl font-bold text-center mb-6 ${gradients.header}`}>Create an Account</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className={`text-sm font-medium ${currentTheme.subtext}`}>Username</label>
              <input name="username" type="text" className={`w-full p-3 mt-1 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <label className={`text-sm font-medium ${currentTheme.subtext}`}>Email</label>
              <input name="email" type="email" className={`w-full p-3 mt-1 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className={`text-sm font-medium ${currentTheme.subtext}`}>Password</label>
              <input name="password" type="password" className={`w-full p-3 mt-1 rounded-lg ${currentTheme.input} ${currentTheme.text} focus:outline-none focus:ring-2`} value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className={`w-full py-3 rounded-lg text-white font-semibold ${currentTheme.accent} ${currentTheme.accentHover} transition-colors flex items-center justify-center`}>Register <UserPlus className="w-5 h-5 ml-2" /></button>
            <p className={`text-center text-sm ${currentTheme.subtext}`}>Already have an account?{' '}<Link to="/login" className={`font-medium ${currentTheme.primary} hover:underline`}>Login</Link></p>
          </form>
        </div>
      </div>

      {/* Right Side Content */}
      <div className={`w-1/2 relative hidden lg:flex flex-col justify-between p-12 ${gradients.background}`}>
          <div>
            <h1 className="text-5xl font-bold text-white">Fintrack</h1>
          </div>
          <div className="space-y-4">
            <p className="flex items-center text-white/90"><CheckCircle className="w-5 h-5 mr-3 text-sky-400" />Get personalized insights to improve your financial habits.</p>
            <p className="flex items-center text-white/90"><CheckCircle className="w-5 h-5 mr-3 text-sky-400" />Set and track your financial goals with ease.</p>
            <p className="flex items-center text-white/90"><CheckCircle className="w-5 h-5 mr-3 text-sky-400" />Access your financial data from any device, anytime.</p>
          </div>
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <p className="text-white italic">“Signing up for Fintrack was the best financial decision I've made. It's incredibly user-friendly and has helped me save more than I thought possible.”</p>
            <p className="mt-4 font-semibold text-white">— Sashidhar, Website Author</p>
        </div>
      </div>
    </div>
  );
};

export default Register;