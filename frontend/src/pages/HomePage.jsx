import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Heart, ChevronRight, ChevronLeft, X, Star, SlidersHorizontal, ShoppingBag, Package, ChevronLeft as PrevIcon, ChevronRight as NextIcon } from 'lucide-react';
import { categories, banners, promoBanners } from '../data';
import { apiGetProducts } from '../api';

const ITEMS_PER_PAGE = 12;

const getStockStatus = (stock, min) => {
  if (stock === 0) return { label: 'Rupture', bg: 'bg-red-500' };
  if (stock <= min) return { label: 'Faible', bg: 'bg-orange-400' };
  return { label: 'En stock', bg: 'bg-green-500' };
};

export default function HomePage({ cart, setCart, userType }) {
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('all');
  const [wishlist, setWishlist]       = useState([]);
  const [banner, setBanner]           = useState(0);
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin]       = useState('');
  const [priceMax, setPriceMax]       = useState('');
  const [stock, setStock]             = useState('all');
  const [sort, setSort]               = useState('default');
  const [flash, setFlash]             = useState(null);
  const [page, setPage]               = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setBanner(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    apiGetProducts()
      .then(setProducts)
      .catch(() => setError('Impossible de charger les produits'))
      .finally(() => setLoading(false));
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, category, priceMin, priceMax, stock, sort]);

  const price = p => parseFloat(userType === 'wholesale' ? p.price_wholesale : p.price_retail) || 0;

  const addToCart = (p, e) => {
    if (e) e.stopPropagation();
    if (p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...p, quantity: 1 }];
    });
    setFlash(p.id);
    setTimeout(() => setFlash(null), 1200);
  };

  const activeCount = [priceMin, priceMax, stock !== 'all', sort !== 'default'].filter(Boolean).length;
  const reset = () => { setPriceMin(''); setPriceMax(''); setStock('all'); setSort('default'); };

  let filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name?.toLowerCase().includes(q) && !p.brand?.toLowerCase().includes(q) && !p.category_name?.toLowerCase().includes(q)) return false;
    if (category !== 'all' && p.category_name !== category) return false;
    if (priceMin && price(p) < +priceMin) return false;
    if (priceMax && price(p) > +priceMax) return false;
    if (stock === 'in_stock' && p.stock <= p.min_stock) return false;
    if (stock === 'low' && !(p.stock > 0 && p.stock <= p.min_stock)) return false;
    if (stock === 'out' && p.stock !== 0) return false;
    return true;
  });

  if (sort === 'price_asc') filtered.sort((a, b) => price(a) - price(b));
  if (sort === 'price_desc') filtered.sort((a, b) => price(b) - price(a));
  if (sort === 'name') filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Search */}
      <div className="bg-amber-700 py-4 shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher produits, marques..."
                className="w-full pl-11 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16}/></button>}
            </div>
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 rounded-xl font-medium text-sm transition ${showFilters ? 'bg-white text-amber-700' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              <SlidersHorizontal size={16}/>
              Filtres
              {activeCount > 0 && <span className="bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
            </button>
          </div>

          {showFilters && (
            <div className="max-w-3xl mx-auto mt-3">
              <div className="bg-white rounded-xl p-4 shadow grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Prix min (MAD)</label>
                  <input type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Prix max (MAD)</label>
                  <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="9999"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Disponibilité</label>
                  <select value={stock} onChange={e => setStock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500">
                    <option value="all">Tous</option>
                    <option value="in_stock">En stock</option>
                    <option value="low">Stock faible</option>
                    <option value="out">Rupture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium block mb-1">Trier par</label>
                  <select value={sort} onChange={e => setSort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500">
                    <option value="default">Par défaut</option>
                    <option value="price_asc">Prix ↑</option>
                    <option value="price_desc">Prix ↓</option>
                    <option value="name">Nom A→Z</option>
                  </select>
                </div>
                {activeCount > 0 && (
                  <div className="col-span-2 md:col-span-4">
                    <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                      <X size={12}/> Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden h-[280px] lg:h-[320px] group shadow-lg">
            {banners.map((b, i) => (
              <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${i === banner ? 'opacity-100' : 'opacity-0'}`}>
                <img src={b.image} alt={b.title} className="w-full h-full object-cover"/>
                <div className={`absolute inset-0 bg-gradient-to-r ${b.color} to-transparent flex items-center`}>
                  <div className="p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">{b.title}</h2>
                    <p className="text-sm opacity-90 mb-4">{b.subtitle}</p>
                    <button className="bg-white text-amber-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-amber-50 transition">{b.cta}</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => <button key={i} onClick={() => setBanner(i)} className={`h-1.5 rounded-full transition-all ${i === banner ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`}/>)}
            </div>
            <button onClick={() => setBanner(p => (p - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"><ChevronLeft size={20}/></button>
            <button onClick={() => setBanner(p => (p + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"><ChevronRight size={20}/></button>
          </div>
          <div className="space-y-3">
            {promoBanners.map(p => (
              <div key={p.id} className={`${p.bgColor} rounded-2xl p-5 text-white cursor-pointer hover:opacity-90 transition shadow-md`} style={{height:'148px'}}>
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-sm opacity-80 mt-1">{p.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition shadow-sm ${category === 'all' ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50'}`}>🏪 Tous</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.name)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-1.5 shadow-sm ${category === c.name ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50'}`}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <span className="font-bold text-gray-800">{filtered.length}</span> produit{filtered.length !== 1 ? 's' : ''}
            {totalPages > 1 && <span className="text-gray-400"> · Page {page}/{totalPages}</span>}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${userType === 'wholesale' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
            {userType === 'wholesale' ? '🏢 Prix Grossiste' : '👤 Prix Détail'}
          </span>
        </div>
      </div>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        {error && <div className="text-center py-16 text-red-500">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                <div className="h-44 bg-gray-200"/>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                  <div className="h-4 bg-gray-100 rounded w-3/4"/>
                  <div className="h-6 bg-gray-100 rounded w-1/3"/>
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
            <button onClick={() => { setSearch(''); setCategory('all'); reset(); }} className="mt-4 text-amber-600 hover:text-amber-700 font-medium text-sm underline">Réinitialiser</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map(p => {
                const st = getStockStatus(p.stock, p.min_stock || 5);
                const prc = price(p);
                const retail = parseFloat(p.price_retail) || 0;
                const inWl = wishlist.includes(p.id);
                const isFlash = flash === p.id;
                return (
                  <div key={p.id} onClick={() => setSelectedProduct(p)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group cursor-pointer">
                    <div className="relative h-44 bg-gray-50 overflow-hidden">
                      <img src={p.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'}
                        alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"/>
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">RUPTURE</span>
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 ${st.bg} text-white px-2 py-0.5 rounded-full text-xs font-bold`}>{st.label}</span>
                      <button onClick={e => { e.stopPropagation(); setWishlist(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id]); }}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition ${inWl ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-400'}`}>
                        <Heart size={14} className={inWl ? 'fill-current' : ''}/>
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-xs text-amber-600 font-medium mb-1">{p.category_icon || ''} {p.category_name || 'Général'}</span>
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2 flex-1 mb-2">{p.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">{p.brand}</p>
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => <Star key={i} size={11} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}/>)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-amber-700">{prc.toFixed(2)} MAD</span>
                          {userType === 'wholesale' && prc < retail && (
                            <span className="text-xs text-gray-400 line-through block">{retail.toFixed(2)} MAD</span>
                          )}
                        </div>
                        <button onClick={e => addToCart(p, e)} disabled={p.stock === 0}
                          className={`p-2.5 rounded-xl transition ${p.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isFlash ? 'bg-green-500 text-white scale-95' : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95'}`}>
                          <ShoppingCart size={17}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <PrevIcon size={18}/>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg font-medium text-sm transition ${page === i + 1 ? 'bg-amber-600 text-white shadow-sm' : 'border border-gray-200 hover:bg-amber-50 text-gray-700'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                  <NextIcon size={18}/>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-64">
              <img src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600'}
                alt={selectedProduct.name} className="w-full h-full object-cover"/>
              <button onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition">
                <X size={20}/>
              </button>
              {(() => { const st = getStockStatus(selectedProduct.stock, selectedProduct.min_stock || 5);
                return <span className={`absolute top-3 left-3 ${st.bg} text-white px-3 py-1 rounded-full text-xs font-bold`}>{st.label}</span>;
              })()}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-amber-600 font-medium">{selectedProduct.category_icon} {selectedProduct.category_name}</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-1">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-500">{selectedProduct.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">{price(selectedProduct).toFixed(2)} MAD</p>
                  {userType === 'wholesale' && price(selectedProduct) < parseFloat(selectedProduct.price_retail) && (
                    <p className="text-sm text-gray-400 line-through">{parseFloat(selectedProduct.price_retail).toFixed(2)} MAD</p>
                  )}
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-gray-600 mb-4 border-t pt-3">{selectedProduct.description}</p>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Package size={14} className="text-amber-600"/>
                  Stock: <strong className="text-gray-700 ml-1">{selectedProduct.stock}</strong>
                </span>
                {selectedProduct.barcode && (
                  <span className="text-gray-400">Code: {selectedProduct.barcode}</span>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={e => { addToCart(selectedProduct, e); setSelectedProduct(null); }}
                  disabled={selectedProduct.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${selectedProduct.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
                  <ShoppingCart size={18}/>
                  {selectedProduct.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
                <button onClick={() => setWishlist(prev => prev.includes(selectedProduct.id) ? prev.filter(i => i !== selectedProduct.id) : [...prev, selectedProduct.id])}
                  className={`p-3 rounded-xl border transition ${wishlist.includes(selectedProduct.id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}>
                  <Heart size={20} className={wishlist.includes(selectedProduct.id) ? 'fill-current' : ''}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}