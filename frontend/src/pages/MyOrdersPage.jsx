import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, RefreshCw, ChevronDown, ChevronUp, Package, FileText } from 'lucide-react';
import { apiGetMyOrders } from '../api';

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700',
  validated:   'bg-blue-100 text-blue-700',
  preparation: 'bg-purple-100 text-purple-700',
  shipped:     'bg-indigo-100 text-indigo-700',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700'
};
const STATUS_LABELS = {
  pending: 'En attente', validated: 'Validée', preparation: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetMyOrders();
      setOrders(data);
    } catch (e) {
      setError('Impossible de charger vos commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-choco-light">
      <div className="text-amber-600 flex items-center gap-3">
        <RefreshCw className="animate-spin" size={24} />
        <span>Chargement...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-choco-light py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-choco-dark flex items-center gap-2">
            <ShoppingBag className="text-choco-accent" size={28} />
            Mes Commandes
          </h1>
          <button onClick={loadOrders} className="text-choco-accent hover:text-choco-dark p-2 rounded-lg hover:bg-choco-warm transition">
            <RefreshCw size={18} />
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-4 text-sm">{error}</div>}

        {orders.length === 0 ? (
          <div className="bg-choco-cream border border-choco-border rounded-2xl p-12 text-center">
            <Package size={56} className="mx-auto text-choco-border mb-4" />
            <h2 className="text-xl font-bold text-choco-dark/50 mb-2">Aucune commande</h2>
            <Link to="/" className="bg-choco-dark text-choco-light px-6 py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-choco-cream rounded-2xl border border-choco-border overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggle(order.id)}>
                    <div>
                      <p className="font-bold text-choco-dark">{order.order_number}</p>
                      <p className="text-xs text-choco-dark/40 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-choco-warm text-choco-dark/60'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span className="font-bold text-choco-dark">{parseFloat(order.total_amount).toFixed(2)} MAD</span>

                    {/* Bouton Facture — page dédiée */}
                    <button
                      onClick={() => navigate(`/facture/${order.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-choco-warm text-choco-accent hover:bg-choco-cream rounded-lg text-xs font-bold transition"
                      title="Voir la facture"
                    >
                      <FileText size={14} /> Facture
                    </button>

                    <div className="cursor-pointer" onClick={() => toggle(order.id)}>
                      {expanded === order.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </div>
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="border-t border-choco-border px-5 pb-5 pt-4 space-y-3">
                    {order.shipping_address && <p className="text-xs text-choco-dark/40">📍 {order.shipping_address}</p>}
                    {(order.items || []).length === 0 ? (
                      <p className="text-sm text-gray-400">Détails non disponibles</p>
                    ) : order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-choco-warm rounded-xl p-3">
                        <img src={item.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=80'}
                          alt={item.product_name} className="w-12 h-12 object-cover rounded-lg border border-choco-border" />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-choco-dark">{item.product_name}</p>
                          <p className="text-xs text-choco-dark/40">{item.brand}</p>
                          <p className="text-xs text-choco-dark/50 mt-0.5">{parseFloat(item.unit_price).toFixed(2)} MAD × {item.quantity}</p>
                        </div>
                        <p className="font-bold text-choco-dark text-sm">{parseFloat(item.total_price).toFixed(2)} MAD</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center border-t border-choco-border pt-3">
                      <span className="text-sm text-choco-dark/50">Total</span>
                      <span className="font-bold text-lg text-choco-dark">{parseFloat(order.total_amount).toFixed(2)} MAD</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}