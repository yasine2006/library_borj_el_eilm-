import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, BookOpen, PenTool, Briefcase, Sparkles, TrendingUp, Shield, Star, ChevronLeft, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const categories = [
  { name: 'Cahiers & Cahiers', icon: <BookOpen size={24} />, count: '240+' },
  { name: 'Stylos & Plumes', icon: <PenTool size={24} />, count: '180+' },
  { name: 'Fournitures Buro', icon: <Briefcase size={24} />, count: '320+' },
  { name: 'Art & Créativité', icon: <Sparkles size={24} />, count: '150+' },
];

const featuredProducts = [
  { id: 1, name: 'Cahier 200 pages 17x24', price: '12.90', category: 'Cahiers', rating: 4.8, img: '/landing/cat-notebooks.jpg' },
  { id: 2, name: 'Lot 10 Stylos Bille Noirs', price: '45.00', category: 'Stylos', rating: 4.9, img: '/landing/cat-pens.jpg' },
  { id: 3, name: 'Tapis de Souris Ergonomique', price: '35.00', category: 'Bureau', rating: 4.7, img: '/landing/cat-office.jpg' },
  { id: 4, name: 'Ensemble Feutres 24 Couleurs', price: '68.00', category: 'Art', rating: 4.9, img: '/landing/cat-art.jpg' },
  { id: 5, name: 'Agenda 2026 A5 Reliure', price: '29.90', category: 'Agendas', rating: 4.6, img: '/landing/cat-notebooks.jpg' },
  { id: 6, name: 'Lot 50 Feuilles A4 80g', price: '22.00', category: 'Papier', rating: 4.8, img: '/landing/cat-office.jpg' },
];

const testimonials = [
  { name: 'Fatima Zahra B.', role: 'Directrice d\'école', text: 'Borj El Eilm est devenu notre fournisseur attitré. Qualité constante et livraisons toujours ponctuelles.', rating: 5 },
  { name: 'Mohamed A.', role: 'Grossiste', text: 'Les prix sont très compétitifs et le service client est exceptionnel. Je recommande vivement.', rating: 5 },
  { name: 'Sara M.', role: 'Enseignante', text: 'Je trouve tout ce qu\'il me faut pour ma classe à des prix imbattables. Le gros avantage pour les achats en quantité.', rating: 4 },
];

const navLinks = [
  { label: 'Accueil', href: '#hero' },
  { label: 'Catégories', href: '#categories' },
  { label: 'Produits', href: '#products' },
  { label: 'Grossiste', href: '#wholesale' },
  { label: 'Contact', href: '#footer' },
];

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-choco-light font-sans text-choco-dark">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-choco-light/90 backdrop-blur-xl border-b border-choco-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-choco-dark hover:text-choco-accent transition">
            Borj El Eilm
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-choco-dark/70 hover:text-choco-dark transition">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/catalogue" className="hidden md:inline-flex px-4 py-2 bg-choco-dark text-choco-light text-sm font-medium rounded-full hover:bg-choco-dark/80 transition">
              Voir le catalogue
            </Link>
            <button onClick={() => setMobileMenu(v => !v)} className="md:hidden p-2">
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-choco-border bg-choco-light/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map(l => (
                <a key={l.label} href={l.href} onClick={() => setMobileMenu(false)} className="block text-sm font-medium text-choco-dark/70 hover:text-choco-dark">
                  {l.label}
                </a>
              ))}
              <Link to="/catalogue" className="block mt-2 px-4 py-2 bg-choco-dark text-choco-light text-sm font-medium rounded-full text-center">
                Voir le catalogue
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <RevealSection>
            <p className="text-sm font-semibold tracking-widest uppercase text-choco-accent mb-4">
              Fournitures Scolaires & Bureautique
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              L'univers du{' '}
              <span className="text-choco-accent">savoir-faire</span>
              <br />à portée de main
            </h1>
            <p className="text-lg text-choco-dark/60 max-w-lg mb-8 leading-relaxed">
              Votre partenaire de confiance pour les fournitures scolaires et bureautiques au Maroc. Qualité, prix et service — depuis Casablanca.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalogue" className="px-6 py-3 bg-choco-dark text-choco-light font-semibold rounded-full hover:bg-choco-dark/80 transition shadow-lg hover:shadow-xl">
                Découvrir le catalogue
              </Link>
              <a href="#wholesale" className="px-6 py-3 border-2 border-choco-dark/20 text-choco-dark font-semibold rounded-full hover:bg-choco-dark hover:text-choco-light transition">
                Espace Grossiste
              </a>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-choco-accent-soft rounded-3xl rotate-3 scale-105 opacity-60 group-hover:rotate-6 group-hover:scale-110 transition-all duration-700" />
              <div className="relative bg-choco-cream rounded-3xl overflow-hidden shadow-2xl border border-choco-border">
                <div className="relative h-80 md:h-96 overflow-hidden">
                  <img
                    src="/landing/hero-retail.jpg"
                    alt="Fournitures scolaires"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-choco-dark/30 via-transparent to-transparent" />
                </div>
                <div className="p-6 text-center">
                  <p className="font-display text-xl font-semibold text-choco-dark">+15 000 produits</p>
                  <p className="text-sm text-choco-dark/50 mt-1">disponibles en stock</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-choco-dark text-choco-light px-4 py-2 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <p className="text-sm font-bold"> Livraison 24h</p>
                <p className="text-xs text-choco-light/60">Casablanca</p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <RevealSection>
        <section className="border-y border-choco-border bg-choco-cream/50">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10 000+', label: 'Clients satisfaits' },
              { value: '24h', label: 'Livraison Casablanca' },
              { value: '4.8/5', label: 'Note moyenne' },
              { value: '15+', label: 'Années d\'expérience' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-choco-dark">{s.value}</p>
                <p className="text-xs text-choco-dark/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* ── Categories ── */}
      <section id="categories" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-semibold tracking-widest uppercase text-choco-accent mb-2">Nos rayons</p>
                <h2 className="font-display text-4xl font-bold tracking-tight">Parcourir par catégorie</h2>
              </div>
              <Link to="/catalogue" className="text-sm font-medium text-choco-dark/60 hover:text-choco-dark transition hidden md:block">
                Voir tout →
              </Link>
            </div>
          </RevealSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c, i) => (
              <RevealSection key={c.name} delay={i * 100}>
                <Link to="/catalogue" className="group block bg-choco-cream border border-choco-border rounded-2xl p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-choco-warm rounded-2xl flex items-center justify-center mx-auto mb-4 text-choco-accent group-hover:scale-110 transition">
                    {c.icon}
                  </div>
                  <h3 className="font-semibold text-choco-dark mb-1">{c.name}</h3>
                  <p className="text-sm text-choco-dark/40">{c.count} produits</p>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wholesale Path ── */}
      <section id="wholesale" className="py-20 px-6 bg-choco-dark text-choco-light">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <RevealSection>
            <p className="text-sm font-semibold tracking-widest uppercase text-choco-accent-soft mb-4">Espace Grossiste</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Devenez partenaire
              <br />
              <span className="text-choco-accent-soft">Borj El Eilm</span>
            </h2>
            <p className="text-choco-light/60 leading-relaxed mb-8">
              Accédez à des tarifs préférentiels, des remises progressives et un service dédié aux professionnels de l'éducation et du bureau.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: <TrendingUp size={18} />, text: 'Remises progressives jusqu\'à 35%' },
                { icon: <Shield size={18} />, text: 'Paiement à 30 jours' },
                { icon: <Sparkles size={18} />, text: 'Catalogue exclusif produits pro' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-choco-accent/20 rounded-lg flex items-center justify-center text-choco-accent-soft">
                    {b.icon}
                  </div>
                  <span className="text-choco-light/80 text-sm">{b.text}</span>
                </div>
              ))}
            </div>
            <Link to="/register-grossiste" className="inline-flex px-6 py-3 bg-choco-accent text-choco-light font-semibold rounded-full hover:bg-choco-accent-soft hover:text-choco-dark transition">
              Faire ma demande
            </Link>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '35%', desc: 'Remise maximale' },
                { num: '48h', desc: 'Délai de traitement' },
                { num: '500+', desc: 'Grossistes actifs' },
                { num: '24/7', desc: 'Support dédié' },
              ].map((s) => (
                <div key={s.desc} className="bg-choco-light/10 rounded-2xl p-6 text-center border border-choco-light/10">
                  <p className="font-display text-3xl font-bold text-choco-accent-soft">{s.num}</p>
                  <p className="text-xs text-choco-light/40 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <RevealSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-semibold tracking-widest uppercase text-choco-accent mb-2">Sélection du moment</p>
                <h2 className="font-display text-4xl font-bold tracking-tight">Produits vedettes</h2>
              </div>
              <Link to="/catalogue" className="text-sm font-medium text-choco-dark/60 hover:text-choco-dark transition hidden md:block">
                Voir tout →
              </Link>
            </div>
          </RevealSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p, i) => (
              <RevealSection key={p.id} delay={i * 80}>
                <div className="group bg-choco-cream border border-choco-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 bg-choco-warm overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-choco-accent font-medium mb-1">{p.category}</p>
                    <h3 className="font-semibold text-choco-dark mb-3 line-clamp-1">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-display text-xl font-bold text-choco-dark">{p.price} MAD</span>
                        <span className="text-xs text-choco-dark/40 block">TTC</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={13} className="fill-choco-accent text-choco-accent" />
                        <span className="text-xs text-choco-dark/50">{p.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6 bg-choco-cream/50 border-y border-choco-border">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <div className="text-center mb-12">
              <p className="text-sm font-semibold tracking-widest uppercase text-choco-accent mb-2">Témoignages</p>
              <h2 className="font-display text-4xl font-bold tracking-tight">Ce que disent nos clients</h2>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="relative bg-choco-cream rounded-3xl p-10 shadow-sm border border-choco-border text-center min-h-[220px]">
              {testimonials.map((t, i) => (
                <div key={i} className={`transition-all duration-500 absolute inset-0 flex flex-col items-center justify-center px-10 ${i === currentTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} className={j < t.rating ? 'fill-choco-accent text-choco-accent' : 'text-choco-border'} />)}
                  </div>
                  <p className="text-choco-dark/70 italic text-lg leading-relaxed mb-6 max-w-2xl">"{t.text}"</p>
                  <p className="font-semibold text-choco-dark">{t.name}</p>
                  <p className="text-sm text-choco-dark/40">{t.role}</p>
                </div>
              ))}
              <button onClick={() => setCurrentTestimonial(p => (p - 1 + testimonials.length) % testimonials.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-choco-warm border border-choco-border flex items-center justify-center text-choco-dark/40 hover:text-choco-dark hover:bg-choco-accent-soft/50 transition">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setCurrentTestimonial(p => (p + 1) % testimonials.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-choco-warm border border-choco-border flex items-center justify-center text-choco-dark/40 hover:text-choco-dark hover:bg-choco-accent-soft/50 transition">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrentTestimonial(i)} className={`w-2 h-2 rounded-full transition ${i === currentTestimonial ? 'bg-choco-accent w-6' : 'bg-choco-border'}`} />
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="footer" className="bg-choco-dark text-choco-light/60 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <Link to="/" className="font-display text-2xl font-bold text-choco-light tracking-tight">Borj El Eilm</Link>
              <p className="text-sm mt-3 leading-relaxed text-choco-light/40">
                Votre fournisseur de confiance pour les fournitures scolaires et bureautiques au Maroc.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-choco-light text-sm uppercase tracking-wider mb-4">Boutique</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#categories" className="hover:text-choco-light transition">Catégories</a></li>
                <li><a href="#products" className="hover:text-choco-light transition">Produits vedettes</a></li>
                <li><Link to="/catalogue" className="hover:text-choco-light transition">Catalogue complet</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-choco-light text-sm uppercase tracking-wider mb-4">Grossiste</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#wholesale" className="hover:text-choco-light transition">Espace partenaire</a></li>
                <li><Link to="/register-grossiste" className="hover:text-choco-light transition">Devenir grossiste</Link></li>
                <li><Link to="/login" className="hover:text-choco-light transition">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-choco-light text-sm uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><MapPin size={14} className="text-choco-accent-soft shrink-0" /> Casablanca, Maroc</li>
                <li className="flex items-center gap-2"><Phone size={14} className="text-choco-accent-soft shrink-0" /> +212 5XX-XXXXXX</li>
                <li className="flex items-center gap-2"><Mail size={14} className="text-choco-accent-soft shrink-0" /> contact@borjeleilm.ma</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-choco-light/10 pt-8 text-center text-xs text-choco-light/30">
            &copy; {new Date().getFullYear()} Borj El Eilm. Tous droits réservés.
          </div>
        </div>
      </footer>

    </div>
  );
}
