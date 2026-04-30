import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      alert("Login Failed: " + (err.response?.data?.message || "Request failed"));
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[560px] rounded-lg border border-slate-200 bg-white px-8 py-10 shadow-sm sm:px-14 sm:py-12"
      >
        <p className="mb-3 text-base text-slate-500">Please enter your details</p>
        <h1 className="mb-10 text-4xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>

        <input
          type="email"
          placeholder="Email address"
          required
          className="mb-6 h-14 w-full rounded-md border border-slate-300 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="mb-5 h-14 w-full rounded-md border border-slate-300 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="mb-10 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
          Remember for 30 days
        </label>

        <button
          type="submit"
          className="h-14 w-full rounded-md bg-blue-600 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
