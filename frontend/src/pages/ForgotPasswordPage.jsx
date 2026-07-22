import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, X } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-choco-light px-4">
      <div className="bg-choco-cream border border-choco-border rounded-2xl shadow-sm w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-choco-dark mb-2">Email envoyé !</h2>
        <p className="text-choco-dark/50 text-sm mb-6">
          Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
        </p>
        <Link to="/login" className="text-choco-accent font-medium hover:text-choco-dark transition text-sm">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-choco-light px-4">
      <div className="bg-choco-cream border border-choco-border rounded-2xl shadow-sm w-full max-w-md p-8">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-choco-dark/50 hover:text-choco-accent mb-6 transition">
          <ArrowLeft size={16} /> Retour
        </Link>
        <div className="text-center mb-6">
          <div className="bg-choco-warm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-choco-accent" />
          </div>
          <h2 className="text-2xl font-bold text-choco-dark">Mot de passe oublié ?</h2>
          <p className="text-choco-dark/50 text-sm mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <X size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-choco-dark/60 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-3 border border-choco-border rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 bg-choco-cream text-choco-dark placeholder:text-choco-dark/30"
                required />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-choco-dark text-choco-light py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-choco-light border-t-transparent rounded-full animate-spin"></span> Envoi...</>
            ) : 'Envoyer le lien'}
          </button>
        </form>
      </div>
    </div>
  );
}
