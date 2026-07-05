import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, CheckCircle, Loader, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCreateOrder } from '../api';

export default function CartPage({ cart, setCart, userType }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const getPrice = (item) => {
    if (userType === 'wholesale') return parseFloat(item.price_wholesale || 0);
    return parseFloat(item.price_retail || 0);
  };

  const total = cart.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setOrdering(true);
    setOrderError('');
    try {
      const shippingAddress = [user.address, user.city].filter(Boolean).join(', ') || 'Maroc';
      await apiCreateOrder({
        user_id: user.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: getPrice(item)
        })),
        total_amount: total,
        shipping_address: shippingAddress,
      });
      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setOrderError(err.message || 'Erreur lors de la commande');
    } finally {
      setOrdering(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande passée avec succès!</h2>
          <p className="text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Votre panier est vide</h2>
          <Link to="/" className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition">
            Continuer les achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart size={28} /> Mon Panier ({cart.length} articles)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=200'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.category_name} | {item.brand}</p>
                  <p className="text-amber-700 font-bold text-lg mt-1">{getPrice(item).toFixed(2)} MAD</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 border rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 border rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="ml-auto text-red-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-red-500 text-sm hover:underline">Vider le panier</button>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-4">Résumé</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Sous-total</span><span>{total.toFixed(2)} MAD</span></div>
                <div className="flex justify-between"><span>Livraison</span><span className="text-green-600">Gratuite</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span><span className="text-amber-700">{total.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Infos livraison automatiques */}
            {user && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                <p className="font-bold text-amber-900 text-sm mb-2">📦 Informations de livraison</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-amber-600 shrink-0" />
                  <span>{user.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-amber-600 shrink-0" />
                  <span>{[user.address, user.city].filter(Boolean).join(', ') || 'Non renseignée'}</span>
                </div>
              </div>
            )}

            {orderError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {orderError}
              </div>
            )}

            {user ? (
              <button
                onClick={handleOrder}
                disabled={ordering}
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {ordering
                  ? <><Loader size={18} className="animate-spin" /> En cours...</>
                  : <><ArrowRight size={20} /> Passer la Commande</>
                }
              </button>
            ) : (
              <Link to="/login" className="block w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition text-center">
                Se connecter pour commander
              </Link>
            )}

            <Link to="/" className="block text-center text-sm text-gray-400 hover:text-amber-600">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}