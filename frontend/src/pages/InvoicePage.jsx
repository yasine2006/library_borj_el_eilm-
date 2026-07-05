import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Printer } from 'lucide-react';

const STATUS_LABELS = {
  pending: 'En attente', validated: 'Validée', preparation: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
};

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setOrder(data);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-amber-600">Chargement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!order) return null;

  const subtotal = parseFloat(order.total_amount || 0);
  const tva = subtotal * 0.20;
  const total = subtotal + tva;
  const items = order.items || [];

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .invoice-container { box-shadow: none !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print bg-gray-100 border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={18} /> Retour
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 transition">
            <Printer size={18} /> Imprimer / Sauvegarder PDF
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className="min-h-screen bg-gray-200 py-8 px-4">
        <div ref={printRef} className="invoice-container bg-white max-w-2xl mx-auto shadow-xl rounded-lg overflow-hidden">

          {/* Header */}
          <div style={{ background: '#92400e' }} className="px-8 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">FACTURE</h1>
                <p className="mt-1 opacity-80 text-sm">Borj El Eilm — Librairie Marocaine</p>
                <p className="opacity-70 text-xs">Khenifra, Maroc</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{order.order_number}</p>
                <p className="text-sm opacity-80 mt-1">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
                <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-white text-amber-800">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="px-8 py-5 bg-amber-50 border-b border-amber-100">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Facturé à</p>
            <p className="font-bold text-gray-800">{order.first_name} {order.last_name}</p>
            <p className="text-sm text-gray-600">{order.email}</p>
            {order.phone && <p className="text-sm text-gray-600">📞 {order.phone}</p>}
            {order.shipping_address && <p className="text-sm text-gray-600">📍 {order.shipping_address}</p>}
          </div>

          {/* Items table */}
          <div className="px-8 py-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#92400e' }} className="text-white">
                  <th className="text-left py-2 px-3 rounded-tl-lg">Produit</th>
                  <th className="text-center py-2 px-3">Qté</th>
                  <th className="text-right py-2 px-3">P.U. (MAD)</th>
                  <th className="text-right py-2 px-3 rounded-tr-lg">Total (MAD)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                    <td className="py-2.5 px-3">
                      <p className="font-medium">{item.product_name}</p>
                      {item.brand && <p className="text-xs text-gray-400">{item.brand}</p>}
                    </td>
                    <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{parseFloat(item.unit_price).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-6">
            <div className="ml-auto w-64 space-y-2 text-sm">
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium">{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TVA (20%)</span>
                <span className="font-medium">{tva.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between border-t pt-2" style={{ background: '#92400e', margin: '0 -8px', padding: '8px 12px', borderRadius: '8px', color: 'white' }}>
                <span className="font-bold text-base">TOTAL TTC</span>
                <span className="font-bold text-base">{total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t text-center">
            <p className="text-xs text-gray-400">Merci pour votre confiance — Borj El Eilm, Khenifra Maroc</p>
            <p className="text-xs text-gray-400 mt-1">Document généré automatiquement le {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </>
  );
}