import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, CheckCircle, Loader, Phone, MapPin, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiCreateOrder } from '../api';

export default function CartPage({ cart, setCart, userType }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
    }
  }, [user]);
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
    if (address.trim().length < 5) { setOrderError('Adresse de livraison obligatoire'); return; }
    if (!phone.trim()) { setOrderError('Numéro de téléphone obligatoire'); return; }
    setOrdering(true);
    setOrderError('');
    try {
      await apiCreateOrder({
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: [address, city].filter(Boolean).join(', '),
        contact_phone: phone,
        payment_method: paymentMethod,
        notes: notes || undefined,
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
      <div className="min-h-screen flex items-center justify-center bg-choco-light">
        <div className="text-center bg-choco-cream border border-choco-border p-10 rounded-2xl">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande passée avec succès!</h2>
          <p className="text-gray-500">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-choco-light">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto mb-4 text-choco-border" />
          <h2 className="text-2xl font-bold text-choco-dark/50 mb-2">Votre panier est vide</h2>
          <Link to="/" className="bg-choco-dark text-choco-light px-6 py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition">
            Continuer les achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-choco-light py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart size={28} /> Mon Panier ({cart.length} articles)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-choco-cream border border-choco-border p-4 rounded-xl flex gap-4">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=200'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-choco-dark/50">{item.category_name} | {item.brand}</p>
                  <p className="text-choco-dark font-bold text-lg mt-1">{getPrice(item).toFixed(2)} MAD</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 border border-choco-border rounded-lg hover:bg-choco-warm flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold w-8 text-center text-choco-dark">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 border border-choco-border rounded-lg hover:bg-choco-warm flex items-center justify-center">
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
            <div className="bg-choco-cream border border-choco-border p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-4 text-choco-dark">Résumé</h3>
              <div className="space-y-2 text-sm text-choco-dark/70">
                <div className="flex justify-between"><span>Sous-total</span><span>{total.toFixed(2)} MAD</span></div>
                <div className="flex justify-between"><span>Livraison</span><span className="text-green-600">Gratuite</span></div>
                <div className="border-t border-choco-border pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span><span className="text-choco-dark">{total.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Infos livraison + paiement */}
            {user && (
              <div className="bg-choco-warm border border-choco-border rounded-xl p-4 space-y-3">
                <p className="font-bold text-choco-dark text-sm">📦 Informations de livraison</p>
                <div>
                  <label className="text-xs text-choco-dark/50 font-medium block mb-1">Téléphone *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-accent" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 XX XX XX XX"
                      className="w-full pl-9 pr-3 py-2 bg-choco-cream border border-choco-border rounded-lg text-sm text-choco-dark focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-choco-dark/50 font-medium block mb-1">Adresse *</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Adresse, quartier, rue..."
                    className="w-full px-3 py-2 bg-choco-cream border border-choco-border rounded-lg text-sm text-choco-dark focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                </div>
                <div>
                  <label className="text-xs text-choco-dark/50 font-medium block mb-1">Ville</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ville"
                    className="w-full px-3 py-2 bg-choco-cream border border-choco-border rounded-lg text-sm text-choco-dark focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                </div>
                <div>
                  <label className="text-xs text-choco-dark/50 font-medium block mb-1">Mode de paiement</label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${paymentMethod === 'cash_on_delivery' ? 'border-choco-accent bg-choco-cream' : 'border-choco-border'}`}>
                      <input type="radio" name="pay" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={e => setPaymentMethod(e.target.value)} />
                      💵 Paiement à la livraison
                    </label>
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${paymentMethod === 'bank_transfer' ? 'border-choco-accent bg-choco-cream' : 'border-choco-border'}`}>
                      <input type="radio" name="pay" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={e => setPaymentMethod(e.target.value)} />
                      🏦 Virement bancaire
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-choco-dark/50 font-medium block mb-1">Note (optionnel)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Instructions de livraison..."
                    className="w-full px-3 py-2 bg-choco-cream border border-choco-border rounded-lg text-sm text-choco-dark resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
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
                className="w-full bg-choco-dark text-choco-light py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {ordering
                  ? <><Loader size={18} className="animate-spin" /> En cours...</>
                  : <><ArrowRight size={20} /> Passer la Commande</>
                }
              </button>
            ) : (
              <Link to="/login" className="block w-full bg-choco-dark text-choco-light py-3 rounded-xl font-bold hover:bg-choco-dark/80 transition text-center">
                Se connecter pour commander
              </Link>
            )}

            <Link to="/" className="block text-center text-sm text-choco-dark/40 hover:text-choco-accent">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}