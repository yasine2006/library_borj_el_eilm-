import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, User, Phone, MapPin, FileText, TrendingUp, Lock, Mail, CheckCircle, Upload, X, Store, ArrowLeft } from 'lucide-react';

export default function RegisterGrossistePage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    address: '', city: '',
    company_name: '', rc_number: '', estimated_volume: '',
    password: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) return setError('Le document justificatif est obligatoire (RC, patente, ou photo)');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('document', file);

      const res = await fetch('/api/grossistes/register', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4 pt-20">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-white/50 animate-scale-in">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Demande envoyée!</h2>
        <p className="text-gray-500 mb-5">Votre dossier a été soumis à l'administrateur pour validation.</p>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 text-left border border-amber-200/50">
          <p className="text-sm font-bold text-amber-800 mb-2">📋 Prochaines étapes:</p>
          <p className="text-sm text-amber-700">Vous pouvez vous connecter dès maintenant avec les prix détail. Une fois approuvé, les prix grossiste seront automatiquement débloqués.</p>
        </div>
        <button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3.5 rounded-xl font-bold hover:from-amber-700 hover:to-amber-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
          Se connecter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 px-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Inscription Grossiste</h1>
          <p className="text-gray-500 mt-1">Accédez aux prix professionnels après validation de votre dossier</p>
        </div>

        <Link to="/register" className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 mb-4 transition-all">
          <ArrowLeft size={16} /> Retour à l'inscription client
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2 animate-fade-in">
            <X size={16} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/50">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
              <User size={18} className="text-amber-600" /> Informations personnelles
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label>
                <input value={form.first_name} onChange={e => setField('first_name', e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input value={form.last_name} onChange={e => setField('last_name', e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" required />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone *</label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                    placeholder="06XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville *</label>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input value={form.city} onChange={e => setField('city', e.target.value)}
                    placeholder="Khenifra..."
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" required />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
              <input value={form.address} onChange={e => setField('address', e.target.value)}
                placeholder="Rue, quartier..."
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/50">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
              <Store size={18} className="text-amber-600" /> Informations professionnelles
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la librairie / entreprise *</label>
              <input value={form.company_name} onChange={e => setField('company_name', e.target.value)}
                placeholder="Ex: Librairie Al Amal..."
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" required />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <FileText size={14} /> Numéro RC (Registre de Commerce)
              </label>
              <input value={form.rc_number} onChange={e => setField('rc_number', e.target.value)}
                placeholder="Ex: RC-123456"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <TrendingUp size={14} /> Volume d'achat mensuel estimé
              </label>
              <select value={form.estimated_volume} onChange={e => setField('estimated_volume', e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50">
                <option value="">-- Sélectionner --</option>
                <option value="500-1000 MAD">500 - 1,000 MAD</option>
                <option value="1000-5000 MAD">1,000 - 5,000 MAD</option>
                <option value="5000-10000 MAD">5,000 - 10,000 MAD</option>
                <option value="+10000 MAD">+10,000 MAD</option>
              </select>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/50">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-lg">
              <Upload size={18} className="text-amber-600" /> Document justificatif *
            </h2>
            <p className="text-sm text-gray-500 mb-4">RC, patente, ou photo — PDF, JPG ou PNG (max 5MB)</p>

            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${file ? 'border-green-400 bg-green-50/50' : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/50'}`}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} className="hidden" />
              {file ? (
                <>
                  <CheckCircle size={32} className="text-green-500 mb-2" />
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-green-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={e => { e.preventDefault(); setFile(null); }}
                    className="mt-3 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full transition-all">
                    <X size={12}/> Supprimer
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-3">
                    <Upload size={24} className="text-amber-600" />
                  </div>
                  <p className="font-medium text-gray-600">Cliquer pour télécharger</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG — max 5MB</p>
                </>
              )}
            </label>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-white/50">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
              <Lock size={18} className="text-amber-600" /> Mot de passe
            </h2>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              <input type="password" value={form.password} onChange={e => setField('password', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all bg-white/50"
                required minLength={6} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-5">
            <p className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-1.5">ℹ️ Comment ça marche?</p>
            <p className="text-sm text-blue-600">Après inscription, vous accédez au site avec les prix détail. Une fois votre dossier validé par l'administrateur, vous aurez automatiquement accès aux prix grossiste.</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-700 hover:to-amber-600 transition-all disabled:opacity-60 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Envoi en cours...</span></>
              : '🏢 Soumettre ma demande'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte? <Link to="/login" className="text-amber-600 font-medium hover:text-amber-700 transition-all hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
