import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/signup', formData);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      alert("Signup Failed: " + (err.response?.data?.message || "Error"));
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[560px] rounded-lg border border-slate-200 bg-white px-8 py-10 shadow-sm sm:px-14 sm:py-12"
      >
        <p className="mb-3 text-base text-slate-500">Start managing work with your team</p>
        <h1 className="mb-10 text-4xl font-bold tracking-tight text-slate-900">
          Create account
        </h1>

        <input
          type="text"
          placeholder="Full name"
          required
          className="mb-6 h-14 w-full rounded-md border border-slate-300 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email address"
          required
          className="mb-6 h-14 w-full rounded-md border border-slate-300 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="mb-10 h-14 w-full rounded-md border border-slate-300 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />

        <button
          type="submit"
          className="h-14 w-full rounded-md bg-blue-600 font-semibold text-white transition hover:bg-blue-700"
        >
          Sign Up
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
