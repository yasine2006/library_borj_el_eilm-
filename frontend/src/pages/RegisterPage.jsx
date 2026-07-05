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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Inscription</h2>
          <p className="text-gray-500 text-sm mt-1">Créez votre compte client</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type compte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de compte</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm({...form, user_type: 'retail'})}
                className={`flex-1 py-3 rounded-xl font-medium transition ${form.user_type === 'retail' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                👤 Détail
              </button>
              <button type="button" onClick={() => setForm({...form, user_type: 'wholesale'})}
                className={`flex-1 py-3 rounded-xl font-medium transition ${form.user_type === 'wholesale' ? 'bg-amber-800 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                🏢 Grossiste
              </button>
            </div>
          </div>

          {/* Nom + Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="06XXXXXXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required />
            </div>
          </div>

          {/* Adresse + Ville */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                placeholder="Rue, quartier, n°..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                placeholder="Khenifra, Rabat, Casablanca..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500" required minLength={6} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Création...</>
            ) : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Déjà un compte? <Link to="/login" className="text-amber-600 font-medium hover:text-amber-700 transition">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}