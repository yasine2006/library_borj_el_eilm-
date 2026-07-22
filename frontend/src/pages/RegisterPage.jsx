import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRegister } from '../api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    password: '',
    user_type: 'retail'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiRegister(form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-choco-light px-4 py-8">
      <div className="bg-choco-cream border border-choco-border rounded-2xl shadow-sm w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-choco-warm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-choco-accent" />
          </div>
          <h2 className="text-2xl font-bold text-choco-dark">Inscription</h2>
          <p className="text-choco-dark/50 text-sm mt-1">Créez votre compte client</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type compte */}
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Type de compte</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm({...form, user_type: 'retail'})}
                className={`flex-1 py-3 rounded-xl font-medium transition ${form.user_type === 'retail' ? 'bg-choco-dark text-choco-light shadow-sm' : 'bg-choco-warm text-choco-dark/60 hover:bg-choco-warm/80'}`}>
                👤 Détail
              </button>
              <button type="button" onClick={() => navigate('/register-grossiste')}
                className={`flex-1 py-3 rounded-xl font-medium transition bg-choco-warm text-choco-dark/60 hover:bg-choco-warm/80`}>
                🏢 Grossiste
              </button>
            </div>
          </div>

          {/* Nom + Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-choco-dark/60 mb-1">Prénom *</label>
              <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full px-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-choco-dark/60 mb-1">Nom *</label>
              <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full px-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Téléphone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="06XXXXXXXX"
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required />
            </div>
          </div>

          {/* Adresse + Ville */}
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Adresse *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                placeholder="Rue, quartier, n°..."
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Ville *</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                placeholder="Khenifra, Rabat, Casablanca..."
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30" required minLength={6} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-choco-dark text-choco-light py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-choco-light border-t-transparent rounded-full animate-spin"></span>Création...</>
            ) : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-choco-dark/50">
          <p>Déjà un compte? <Link to="/login" className="text-choco-accent font-medium hover:text-choco-dark transition">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}
