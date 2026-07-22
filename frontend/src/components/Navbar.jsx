import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LayoutDashboard, LogOut, ShoppingBag, UserCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar({ cartCount }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [pendingGrossistes, setPendingGrossistes] = useState(0);

  useEffect(() => {
    if (!isAdmin()) return;
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('token');
        const [ordersRes, grossistesRes] = await Promise.all([
          fetch('/api/orders?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/grossistes', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const grossistes = grossistesRes.ok ? await grossistesRes.json() : [];
        const pendingOrders = orders.filter(o => o.status === 'pending');
        const pendingG = grossistes.filter(g => g.approval_status === 'pending');
        setNotifCount(pendingOrders.length + pendingG.length);
        setNotifs(pendingOrders.slice(0, 4));
        setPendingGrossistes(pendingG.length);
      } catch {}
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50 bg-choco-light/90 backdrop-blur-xl border-b border-choco-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/catalogue" className="font-display text-2xl font-bold tracking-tight text-choco-dark hover:text-choco-accent transition">
          Borj El Eilm
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/catalogue" className="text-sm font-medium text-choco-dark/70 hover:text-choco-dark transition">Accueil</Link>
          {isAdmin() && (
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-choco-dark/70 hover:text-choco-dark transition">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}
          {user && !isAdmin() && (
            <Link to="/mes-commandes" className="flex items-center gap-1 text-sm font-medium text-choco-dark/70 hover:text-choco-dark transition">
              <ShoppingBag size={16} /> Mes Commandes
            </Link>
          )}
          {user && (
            <Link to="/profil" className="flex items-center gap-1 text-sm font-medium text-choco-dark/70 hover:text-choco-dark transition">
              <UserCircle size={16} /> {user.first_name}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin() && (
            <div className="relative">
              <button onClick={() => setShowNotifs(v => !v)}
                className="relative p-2 hover:bg-choco-warm rounded-full transition">
                <Bell size={19} className="text-choco-dark/50" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-choco-cream border border-choco-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-choco-border flex items-center justify-between">
                    <p className="font-bold text-sm text-choco-dark">Commandes en attente</p>
                    <span className="text-xs text-choco-dark/40">{notifCount} commande{notifCount !== 1 ? 's' : ''}</span>
                  </div>
                  {notifs.length === 0 ? (
                    <p className="text-center text-choco-dark/40 text-sm py-6">Aucune commande en attente</p>
                  ) : notifs.map(o => (
                    <button key={o.id} onClick={() => { setShowNotifs(false); navigate('/admin'); window.dispatchEvent(new CustomEvent('admin-tab', { detail: 'orders' })); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-choco-warm transition border-b border-choco-border last:border-0">
                      <div className="w-8 h-8 bg-choco-warm rounded-full flex items-center justify-center shrink-0">
                        <ShoppingCart size={14} className="text-choco-accent" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-sm text-choco-dark truncate">{o.order_number}</p>
                        <p className="text-xs text-choco-dark/50 truncate">{o.first_name} {o.last_name} · {parseFloat(o.total_amount).toFixed(2)} MAD</p>
                      </div>
                      <span className="text-xs text-choco-dark/40 whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </button>
                  ))}
                  {pendingGrossistes > 0 && (
                    <button onClick={() => { setShowNotifs(false); navigate('/admin'); window.dispatchEvent(new CustomEvent('admin-tab', { detail: 'grossistes' })); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-choco-warm transition border-b border-choco-border bg-choco-warm/50">
                      <div className="w-8 h-8 bg-choco-warm rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm">🏢</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm text-choco-dark">{pendingGrossistes} demande{pendingGrossistes > 1 ? 's' : ''} grossiste en attente</p>
                      </div>
                    </button>
                  )}
                  <button onClick={() => { setShowNotifs(false); navigate('/admin'); window.dispatchEvent(new CustomEvent('admin-tab', { detail: 'orders' })); }}
                    className="block w-full text-center text-xs text-choco-accent font-medium py-3 hover:bg-choco-warm transition">
                    Voir toutes les commandes →
                  </button>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <button onClick={handleLogout} className="flex items-center gap-1 text-choco-dark/50 hover:text-red-500 transition text-sm">
                <LogOut size={17} /> Déconnexion
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="flex items-center gap-1 text-sm font-medium text-choco-dark/70 hover:text-choco-dark transition">
                <User size={16} /> Connexion
              </Link>
              <Link to="/register" className="px-4 py-2 bg-choco-dark text-choco-light text-sm font-medium rounded-full hover:bg-choco-dark/80 transition">
                Inscription
              </Link>
            </div>
          )}

          <Link to="/cart" className="relative p-2 hover:bg-choco-warm rounded-full transition">
            <ShoppingCart size={20} className="text-choco-dark/70" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-choco-border bg-choco-light/95 backdrop-blur-xl">
          <div className="px-6 py-4 space-y-3">
            <Link to="/catalogue" className="block text-sm font-medium text-choco-dark/70 hover:text-choco-dark" onClick={() => setMobileOpen(false)}>Accueil</Link>
            {isAdmin() && <Link to="/admin" className="block text-sm font-medium text-choco-dark/70 hover:text-choco-dark" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
            {user && !isAdmin() && <Link to="/mes-commandes" className="block text-sm font-medium text-choco-dark/70 hover:text-choco-dark" onClick={() => setMobileOpen(false)}>Mes Commandes</Link>}
            {user && <Link to="/profil" className="block text-sm font-medium text-choco-dark/70 hover:text-choco-dark" onClick={() => setMobileOpen(false)}>Mon Profil</Link>}
            {user ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-sm font-medium text-red-500">Déconnexion</button>
            ) : (
              <>
                <Link to="/login" className="block text-sm font-medium text-choco-dark/70 hover:text-choco-dark" onClick={() => setMobileOpen(false)}>Connexion</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block mt-2 px-4 py-2 bg-choco-dark text-choco-light text-sm font-medium rounded-full text-center">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
