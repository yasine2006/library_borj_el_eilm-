import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Heart, X, Star, SlidersHorizontal, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '../data';
import { apiGetProducts } from '../api';

const ITEMS_PER_PAGE = 12;

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const getStockStatus = (stock, min) => {
  if (stock === 0) return { label: 'Rupture', bg: 'bg-red-600' };
  if (stock <= min) return { label: 'Faible', bg: 'bg-amber-600' };
  return { label: 'En stock', bg: 'bg-green-700' };
};

export default function HomePage({ cart, setCart, userType }) {
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('all');
  const [wishlist, setWishlist]       = useState([]);
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
    setLoading(true);
    apiGetProducts()
      .then(setProducts)
      .catch(() => setError('Impossible de charger les produits'))
      .finally(() => setLoading(false));
  }, []);

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
    setTimeout(() => setFlash(null), 1000);
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
    <div className="min-h-screen bg-choco-light">

      {/* ── Header ── */}
      <div className="bg-choco-light pt-24 pb-10 px-6 border-b border-choco-border overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Reveal>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-choco-dark">Catalogue</h1>
              <p className="mt-2 text-choco-dark/50 text-sm max-w-md">Tous nos produits de fournitures scolaires et bureautiques.</p>
            </Reveal>

            {/* Search + Filter */}
            <Reveal delay={150}>
              <div className="mt-6 flex gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-choco-dark/30" size={18} />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher produits, marques..."
                    className="w-full pl-11 pr-10 py-3 rounded-full bg-choco-cream border border-choco-border text-choco-dark placeholder:text-choco-dark/30 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-choco-dark/30 hover:text-choco-dark transition">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${showFilters ? 'bg-choco-dark text-choco-light' : 'bg-choco-cream border border-choco-border text-choco-dark/60 hover:bg-choco-warm'}`}
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                  {activeCount > 0 && (
                    <span className="bg-choco-accent text-choco-light text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{activeCount}</span>
                  )}
                </button>
              </div>
            </Reveal>

            {/* Filter Panel */}
            {showFilters && (
              <Reveal>
                <div className="mt-3 max-w-xl bg-choco-cream border border-choco-border rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-choco-dark/50 font-medium block mb-1">Prix min</label>
                    <input type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0"
                      className="w-full px-3 py-2 bg-choco-light border border-choco-border rounded-xl text-sm text-choco-dark placeholder:text-choco-dark/30 focus:outline-none focus:border-amber-500/40" />
                  </div>
                  <div>
                    <label className="text-xs text-choco-dark/50 font-medium block mb-1">Prix max</label>
                    <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="9999"
                      className="w-full px-3 py-2 bg-choco-light border border-choco-border rounded-xl text-sm text-choco-dark placeholder:text-choco-dark/30 focus:outline-none focus:border-amber-500/40" />
                  </div>
                  <div>
                    <label className="text-xs text-choco-dark/50 font-medium block mb-1">Stock</label>
                    <select value={stock} onChange={e => setStock(e.target.value)}
                      className="w-full px-3 py-2 bg-choco-light border border-choco-border rounded-xl text-sm text-choco-dark focus:outline-none focus:border-amber-500/40">
                      <option value="all">Tous</option>
                      <option value="in_stock">En stock</option>
                      <option value="low">Faible</option>
                      <option value="out">Rupture</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-choco-dark/50 font-medium block mb-1">Trier</label>
                    <select value={sort} onChange={e => setSort(e.target.value)}
                      className="w-full px-3 py-2 bg-choco-light border border-choco-border rounded-xl text-sm text-choco-dark focus:outline-none focus:border-amber-500/40">
                      <option value="default">Par défaut</option>
                      <option value="price_asc">Prix ↑</option>
                      <option value="price_desc">Prix ↓</option>
                      <option value="name">Nom A→Z</option>
                    </select>
                  </div>
                  {activeCount > 0 && (
                    <div className="col-span-2 md:col-span-4">
                      <button onClick={reset} className="text-xs text-choco-accent hover:text-choco-dark flex items-center gap-1 font-medium transition">
                        <X size={12} /> Réinitialiser
                      </button>
                    </div>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          {/* Hero Image */}
          <Reveal delay={200}>
            <div className="relative hidden md:block">
              <div className="absolute -inset-3 bg-choco-accent-soft/40 rounded-3xl rotate-2 scale-105" />
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-choco-border group">
                <img
                  src="/landing/cat-office.jpg"
                  alt="Catalogue"
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-choco-dark/20 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-choco-dark text-choco-light px-4 py-2 rounded-xl shadow-lg animate-float">
                <p className="text-xs font-bold">+{filtered.length} produits</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="sticky top-0 z-40 border-b border-choco-border bg-choco-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${category === 'all' ? 'bg-choco-dark text-choco-light shadow-md' : 'bg-choco-cream border border-choco-border text-choco-dark/70 hover:bg-choco-warm'}`}
            >
              Tous
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${category === c.name ? 'bg-choco-dark text-choco-light shadow-md' : 'bg-choco-cream border border-choco-border text-choco-dark/70 hover:bg-choco-warm'}`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {/* Stats */}
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-choco-dark/50">
              <span className="font-bold text-choco-dark">{filtered.length}</span> produit{filtered.length !== 1 ? 's' : ''}
              {totalPages > 1 && <span className="text-choco-dark/30"> · Page {page}/{totalPages}</span>}
            </p>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${userType === 'wholesale' ? 'bg-choco-dark text-choco-light border-choco-dark' : 'bg-choco-cream text-choco-dark/50 border-choco-border'}`}>
              {userType === 'wholesale' ? 'Prix Grossiste' : 'Prix Détail'}
            </span>
          </div>
        </Reveal>

        {error && <div className="text-center py-16 text-red-600 font-medium">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-choco-cream border border-choco-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-choco-warm" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-choco-border rounded-lg w-1/2" />
                  <div className="h-3.5 bg-choco-border rounded-lg w-3/4" />
                  <div className="h-5 bg-choco-border rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-choco-border mb-3" />
            <p className="text-choco-dark/50 font-medium">Aucun produit trouvé</p>
            <button onClick={() => { setSearch(''); setCategory('all'); reset(); }} className="mt-3 text-choco-accent hover:text-choco-dark font-medium text-sm underline">
              Réinitialiser
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((p, i) => {
                const st = getStockStatus(p.stock, p.min_stock || 5);
                const prc = price(p);
                const retail = parseFloat(p.price_retail) || 0;
                const inWl = wishlist.includes(p.id);
                const isFlash = flash === p.id;
                return (
                  <Reveal key={p.id} delay={i * 30}>
                    <div
                      onClick={() => setSelectedProduct(p)}
                      className="group bg-choco-cream border border-choco-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer h-full"
                    >
                      <div className="relative h-44 bg-choco-warm overflow-hidden">
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400'}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {p.stock === 0 && (
                          <div className="absolute inset-0 bg-choco-dark/50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-xl text-xs font-bold">RUPTURE</span>
                          </div>
                        )}
                        <span className={`absolute top-2 left-2 ${st.bg} text-white px-2.5 py-0.5 rounded-lg text-xs font-bold`}>
                          {st.label}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setWishlist(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id]); }}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 ${inWl ? 'bg-red-500 text-white' : 'bg-choco-cream/80 text-choco-dark/40 hover:text-red-500'}`}
                        >
                          <Heart size={13} className={inWl ? 'fill-current' : ''} />
                        </button>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] text-choco-accent font-semibold uppercase tracking-wider mb-1">{p.category_name || 'Général'}</span>
                        <h3 className="text-sm font-semibold text-choco-dark line-clamp-2 flex-1 mb-1.5 leading-snug">{p.name}</h3>
                        <p className="text-xs text-choco-dark/40 mb-2">{p.brand}</p>
                        <div className="flex gap-0.5 mb-2.5">
                          {[...Array(5)].map((_, j) => <Star key={j} size={11} className={j < 4 ? 'fill-amber-500 text-amber-500' : 'text-choco-border'} />)}
                        </div>
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <span className="text-lg font-bold text-choco-dark">{prc.toFixed(2)}</span>
                            <span className="text-[10px] text-choco-dark/40 ml-0.5">MAD</span>
                            {userType === 'wholesale' && prc < retail && (
                              <span className="text-[10px] text-choco-dark/30 line-through block">{retail.toFixed(2)} MAD</span>
                            )}
                          </div>
                          <button
                            onClick={e => addToCart(p, e)}
                            disabled={p.stock === 0}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${p.stock === 0 ? 'bg-choco-border text-choco-dark/30 cursor-not-allowed' : isFlash ? 'bg-green-600 text-white scale-90' : 'bg-choco-dark text-choco-light hover:bg-choco-dark/80 active:scale-90 shadow-md'}`}
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Reveal delay={150}>
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2.5 rounded-xl bg-choco-cream border border-choco-border hover:bg-choco-warm disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronLeft size={18} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-medium text-sm transition-all duration-300 ${page === i + 1 ? 'bg-choco-dark text-choco-light shadow-md' : 'bg-choco-cream border border-choco-border hover:bg-choco-warm text-choco-dark/60'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2.5 rounded-xl bg-choco-cream border border-choco-border hover:bg-choco-warm disabled:opacity-30 disabled:cursor-not-allowed transition">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </Reveal>
            )}
          </>
        )}
      </div>

      {/* ── Product Modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-choco-dark/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-choco-cream border border-choco-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-64">
              <img src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600'}
                alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 bg-choco-cream/90 text-choco-dark p-2 rounded-xl transition hover:bg-choco-warm">
                <X size={18} />
              </button>
              {(() => { const st = getStockStatus(selectedProduct.stock, selectedProduct.min_stock || 5);
                return <span className={`absolute top-3 left-3 ${st.bg} text-white px-3 py-1 rounded-xl text-xs font-bold`}>{st.label}</span>;
              })()}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] text-choco-accent font-semibold uppercase tracking-wider">{selectedProduct.category_icon} {selectedProduct.category_name}</span>
                  <h2 className="text-lg font-bold text-choco-dark mt-1">{selectedProduct.name}</h2>
                  <p className="text-sm text-choco-dark/50">{selectedProduct.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-choco-dark">{price(selectedProduct).toFixed(2)} <span className="text-xs font-normal text-choco-dark/40">MAD</span></p>
                  {userType === 'wholesale' && price(selectedProduct) < parseFloat(selectedProduct.price_retail) && (
                    <p className="text-xs text-choco-dark/30 line-through">{parseFloat(selectedProduct.price_retail).toFixed(2)} MAD</p>
                  )}
                </div>
              </div>
              {selectedProduct.description && (
                <p className="text-sm text-choco-dark/50 mb-4 border-t border-choco-border pt-3 leading-relaxed">{selectedProduct.description}</p>
              )}
              <div className="flex items-center gap-3 text-sm text-choco-dark/50 mb-4">
                <span className="flex items-center gap-1.5">
                  <Package size={14} className="text-choco-accent" />
                  Stock: <strong className="text-choco-dark ml-1">{selectedProduct.stock}</strong>
                </span>
                {selectedProduct.barcode && <span className="text-choco-dark/30">Code: {selectedProduct.barcode}</span>}
              </div>
              <div className="flex gap-3">
                <button onClick={e => { addToCart(selectedProduct, e); setSelectedProduct(null); }}
                  disabled={selectedProduct.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${selectedProduct.stock === 0 ? 'bg-choco-border text-choco-dark/30 cursor-not-allowed' : 'bg-choco-dark text-choco-light hover:bg-choco-dark/80 shadow-md'}`}>
                  <ShoppingCart size={18} />
                  {selectedProduct.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
                </button>
                <button onClick={() => setWishlist(prev => prev.includes(selectedProduct.id) ? prev.filter(i => i !== selectedProduct.id) : [...prev, selectedProduct.id])}
                  className={`p-3 rounded-xl border transition-all duration-300 ${wishlist.includes(selectedProduct.id) ? 'bg-red-50 border-red-200 text-red-500' : 'bg-choco-cream border-choco-border hover:bg-choco-warm text-choco-dark/40 hover:text-red-500'}`}>
                  <Heart size={18} className={wishlist.includes(selectedProduct.id) ? 'fill-current' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
