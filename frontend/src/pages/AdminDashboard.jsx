import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, AlertTriangle,
  DollarSign, XCircle, LogOut, Plus, Edit, Trash2, Search,
  ChevronLeft, ChevronRight, X, RefreshCw, CheckCircle, Loader,
  Tag, Truck, UserPlus, ClipboardList, ArrowDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetOrders, apiUpdateOrderStatus,
  apiGetUsers, apiDeleteUser, apiCreateAdmin,
  apiGetStats,
  apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory,
  apiGetSuppliers, apiCreateSupplier, apiUpdateSupplier, apiDeleteSupplier, apiGetSupplierDetails,
  apiGetPurchaseOrders, apiCreatePurchaseOrder, apiUpdatePurchaseOrderStatus, apiDeletePurchaseOrder
} from '../api';

// =============================================
// STATUS CONFIG
// =============================================
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

// =============================================
// EMPTY PRODUCT FORM
// =============================================
const EMPTY_FORM = {
  name: '', description: '', category_id: '', supplier_id: '',
  barcode: '', price_retail: '', price_wholesale: '',
  stock: '', min_stock: 5, brand: '', image_url: '', is_active: true
};

// =============================================
// SPINNER
// =============================================
const Spinner = () => (
  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
);

// =============================================
// MAIN COMPONENT
// =============================================
export default function AdminDashboard() {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Kayqra tab mn URL wqt kayji mn notification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Listen for admin-tab event (wqt user déjà f /admin)
  useEffect(() => {
    const handler = (e) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('admin-tab', handler);
    return () => window.removeEventListener('admin-tab', handler);
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ---- DATA STATE ----
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // ---- UI STATE ----
  const [loading, setLoading] = useState({ stats: false, products: false, orders: false, users: false });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ---- PRODUCT MODAL ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // ---- SEARCH ----
  const [productSearch, setProductSearch] = useState('');

  // ---- CATEGORIES ----
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '' });

  // ---- SUPPLIERS ----
  const [suppliers, setSuppliers] = useState([]);
  const [supModal, setSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState(null);
  const [supForm, setSupForm] = useState({ name: '', phone: '', email: '', address: '', city: '', product_types: [] });
  const [tagInput, setTagInput] = useState('');
  const [supDetail, setSupDetail] = useState(null);
  const [supDetailLoading, setSupDetailLoading] = useState(false);

  // ---- CREATE ADMIN ----
  const [adminModal, setAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  // ---- ORDER DETAIL MODAL ----
  const [orderDetail, setOrderDetail] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // ---- PURCHASE ORDERS ----
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poLoading, setPoLoading] = useState(false);
  const [poModal, setPoModal] = useState(false);
  const [poDetail, setPoDetail] = useState(null);
  const [poDetailLoading, setPoDetailLoading] = useState(false);
  const [poForm, setPoForm] = useState({ supplier_id: '', notes: '', items: [] });
  const [poFormLoading, setPoFormLoading] = useState(false);

  // =============================================
  // LOADERS
  // =============================================
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const loadStats = useCallback(async () => {
    setLoading(l => ({ ...l, stats: true }));
    try {
      const data = await apiGetStats();
      setStats(data);
    } catch { setError('Impossible de charger les statistiques'); }
    finally { setLoading(l => ({ ...l, stats: false })); }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(l => ({ ...l, products: true }));
    try {
      const data = await apiGetProducts();
      setProducts(data);
    } catch { setError('Impossible de charger les produits'); }
    finally { setLoading(l => ({ ...l, products: false })); }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(l => ({ ...l, orders: true }));
    try {
      const data = await apiGetOrders();
      setOrders(data);
    } catch { setError('Impossible de charger les commandes'); }
    finally { setLoading(l => ({ ...l, orders: false })); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(l => ({ ...l, users: true }));
    try {
      const data = await apiGetUsers();
      setUsers(data);
    } catch { setError('Impossible de charger les utilisateurs'); }
    finally { setLoading(l => ({ ...l, users: false })); }
  }, []);

  // Load data on tab change
  useEffect(() => {
    setError(null);
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'products') { loadProducts(); loadCategories(); loadSuppliers(); }
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'users' && isSuperAdmin()) loadUsers();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'suppliers') loadSuppliers();
    if (activeTab === 'purchase-orders') { loadPurchaseOrders(); loadSuppliers(); loadProducts(); }
  }, [activeTab]);

  const loadCategories = async () => {
    try { const d = await apiGetCategories(); setCategories(d); } catch {}
  };
  const loadSuppliers = async () => {
    try { const d = await apiGetSuppliers(); setSuppliers(d); } catch {}
  };

  const loadPurchaseOrders = async () => {
    setPoLoading(true);
    try { const d = await apiGetPurchaseOrders(); setPurchaseOrders(d); }
    catch (e) { setError('Erreur chargement bons: ' + e.message); }
    finally { setPoLoading(false); }
  };

  const loadPurchaseOrderDetail = async (id) => {
    setPoDetailLoading(true);
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setPoDetail(data);
    } catch (e) { setError('Erreur: ' + e.message); }
    finally { setPoDetailLoading(false); }
  };

  const loadSupplierDetail = async (id) => {
    setSupDetailLoading(true);
    try {
      const data = await apiGetSupplierDetails(id);
      setSupDetail(data);
    } catch (e) { setError('Erreur: ' + e.message); }
    finally { setSupDetailLoading(false); }
  };

  const loadOrderDetail = async (orderId) => {
    setOrderDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setOrderDetail(data);
    } catch (e) { 
      setError('Erreur chargement détails: ' + e.message); 
    }
    finally { setOrderDetailLoading(false); }
  };

  // =============================================
  // PRODUCT CRUD
  // =============================================
  const openModal = (product = null) => {
    setFormError('');
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        barcode: product.barcode || '',
        price_retail: product.price_retail || '',
        price_wholesale: product.price_wholesale || '',
        stock: product.stock || '',
        min_stock: product.min_stock || 5,
        brand: product.brand || '',
        image_url: product.image_url || '',
        is_active: product.is_active !== false
      });
    } else {
      setEditingProduct(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (editingProduct) {
        await apiUpdateProduct(editingProduct.id, formData);
        showSuccess('Produit modifié avec succès ✓');
      } else {
        await apiCreateProduct(formData);
        showSuccess('Produit ajouté avec succès ✓');
      }
      closeModal();
      loadProducts();
    } catch (err) {
      setFormError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Supprimer le produit "${name}" ?`)) return;
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccess('Produit supprimé ✓');
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // =============================================
  // ORDER STATUS UPDATE
  // =============================================
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await apiUpdateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showSuccess('Statut mis à jour ✓');
    } catch (err) {
      setError(err.message);
    }
  };

  // =============================================
  // USER DELETE
  // =============================================
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Supprimer l'utilisateur "${name}" ?`)) return;
    try {
      await apiDeleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showSuccess('Utilisateur supprimé ✓');
    } catch (err) {
      setError(err.message);
    }
  };

  // =============================================
  // FILTERED PRODUCTS
  // =============================================
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.barcode?.includes(productSearch)
  );

  // =============================================
  // RENDER TABS
  // =============================================
  const renderContent = () => {
    switch (activeTab) {

      // ─── DASHBOARD ───────────────────────────────────
      case 'dashboard':
        return (
          <div className="space-y-6">
            {loading.stats ? (
              <div className="flex items-center justify-center py-20 text-amber-600">
                <Spinner /> <span className="ml-3">Chargement...</span>
              </div>
            ) : stats ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Produits', value: stats.totalProducts, icon: Package, bg: 'bg-amber-50', color: 'text-amber-600' },
                    { label: 'Commandes', value: stats.totalOrders, icon: ShoppingCart, bg: 'bg-green-50', color: 'text-green-600' },
                    { label: 'Clients', value: stats.totalUsers, icon: Users, bg: 'bg-purple-50', color: 'text-purple-600' },
                    { label: 'Revenus', value: `${parseFloat(stats.totalRevenue||0).toLocaleString('fr-FR')} MAD`, icon: DollarSign, bg: 'bg-blue-50', color: 'text-blue-600' },
                  ].map(({ label, value, icon: Icon, bg, color }) => (
                    <div key={label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
                        </div>
                        <div className={`${bg} p-3 rounded-xl`}>
                          <Icon className={color} size={22} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                  {/* Ventes par mois — bar chart SVG */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4">📈 Ventes par mois (MAD)</h3>
                    {(() => {
                      const data = stats.salesByMonth || [];
                      if (data.length === 0) return (
                        <div className="flex items-center justify-center h-40 text-gray-300 text-sm">Aucune vente pour l'instant</div>
                      );
                      const revenues = data.map(d => Number(d.revenue) || 0);
                      const maxRev = Math.max(...revenues, 1);
                      const MAX_PX = 130;
                      return (
                        <div className="mt-6 px-2">
                          <div className="flex items-end gap-3" style={{ height: MAX_PX + 'px' }}>
                          {data.map((d, i) => {
                            const rev = revenues[i];
                            const barH = rev > 0 ? Math.max((rev / maxRev) * MAX_PX, 12) : 4;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-end group relative" style={{ height: MAX_PX + 'px', justifyContent: 'flex-end' }}>
                                <span className="text-xs font-bold text-amber-600 mb-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                  {rev.toLocaleString('fr-FR')} MAD
                                </span>
                                <div
                                  className={`w-full rounded-t-lg ${rev > 0 ? 'bg-amber-400 hover:bg-amber-500' : 'bg-gray-100'}`}
                                  style={{ height: barH + 'px' }}
                                />
                              </div>
                            );
                          })}
                          </div>
                          <div className="flex gap-3 mt-2 px-0">
                            {data.map((d, i) => (
                              <div key={i} className="flex-1 text-center">
                                <span className="text-xs text-gray-400">{d.month ? d.month.split(' ')[0] : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Stock status — donut */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4">📦 État du Stock</h3>
                    {(() => {
                      const normal = stats.normalStock || 0;
                      const low = stats.lowStock || 0;
                      const out = stats.outOfStock || 0;
                      const total = normal + low + out || 1;
                      const items = [
                        { label: 'Normal', count: normal, color: 'bg-green-400' },
                        { label: 'Faible', count: low, color: 'bg-orange-400' },
                        { label: 'Rupture', count: out, color: 'bg-red-400' },
                      ];
                      return (
                        <div className="space-y-3 mt-2">
                          {items.map(item => (
                            <div key={item.label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-bold">{item.count}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className={`${item.color} h-2.5 rounded-full transition-all`}
                                  style={{ width: `${(item.count / total) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                          <div className="mt-4 pt-3 border-t">
                            {out > 0 && (
                              <div className="flex items-center gap-2 text-red-600 text-xs">
                                <XCircle size={14} /> {out} produit(s) en rupture
                              </div>
                            )}
                            {low > 0 && (
                              <div className="flex items-center gap-2 text-orange-600 text-xs mt-1">
                                <AlertTriangle size={14} /> {low} produit(s) stock faible
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Top produits + Commandes par statut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                  {/* Top 5 produits */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4">🏆 Top 5 Produits Vendus</h3>
                    {(!stats.topProducts || stats.topProducts.length === 0) ? (
                      <div className="text-gray-300 text-sm text-center py-6">Aucune vente livrée</div>
                    ) : (
                      <div className="space-y-3">
                        {stats.topProducts.map((p, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-gray-100 text-gray-600' :
                              i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                            }`}>{i + 1}</span>
                            <img src={p.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=60'}
                              alt={p.name} className="w-9 h-9 object-cover rounded-lg border border-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.total_sold} vendus</p>
                            </div>
                            <span className="font-bold text-amber-700 text-sm whitespace-nowrap">
                              {parseFloat(p.total_revenue).toLocaleString('fr-FR')} MAD
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Commandes par statut */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4">📋 Commandes par Statut</h3>
                    {(!stats.ordersByStatus || stats.ordersByStatus.length === 0) ? (
                      <div className="text-gray-300 text-sm text-center py-6">Aucune commande</div>
                    ) : (() => {
                      const STATUS_COLORS_BG = {
                        pending: 'bg-yellow-100 text-yellow-700',
                        validated: 'bg-blue-100 text-blue-700',
                        preparation: 'bg-purple-100 text-purple-700',
                        shipped: 'bg-indigo-100 text-indigo-700',
                        delivered: 'bg-green-100 text-green-700',
                        cancelled: 'bg-red-100 text-red-700'
                      };
                      const STATUS_LBL = {
                        pending: 'En attente', validated: 'Validée', preparation: 'Préparation',
                        shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
                      };
                      const total = stats.ordersByStatus.reduce((s, r) => s + parseInt(r.count), 0);
                      return (
                        <div className="space-y-2">
                          {stats.ordersByStatus.map(row => (
                            <div key={row.status} className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[90px] text-center ${STATUS_COLORS_BG[row.status] || 'bg-gray-100 text-gray-600'}`}>
                                {STATUS_LBL[row.status] || row.status}
                              </span>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${(parseInt(row.count) / total) * 100}%` }} />
                              </div>
                              <span className="font-bold text-sm w-6 text-right">{row.count}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>Impossible de charger les statistiques.</p>
                <button onClick={loadStats} className="mt-3 flex items-center gap-2 mx-auto text-amber-600 hover:underline">
                  <RefreshCw size={16} /> Réessayer
                </button>
              </div>
            )}
          </div>
        );

      // ─── PRODUCTS ────────────────────────────────────
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Gestion des Produits</h2>
              <button onClick={() => openModal()} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition shadow-sm">
                <Plus size={18} /> Ajouter Produit
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="p-4 border-b border-amber-100 flex items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, marque, code barre..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button onClick={loadProducts} className="text-amber-600 hover:text-amber-800 transition p-2 rounded-lg hover:bg-amber-50">
                  <RefreshCw size={18} className={loading.products ? 'animate-spin' : ''} />
                </button>
              </div>

              {loading.products ? (
                <div className="text-center py-16 text-amber-600">
                  <Spinner /> <span className="ml-3">Chargement...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-50">
                      <tr>
                        {['Produit', 'Prix Détail', 'Prix Gros', 'Stock', 'Statut', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun produit trouvé</td></tr>
                      ) : filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-amber-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=100'}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                              />
                              <div>
                                <p className="font-bold text-gray-800 max-w-[180px] truncate">{p.name}</p>
                                <p className="text-xs text-amber-600">{p.brand || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold">{parseFloat(p.price_retail || 0).toFixed(2)} MAD</td>
                          <td className="px-6 py-4 text-gray-500">{parseFloat(p.price_wholesale || 0).toFixed(2)} MAD</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              p.stock === 0 ? 'bg-red-100 text-red-600' :
                              p.stock <= (p.min_stock || 5) ? 'bg-orange-100 text-orange-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {p.stock} / {p.min_stock || 5}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                              {p.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => openModal(p)} title="Modifier" className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition">
                                <Edit size={16} />
                              </button>
                              {isSuperAdmin() && (
                                <button onClick={() => handleDeleteProduct(p.id, p.name)} title="Supprimer" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── PRODUCT MODAL ── */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && closeModal()}>
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-amber-900">
                      {editingProduct ? '✏️ Modifier le Produit' : '➕ Ajouter un Produit'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{formError}</div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code Barre</label>
                        <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                        <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none">
                          <option value="">-- Sans catégorie --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                        <select value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none">
                          <option value="">-- Sans fournisseur --</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix Détail (MAD) *</label>
                        <input type="number" step="0.01" min="0" value={formData.price_retail} onChange={e => setFormData({...formData, price_retail: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix Gros (MAD) *</label>
                        <input type="number" step="0.01" min="0" value={formData.price_wholesale} onChange={e => setFormData({...formData, price_wholesale: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actuel *</label>
                        <input type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Minimum *</label>
                        <input type="number" min="0" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" required />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Image</label>
                        <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})}
                          placeholder="https://..."
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none" />
                      </div>
                      {editingProduct && (
                        <div className="col-span-2 flex items-center gap-3">
                          <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 accent-amber-600" />
                          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Produit actif</label>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t">
                      <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
                        Annuler
                      </button>
                      <button type="submit" disabled={formLoading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold shadow-sm flex items-center gap-2 disabled:opacity-60">
                        {formLoading && <Spinner />}
                        {editingProduct ? 'Enregistrer' : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      // ─── ORDERS ──────────────────────────────────────
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Gestion des Commandes</h2>
              <button onClick={loadOrders} className="text-amber-600 hover:text-amber-800 p-2 rounded-lg hover:bg-amber-50 transition">
                <RefreshCw size={18} className={loading.orders ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-amber-100">
              {loading.orders ? (
                <div className="text-center py-16 text-amber-600"><Spinner /> <span className="ml-3">Chargement...</span></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-50">
                      <tr>
                        {['N° Commande', 'Client', 'Téléphone', 'Articles', 'Total', 'Statut', 'Date', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {orders.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-12 text-gray-400">Aucune commande</td></tr>
                      ) : orders.map(order => (
                        <tr key={order.id} className="hover:bg-amber-50 transition">
                          <td className="px-6 py-4 font-medium">
                            <p>{order.order_number}</p>
                            <p className="text-xs text-gray-400">{order.user_type === 'wholesale' ? '🏢 Grossiste' : '👤 Détail'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{order.first_name} {order.last_name}</p>
                            <p className="text-xs text-gray-400">{order.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">{order.phone || '—'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">{order.items_count || 0} art.</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-amber-700">{parseFloat(order.total_amount || 0).toFixed(2)} MAD</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button 
                                onClick={() => loadOrderDetail(order.id)}
                                disabled={orderDetailLoading}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition flex items-center gap-1 disabled:opacity-50">
                                {orderDetailLoading ? <Spinner /> : '👁'} Détails
                              </button>
                              {order.status === 'pending' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'validated')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition">
                                  Valider
                                </button>
                              )}
                              {order.status === 'validated' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'preparation')}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition">
                                  Préparer
                                </button>
                              )}
                              {order.status === 'preparation' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition">
                                  Expédier
                                </button>
                              )}
                              {order.status === 'shipped' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition">
                                  Livrer
                                </button>
                              )}
                              {!['delivered', 'cancelled'].includes(order.status) && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition">
                                  Annuler
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      // ─── USERS ───────────────────────────────────────
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Gestion des Utilisateurs</h2>
              <button onClick={loadUsers} className="text-amber-600 hover:text-amber-800 p-2 rounded-lg hover:bg-amber-50 transition">
                <RefreshCw size={18} className={loading.users ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-amber-100">
              {loading.users ? (
                <div className="text-center py-16 text-amber-600"><Spinner /> <span className="ml-3">Chargement...</span></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-50">
                      <tr>
                        {['Utilisateur', 'Téléphone', 'Rôle', 'Type', 'Statut', 'Inscription', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {users.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun utilisateur</td></tr>
                      ) : users.map(u => (
                        <tr key={u.id} className="hover:bg-amber-50 transition">
                          <td className="px-6 py-4">
                            <p className="font-bold">{u.first_name} {u.last_name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm">{u.phone || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              u.role_id === 1 ? 'bg-red-100 text-red-600' :
                              u.role_id === 2 ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {u.role_id === 1 ? 'Super Admin' : u.role_id === 2 ? 'Admin' : 'Client'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.user_type === 'wholesale' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-600'}`}>
                              {u.user_type === 'wholesale' ? 'Grossiste' : 'Détail'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                              {u.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {new Date(u.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                            {u.id !== user?.id && (
                              <button onClick={() => handleDeleteUser(u.id, `${u.first_name} ${u.last_name}`)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );


      // ─── CATEGORIES ──────────────────────────────────
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Gestion des Catégories</h2>
              <button onClick={() => { setEditingCat(null); setCatForm({ name:'', description:'', icon:'' }); setCatModal(true); }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition shadow-sm">
                <Plus size={18} /> Ajouter Catégorie
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-amber-50">
                  <tr>{['Icône', 'Nom', 'Description', 'Produits', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {categories.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">Aucune catégorie</td></tr>
                  ) : categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-amber-50 transition">
                      <td className="px-6 py-4 text-2xl">{cat.icon || '📦'}</td>
                      <td className="px-6 py-4 font-bold">{cat.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">{cat.products_count || 0} produits</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, description: cat.description||'', icon: cat.icon||'' }); setCatModal(true); }}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"><Edit size={16} /></button>
                          <button onClick={async () => {
                            if (!window.confirm(`Supprimer "${cat.name}" ?`)) return;
                            try { await apiDeleteCategory(cat.id); loadCategories(); showSuccess('Catégorie supprimée ✓'); }
                            catch (e) { setError(e.message); }
                          }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Category Modal */}
            {catModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setCatModal(false)}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-amber-900">{editingCat ? '✏️ Modifier' : '➕ Ajouter'} Catégorie</h3>
                    <button onClick={() => setCatModal(false)}><X size={22} className="text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icône (emoji)</label>
                      <input value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})}
                        placeholder="📚" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea rows={2} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => setCatModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button onClick={async () => {
                        try {
                          if (editingCat) { await apiUpdateCategory(editingCat.id, catForm); showSuccess('Catégorie modifiée ✓'); }
                          else { await apiCreateCategory(catForm); showSuccess('Catégorie ajoutée ✓'); }
                          setCatModal(false); loadCategories();
                        } catch (e) { setError(e.message); }
                      }} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700">
                        {editingCat ? 'Enregistrer' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // ─── SUPPLIERS ───────────────────────────────────
      case 'suppliers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Gestion des Fournisseurs</h2>
              <button onClick={() => { setEditingSup(null); setSupForm({ name:'', phone:'', email:'', address:'', city:'', product_types:[] }); setTagInput(''); setSupModal(true); }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition shadow-sm">
                <Plus size={18} /> Ajouter Fournisseur
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-amber-50">
                  <tr>{['Nom', 'Téléphone', 'Email', 'Types', 'Ville', 'Produits', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {suppliers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun fournisseur</td></tr>
                  ) : suppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-amber-50 transition">
                      <td className="px-6 py-4 font-bold">{sup.name}</td>
                      <td className="px-6 py-4 text-sm">{sup.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{sup.email || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(sup.product_types || []).length === 0 ? <span className="text-gray-400 text-xs">—</span>
                          : (sup.product_types || []).map(t => (
                            <span key={t} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{sup.city || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">{sup.products_count || 0} produits</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => loadSupplierDetail(sup.id)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Détails"><Search size={16} /></button>
                          <button onClick={() => { setEditingSup(sup); setSupForm({ name: sup.name, phone: sup.phone||'', email: sup.email||'', address: sup.address||'', city: sup.city||'', product_types: sup.product_types||[] }); setTagInput(''); setSupModal(true); }}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition"><Edit size={16} /></button>
                          <button onClick={async () => {
                            if (!window.confirm(`Supprimer "${sup.name}" ?`)) return;
                            try { await apiDeleteSupplier(sup.id); loadSuppliers(); showSuccess('Fournisseur supprimé ✓'); }
                            catch (e) { setError(e.message); }
                          }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Add Admin button */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 flex items-center gap-2"><UserPlus size={18} className="text-amber-600" /> Ajouter un Administrateur</p>
                <p className="text-sm text-gray-400 mt-0.5">Créer un nouveau compte Admin (role 2)</p>
              </div>
              <button onClick={() => { setAdminForm({ first_name:'', last_name:'', email:'', phone:'', password:'' }); setAdminModal(true); }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 transition flex items-center gap-2">
                <UserPlus size={18} /> Ajouter Admin
              </button>
            </div>
            {/* Supplier Modal */}
            {supModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setSupModal(false)}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-amber-900">{editingSup ? '✏️ Modifier' : '➕ Ajouter'} Fournisseur</h3>
                    <button onClick={() => setSupModal(false)}><X size={22} className="text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Nom *', key: 'name', type: 'text', required: true },
                      { label: 'Téléphone', key: 'phone', type: 'tel' },
                      { label: 'Email', key: 'email', type: 'email' },
                      { label: 'Adresse', key: 'address', type: 'text' },
                      { label: 'Ville', key: 'city', type: 'text' },
                    ].map(({ label, key, type, required }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input type={type} value={supForm[key]} onChange={e => setSupForm({...supForm, [key]: e.target.value})}
                          required={required} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                      </div>
                    ))}
                    {/* Tags produits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Types de produits</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                              e.preventDefault();
                              if (!supForm.product_types.includes(tagInput.trim())) {
                                setSupForm({...supForm, product_types: [...supForm.product_types, tagInput.trim()]});
                              }
                              setTagInput('');
                            }
                          }}
                          placeholder="Ex: Cahiers, Stylos... (Entrée pour ajouter)"
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                        />
                        <button type="button" onClick={() => {
                          if (tagInput.trim() && !supForm.product_types.includes(tagInput.trim())) {
                            setSupForm({...supForm, product_types: [...supForm.product_types, tagInput.trim()]});
                          }
                          setTagInput('');
                        }} className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-200">+</button>
                      </div>
                      <div className="flex flex-wrap gap-1 min-h-[28px]">
                        {supForm.product_types.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                            {tag}
                            <button onClick={() => setSupForm({...supForm, product_types: supForm.product_types.filter(t => t !== tag)})}
                              className="hover:text-red-500 ml-0.5">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => setSupModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button onClick={async () => {
                        try {
                          if (editingSup) { await apiUpdateSupplier(editingSup.id, supForm); showSuccess('Fournisseur modifié ✓'); }
                          else { await apiCreateSupplier(supForm); showSuccess('Fournisseur ajouté ✓'); }
                          setSupModal(false); loadSuppliers();
                        } catch (e) { setError(e.message); }
                      }} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700">
                        {editingSup ? 'Enregistrer' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Admin Modal */}
            {adminModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setAdminModal(false)}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-amber-900">➕ Ajouter un Admin</h3>
                    <button onClick={() => setAdminModal(false)}><X size={22} className="text-gray-400" /></button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Prénom *', key: 'first_name' },
                      { label: 'Nom *', key: 'last_name' },
                      { label: 'Email *', key: 'email', type: 'email' },
                      { label: 'Téléphone', key: 'phone', type: 'tel' },
                      { label: 'Mot de passe *', key: 'password', type: 'password' },
                    ].map(({ label, key, type='text' }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input type={type} value={adminForm[key]} onChange={e => setAdminForm({...adminForm, [key]: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none" />
                      </div>
                    ))}
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => setAdminModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button onClick={async () => {
                        setAdminLoading(true);
                        try { await apiCreateAdmin(adminForm); showSuccess('Admin créé avec succès ✓'); setAdminModal(false); }
                        catch (e) { setError(e.message); }
                        finally { setAdminLoading(false); }
                      }} disabled={adminLoading} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 flex items-center gap-2 disabled:opacity-60">
                        {adminLoading ? <><Spinner /> Création...</> : 'Créer Admin'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // ─── BONS DE COMMANDE ─────────────────────────
      case 'purchase-orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-900">Bons de Commande Fournisseur</h2>
              <button onClick={() => { setPoForm({ supplier_id: '', notes: '', items: [] }); setPoModal(true); }}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition shadow-sm">
                <Plus size={18} /> Nouveau Bon
              </button>
            </div>

            {poLoading ? (
              <div className="flex justify-center py-12 text-amber-600"><Spinner /></div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-amber-50">
                    <tr>{['N° Bon', 'Fournisseur', 'Articles', 'Coût Total', 'Statut', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-amber-800 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {purchaseOrders.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun bon de commande</td></tr>
                    ) : purchaseOrders.map(po => (
                      <tr key={po.id} className="hover:bg-amber-50 transition">
                        <td className="px-5 py-4 font-bold text-amber-800">#{po.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{po.supplier_name}</p>
                          <p className="text-xs text-gray-400">{po.supplier_phone || ''}</p>
                        </td>
                        <td className="px-5 py-4 text-sm">{po.items_count} article{po.items_count !== 1 ? 's' : ''}</td>
                        <td className="px-5 py-4 font-bold text-amber-700">{po.total_cost.toFixed(2)} MAD</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            po.status === 'received' ? 'bg-green-100 text-green-700' :
                            po.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {po.status === 'received' ? '✅ Reçu' : po.status === 'cancelled' ? '❌ Annulé' : '⏳ En attente'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(po.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => loadPurchaseOrderDetail(po.id)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Voir détails">
                              <Search size={15} />
                            </button>
                            {po.status === 'pending' && (
                              <>
                                <button onClick={async () => {
                                  if (!window.confirm('Marquer comme REÇU ? Le stock sera mis à jour automatiquement.')) return;
                                  try {
                                    await apiUpdatePurchaseOrderStatus(po.id, 'received');
                                    showSuccess('Stock mis à jour ✓');
                                    loadPurchaseOrders();
                                  } catch(e) { setError(e.message); }
                                }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Marquer reçu">
                                  <CheckCircle size={15} />
                                </button>
                                <button onClick={async () => {
                                  if (!window.confirm('Annuler ce bon de commande ?')) return;
                                  try {
                                    await apiUpdatePurchaseOrderStatus(po.id, 'cancelled');
                                    showSuccess('Bon annulé ✓');
                                    loadPurchaseOrders();
                                  } catch(e) { setError(e.message); }
                                }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Annuler">
                                  <XCircle size={15} />
                                </button>
                                {isSuperAdmin() && (
                                  <button onClick={async () => {
                                    if (!window.confirm('Supprimer ce bon ?')) return;
                                    try {
                                      await apiDeletePurchaseOrder(po.id);
                                      showSuccess('Bon supprimé ✓');
                                      loadPurchaseOrders();
                                    } catch(e) { setError(e.message); }
                                  }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Nouveau Bon Modal */}
            {poModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setPoModal(false)}>
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-amber-900">📋 Nouveau Bon de Commande</h3>
                    <button onClick={() => setPoModal(false)}><X size={22} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Fournisseur */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur *</label>
                      <select value={poForm.supplier_id} onChange={e => setPoForm({...poForm, supplier_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none">
                        <option value="">-- Choisir un fournisseur --</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} {s.city ? `(${s.city})` : ''}</option>)}
                      </select>
                    </div>
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea value={poForm.notes} onChange={e => setPoForm({...poForm, notes: e.target.value})}
                        rows={2} placeholder="Notes ou instructions..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none text-sm" />
                    </div>
                    {/* Produits */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Produits à commander</label>
                        <button type="button" onClick={() => setPoForm({...poForm, items: [...poForm.items, { product_id: '', quantity_ordered: 1, unit_cost: 0 }]})}
                          className="text-amber-600 hover:text-amber-800 text-sm font-bold flex items-center gap-1">
                          <Plus size={14} /> Ajouter produit
                        </button>
                      </div>
                      {poForm.items.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                          Cliquez "+ Ajouter produit" pour commencer
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {poForm.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded-xl p-3">
                              <select value={item.product_id}
                                onChange={e => {
                                  const updated = [...poForm.items];
                                  updated[idx] = {...updated[idx], product_id: e.target.value};
                                  setPoForm({...poForm, items: updated});
                                }}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none">
                                <option value="">-- Produit --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>)}
                              </select>
                              <div className="flex flex-col items-center">
                                <label className="text-xs text-gray-400 mb-0.5">Qté</label>
                                <input type="number" min="1" value={item.quantity_ordered}
                                  onChange={e => {
                                    const updated = [...poForm.items];
                                    updated[idx] = {...updated[idx], quantity_ordered: parseInt(e.target.value) || 1};
                                    setPoForm({...poForm, items: updated});
                                  }}
                                  className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:border-amber-500 focus:outline-none" />
                              </div>
                              <div className="flex flex-col items-center">
                                <label className="text-xs text-gray-400 mb-0.5">Coût/u</label>
                                <input type="number" min="0" step="0.01" value={item.unit_cost}
                                  onChange={e => {
                                    const updated = [...poForm.items];
                                    updated[idx] = {...updated[idx], unit_cost: parseFloat(e.target.value) || 0};
                                    setPoForm({...poForm, items: updated});
                                  }}
                                  className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:border-amber-500 focus:outline-none" />
                              </div>
                              <button onClick={() => setPoForm({...poForm, items: poForm.items.filter((_, i) => i !== idx)})}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X size={15} /></button>
                            </div>
                          ))}
                          {/* Total */}
                          <div className="flex justify-end pt-1">
                            <span className="text-sm font-bold text-amber-700">
                              Total: {poForm.items.reduce((sum, i) => sum + (i.quantity_ordered * i.unit_cost), 0).toFixed(2)} MAD
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 justify-end pt-2 border-t">
                      <button onClick={() => setPoModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                      <button onClick={async () => {
                        if (!poForm.supplier_id) return setError('Choisissez un fournisseur');
                        if (poForm.items.length === 0) return setError('Ajoutez au moins un produit');
                        if (poForm.items.some(i => !i.product_id)) return setError('Choisissez un produit pour chaque ligne');
                        setPoFormLoading(true);
                        try {
                          await apiCreatePurchaseOrder(poForm);
                          showSuccess('Bon de commande créé ✓');
                          setPoModal(false);
                          loadPurchaseOrders();
                        } catch (e) { setError(e.message); }
                        finally { setPoFormLoading(false); }
                      }} disabled={poFormLoading}
                        className="px-5 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 flex items-center gap-2 disabled:opacity-60">
                        {poFormLoading ? <><Spinner /> Envoi...</> : '✓ Créer le bon'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  // =============================================
  // SIDEBAR ITEMS
  // =============================================
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { id: 'products', icon: Package, label: 'Produits', show: true },
    { id: 'orders', icon: ShoppingCart, label: 'Commandes', show: true },
    { id: 'categories', icon: Tag, label: 'Catégories', show: isSuperAdmin() },
    { id: 'suppliers', icon: Truck, label: 'Fournisseurs', show: isSuperAdmin() },
    { id: 'users', icon: Users, label: 'Utilisateurs', show: isSuperAdmin() },
    { id: 'purchase-orders', icon: ClipboardList, label: 'Bons Commande', show: isSuperAdmin() || true },
  ];

  return (
    <>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-sm flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && <span className="font-bold text-lg text-amber-900">Admin Panel</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-amber-50 rounded-lg transition text-amber-700">
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.filter(i => i.show).map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition text-sm ${
                  activeTab === id ? 'bg-amber-600 text-white shadow-sm' : 'hover:bg-amber-50 text-gray-600'
                }`}>
                <Icon size={20} />
                {sidebarOpen && <span>{label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition font-medium text-sm">
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Tableau de Bord'}
              {activeTab === 'products' && 'Gestion des Produits'}
              {activeTab === 'orders' && 'Gestion des Commandes'}
              {activeTab === 'users' && 'Gestion des Utilisateurs'}
              {activeTab === 'purchase-orders' && 'Bons de Commande Fournisseur'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.first_name} {user?.last_name}
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                {isSuperAdmin() ? 'Super Admin' : 'Admin'}
              </span>
            </p>
          </div>
        </div>

        {/* Alerts */}
        <div className="px-8">
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          )}
          {successMsg && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">{successMsg}</span>
            </div>
          )}
        </div>

        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>

      {/* ORDER DETAIL MODAL */}
      {orderDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOrderDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-amber-900">📦 {orderDetail.order_number}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(orderDetail.created_at).toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}</p>
              </div>
              <button onClick={() => setOrderDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Client info */}
              <div className="bg-amber-50 rounded-xl p-4 space-y-1">
                <p className="font-bold text-amber-900 text-lg">{orderDetail.first_name} {orderDetail.last_name}</p>
                <p className="text-sm text-gray-600"><span className="text-gray-400">Email:</span> {orderDetail.email}</p>
                <p className="text-sm text-gray-600"><span className="text-gray-400">Tél:</span> {orderDetail.phone || 'Non renseigné'}</p>
                <p className="text-sm text-gray-600"><span className="text-gray-400">Adresse:</span> {orderDetail.shipping_address || 'Non renseignée'}</p>
                <p className="text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${orderDetail.user_type === 'wholesale' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-600'}`}>
                    {orderDetail.user_type === 'wholesale' ? '🏢 Grossiste' : '👤 Détail'}
                  </span>
                </p>
              </div>
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[orderDetail.status] || 'bg-gray-100'}`}>
                  {STATUS_LABELS[orderDetail.status] || orderDetail.status}
                </span>
                <span className="font-bold text-xl text-amber-700">{parseFloat(orderDetail.total_amount || 0).toFixed(2)} MAD</span>
              </div>
              {/* Items */}
              <div>
                <p className="font-bold text-gray-700 mb-3">Articles commandés</p>
                <div className="space-y-3">
                  {!orderDetail.items || orderDetail.items.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Aucun article trouvé</p>
                ) : orderDetail.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=80'}
                        alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-400">{item.brand} {item.barcode ? `· ${item.barcode}` : ''}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{parseFloat(item.unit_price || 0).toFixed(2)} MAD × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-amber-700">{parseFloat(item.total_price || 0).toFixed(2)} MAD</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-500">Total commande</span>
                <span className="text-2xl font-bold text-amber-700">{parseFloat(orderDetail.total_amount || 0).toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE ORDER DETAIL MODAL */}
      {poDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPoDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-amber-900">📋 Bon de Commande #{poDetail.id}</h3>
                <p className="text-sm text-gray-400 mt-0.5">Fournisseur: {poDetail.supplier_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  poDetail.status === 'received' ? 'bg-green-100 text-green-700' :
                  poDetail.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {poDetail.status === 'received' ? '✅ Reçu' : poDetail.status === 'cancelled' ? '❌ Annulé' : '⏳ En attente'}
                </span>
                <button onClick={() => setPoDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 bg-amber-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-gray-400">Fournisseur</p>
                  <p className="font-bold">{poDetail.supplier_name}</p>
                  {poDetail.supplier_phone && <p className="text-sm text-gray-500">{poDetail.supplier_phone}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Créé par</p>
                  <p className="font-bold">{poDetail.first_name} {poDetail.last_name}</p>
                  <p className="text-sm text-gray-500">{new Date(poDetail.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {poDetail.received_at && (
                  <div>
                    <p className="text-xs text-gray-400">Reçu le</p>
                    <p className="font-bold text-green-600">{new Date(poDetail.received_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {poDetail.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Notes</p>
                    <p className="text-sm">{poDetail.notes}</p>
                  </div>
                )}
              </div>
              {/* Items */}
              <div>
                <p className="font-bold text-gray-700 mb-3">Articles commandés ({(poDetail.items || []).length})</p>
                <div className="space-y-2">
                  {(poDetail.items || []).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Aucun article</p>
                  ) : (poDetail.items || []).map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=60'}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-400">{item.brand}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Stock actuel: <span className={`font-bold ${item.current_stock === 0 ? 'text-red-500' : item.current_stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>{item.current_stock}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{item.quantity_ordered} unités</p>
                        <p className="text-xs text-gray-400">{parseFloat(item.unit_cost || 0).toFixed(2)} MAD/u</p>
                        <p className="text-sm font-bold text-amber-700">{(item.quantity_ordered * item.unit_cost).toFixed(2)} MAD</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Coût total</span>
                <span className="text-2xl font-bold text-amber-700">
                  {(poDetail.items || []).reduce((s, i) => s + i.quantity_ordered * i.unit_cost, 0).toFixed(2)} MAD
                </span>
              </div>
              {/* Actions */}
              {poDetail.status === 'pending' && (
                <div className="flex gap-3 pt-2 border-t">
                  <button onClick={async () => {
                    if (!window.confirm('Confirmer la réception ? Le stock sera mis à jour automatiquement.')) return;
                    try {
                      await apiUpdatePurchaseOrderStatus(poDetail.id, 'received');
                      showSuccess('Stock mis à jour ✓');
                      setPoDetail(null);
                      loadPurchaseOrders();
                    } catch(e) { setError(e.message); }
                  }} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> Confirmer Réception
                  </button>
                  <button onClick={async () => {
                    if (!window.confirm('Annuler ce bon ?')) return;
                    try {
                      await apiUpdatePurchaseOrderStatus(poDetail.id, 'cancelled');
                      showSuccess('Bon annulé ✓');
                      setPoDetail(null);
                      loadPurchaseOrders();
                    } catch(e) { setError(e.message); }
                  }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 flex items-center gap-2">
                    <XCircle size={18} /> Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER DETAIL MODAL */}
      {supDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSupDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-amber-900">🏢 {supDetail.supplier.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  {supDetail.supplier.phone && <span>📞 {supDetail.supplier.phone}</span>}
                  {supDetail.supplier.email && <span>📧 {supDetail.supplier.email}</span>}
                  {supDetail.supplier.city && <span>📍 {supDetail.supplier.city}</span>}
                </div>
              </div>
              <button onClick={() => setSupDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Commandes', value: supDetail.stats.total_orders },
                  { label: 'Articles vendus', value: supDetail.stats.total_items_sold },
                  { label: 'Revenus', value: `${supDetail.stats.total_revenue.toLocaleString('fr-FR')} MAD` },
                ].map(s => (
                  <div key={s.label} className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-700">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Types de produits */}
              {(supDetail.supplier.product_types || []).length > 0 && (
                <div>
                  <p className="font-bold text-gray-700 mb-2">🏷️ Types de produits</p>
                  <div className="flex flex-wrap gap-2">
                    {supDetail.supplier.product_types.map(t => (
                      <span key={t} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Produits li kayjib */}
              <div>
                <p className="font-bold text-gray-700 mb-3">📦 Produits fournis ({supDetail.products.length})</p>
                {supDetail.products.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun produit lié à ce fournisseur</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {supDetail.products.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=60'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-amber-700">{parseFloat(p.price_retail).toFixed(2)} MAD</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                            p.stock === 0 ? 'bg-red-100 text-red-600' :
                            p.stock <= p.min_stock ? 'bg-orange-100 text-orange-600' :
                            'bg-green-100 text-green-600'
                          }`}>stock: {p.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historique commandes */}
              <div>
                <p className="font-bold text-gray-700 mb-3">📋 Historique commandes ({supDetail.orders.length})</p>
                {supDetail.orders.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucune commande pour ce fournisseur</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {supDetail.orders.map(o => (
                      <div key={o.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{o.order_number}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[o.status] || 'bg-gray-100'}`}>
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {o.first_name} {o.last_name}
                            {o.phone && ` · ${o.phone}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(o.created_at).toLocaleDateString('fr-FR')} · {o.total_items} articles
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-amber-700">{o.sup_total.toLocaleString('fr-FR')} MAD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}