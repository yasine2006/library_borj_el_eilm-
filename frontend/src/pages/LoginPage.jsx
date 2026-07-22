import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiLogin(email, password);
      login(data.token, data.user);

      // Redirect based on role
      if (data.user.role_id === 1 || data.user.role_id === 2) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-choco-light px-4">
      <div className="bg-choco-cream border border-choco-border rounded-2xl shadow-sm w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-choco-warm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-choco-accent" />
          </div>
          <h2 className="text-2xl font-bold text-choco-dark">Connexion</h2>
          <p className="text-choco-dark/50 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30"
                required
              />
            </div>
          </div>
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-sm text-choco-accent hover:text-choco-dark transition">
              Mot de passe oublié ?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-choco-dark text-choco-light py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-choco-light border-t-transparent rounded-full animate-spin"></span>
                Connexion...
              </>
            ) : 'Se Connecter'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-choco-dark/50">
          <p>Pas encore de compte? <Link to="/register" className="text-choco-accent font-medium hover:text-choco-dark transition">S'inscrire</Link></p>
        </div>

      </div>
    </div>
  );
}
