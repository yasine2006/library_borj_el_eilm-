import { useState } from 'react';
import { User, Phone, MapPin, Building, Mail, Save, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUpdateUser } from '../api';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await apiUpdateUser(user.id, form);
      // Update user in localStorage
      const updatedUser = { ...user, ...form };
      login(localStorage.getItem('token'), updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={36} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{user?.first_name} {user?.last_name}</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              user?.user_type === 'wholesale' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-600'
            }`}>
              {user?.user_type === 'wholesale' ? '🏢 Grossiste' : '👤 Détail'}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-800 mb-5">Modifier mes informations</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <CheckCircle size={16} /> Profil mis à jour avec succès
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email readonly */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setForm({...form, first_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => setForm({...form, last_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="06XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Rue, quartier, n°..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({...form, city: e.target.value})}
                  placeholder="Khenifra, Rabat..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement...</>
                : <><Save size={18} /> Enregistrer les modifications</>
              }
            </button>
          </form>
        </div>

        {/* Info mot de passe */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mt-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <Lock size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-700 text-sm">Mot de passe</p>
            <p className="text-xs text-gray-400">Pour changer votre mot de passe, contactez l'administrateur</p>
          </div>
        </div>

      </div>
    </div>
  );
}