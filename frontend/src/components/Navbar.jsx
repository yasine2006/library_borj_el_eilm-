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

  // Poll nouvelles commandes toutes les 30s (admin fqt)
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
        const pendingGrossistes = grossistes.filter(g => g.approval_status === 'pending');
        setNotifCount(pendingOrders.length + pendingGrossistes.length);
        setNotifs(pendingOrders.slice(0, 4));
        setPendingGrossistes(pendingGrossistes.length);
      } catch {}
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-white text-gray-800 sticky top-0 z-50 shadow-sm border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Borj El Eilm" className="h-12 w-auto" onError={e => e.target.style.display='none'} />
            <span className="font-bold text-xl text-amber-700">Borj El Eilm</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="font-medium hover:text-amber-600 transition text-sm">Accueil</Link>

            {isAdmin() && (
              <Link to="/admin" className="flex font-medium items-center gap-1 hover:text-amber-600 transition text-sm">
                <LayoutDashboard size={17} /> Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                {!isAdmin() && (
                  <Link to="/mes-commandes" className="flex items-center gap-1 text-sm font-medium hover:text-amber-600 transition">
                    <ShoppingBag size={17} /> Mes Commandes
                  </Link>
                )}
                <Link to="/profil" className="flex items-center gap-1 text-sm font-medium hover:text-amber-600 transition">
                  <UserCircle size={17} /> {user.first_name}
                </Link>

                {/* Notifications — admin fqt */}
                {isAdmin() && (
                  <div className="relative">
                    <button onClick={() => setShowNotifs(v => !v)}
                      className="relative p-2 hover:bg-amber-50 rounded-lg transition">
                      <Bell size={19} className="text-gray-600" />
                      {notifCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </button>
                    {showNotifs && (
                      <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                          <p className="font-bold text-sm text-gray-800">Commandes en attente</p>
                          <span className="text-xs text-gray-400">{notifCount} commande{notifCount !== 1 ? 's' : ''}</span>
                        </div>
                        {notifs.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-6">Aucune commande en attente</p>
                        ) : notifs.map(o => (
                          <button key={o.id} onClick={() => { setShowNotifs(false); navigate('/admin'); window.dispatchEvent(new CustomEvent('admin-tab', { detail: 'orders' })); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition border-b border-gray-50 last:border-0">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                              <ShoppingCart size={14} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="font-medium text-sm text-gray-800 truncate">{o.order_number}</p>
                              <p className="text-xs text-gray-400 truncate">{o.first_name} {o.last_name} · {parseFloat(o.total_amount).toFixed(2)} MAD</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {new Date(o.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </button>
                        ))}
                        {pendingGrossistes > 0 && (
                          <button onClick={() => { setShowNotifs(false); navigate('/admin'); window.dispatchEvent(new CustomEvent('admin-tab', { detail: 'grossistes' })); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition border-b border-gray-50 bg-yellow-50">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-sm">🏢</span>
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm text-gray-800">{pendingGrossistes} demande{pendingGrossistes > 1 ? 's' : ''} grossiste en attente</p>
                            </div>
                          </button>
                        )}
                        <button onClick={() => { setShowNotifs(false); navigate('/admin'); window.dispatchEvent(new CustomEvent('admin-tab', { detail: 'orders' })); }}
                          className="block w-full text-center text-xs text-amber-600 font-medium py-3 hover:bg-amber-50 transition">
                          Voir toutes les commandes →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700 transition text-sm">
                  <LogOut size={17} /> Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="flex items-center gap-1 font-medium hover:text-amber-600 transition text-sm">
                  <User size={17} /> Connexion
                </Link>
                <Link to="/register" className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition text-sm">
                  Inscription
                </Link>
              </div>
            )}

            <Link to="/cart" className="relative p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 bg-white">
            <Link to="/" className="block py-2 px-4 hover:text-amber-600 font-medium" onClick={() => setMobileOpen(false)}>Accueil</Link>
            {isAdmin() && <Link to="/admin" className="block py-2 px-4 hover:text-amber-600 font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
            {user ? (
              <>
                <Link to="/mes-commandes" className="block py-2 px-4 hover:text-amber-600 font-medium" onClick={() => setMobileOpen(false)}>Mes Commandes</Link>
                <Link to="/profil" className="block py-2 px-4 hover:text-amber-600 font-medium" onClick={() => setMobileOpen(false)}>Mon Profil</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block py-2 px-4 text-red-500 font-medium">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 hover:text-amber-600 font-medium" onClick={() => setMobileOpen(false)}>Connexion</Link>
                <Link to="/register" className="block py-2 px-4 hover:text-amber-600 font-medium" onClick={() => setMobileOpen(false)}>Inscription</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}