import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookContext, WHATSAPP_NUMBER } from '../context/BookContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpRight, Monitor, Gamepad2, Tv, Wrench, ShoppingCart } from 'lucide-react';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import TrustWidget from '../components/TrustWidget';
import SEO from '../components/SEO';

import Loader from '../components/Loader';


const Home = () => {
    const { books, allBooks, activeCategory, setActiveCategory, categoryButtons, loading, loadingMore, hasMore, customCategories, currentUser, isAdmin, googleLogin } = useContext(BookContext);
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // NAVIGATION HELPER
    const navigate = useNavigate();

    // If loading, show Loader inside the grid area, not full screen
    // if (loading) return <Loader fullScreen={false} />; 

    const baseBooks = search.trim() ? allBooks : books.slice(0, 8);
    const filteredBooks = baseBooks
        .filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                book.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
            if (!matchesSearch) return false;

            if (activeCategory === 'All') return true;
            if (activeCategory === 'Free') return book.type === 'free';
            if (activeCategory === 'Paid') return book.type === 'paid';
            return book.category === activeCategory;
        });

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('I want to buy a product')}`;

    // Get the button config for current category
    const catButton = categoryButtons[activeCategory] || null;
    const catButtonLink = catButton
        ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(catButton.message || `I want to see all ${activeCategory} products`)}`
        : null;

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <SEO
                title={`${activeCategory === 'All' ? 'All Products' : activeCategory} | Digital Trusted Zone`}
                description="Get premium software subscriptions, VPNs, and tech courses at the best prices."
            />

            {/* Hero Section */}
            <section style={{ textAlign: 'center', margin: '4rem 0 3rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Trusted Zone Logo Placeholder */}
                    <div style={{ margin: '0 auto 1.5rem', width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(45, 212, 191, 0.1)', border: '2px solid rgba(45, 212, 191, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-2px' }}>DZ</span>
                    </div>

                    <h1 className="outfit" style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)', marginBottom: '1rem', lineHeight: '1.2', fontWeight: 800 }}>
                        Unlock Your Digital Potential
                    </h1>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Premium Digital Subscriptions & Software Solutions.
                    </p>

                    <button 
                        onClick={() => {
                            if (!currentUser && !isAdmin && typeof googleLogin === 'function') {
                                googleLogin();
                            } else {
                                window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' });
                            }
                        }} 
                        className="btn btn-primary" 
                        style={{ padding: '0.9rem 2.8rem', fontSize: '1.1rem', borderRadius: '30px', fontWeight: 600 }}
                    >
                        Get Started <ArrowUpRight size={20} />
                    </button>
                </motion.div>
            </section>

            {/* Feature Grid Categories (Visual Style) */}
            <section style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', justifyContent: 'center' }}>
                    {[
                        { name: 'Methods', icon: <Search size={28} strokeWidth={1.5} /> },
                        { name: 'Software', icon: <Monitor size={28} strokeWidth={1.5} /> },
                        { name: 'Games', icon: <Gamepad2 size={28} strokeWidth={1.5} /> },
                        { name: 'Streaming', icon: <Tv size={28} strokeWidth={1.5} /> },
                        { name: 'Tools', icon: <Wrench size={28} strokeWidth={1.5} /> },
                        { name: 'Store', icon: <ShoppingCart size={28} strokeWidth={1.5} /> },
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="category-pill-card"
                            onClick={() => setActiveCategory('All')}
                        >
                            <div className="category-pill-icon">
                                {item.icon}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.name}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Search */}
            <div className="glass-panel" style={{ padding: '0.7rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', position: 'relative', zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search for software, VPNs, or courses..."
                        value={search}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSearch(val);
                            if (val.length > 1 && allBooks.length > 0) {
                                const matches = allBooks.filter(b =>
                                    b.title.toLowerCase().includes(val.toLowerCase()) ||
                                    b.category.toLowerCase().includes(val.toLowerCase())
                                ).slice(0, 5);
                                setSuggestions(matches);
                                setShowSuggestions(true);
                            } else {
                                setShowSuggestions(false);
                            }
                        }}
                        onFocus={() => { if (search.length > 1) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'var(--card-bg)', // Use theme variable
                                backdropFilter: 'blur(10px)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '0 0 10px 10px',
                                marginTop: '5px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                overflow: 'hidden'
                            }}
                        >
                            {suggestions.map((book, i) => (
                                <a
                                    key={book.id}
                                    href={`/product/${book.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.8rem 1rem',
                                        textDecoration: 'none',
                                        borderBottom: i < suggestions.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>{book.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{book.category}</div>
                                    </div>
                                    <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </a>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Content */}
            <div className="home-main" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem' }}>
                <section>
                    {/* Books Grid or Loader */}
                    {loading ? (
                        <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '2rem', padding: '1rem 0' }}>
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '2rem', padding: '1rem 0' }}>
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book, index) => (
                                    <BookCard key={book.id} book={book} index={index} />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                                    <h3>No products found in {activeCategory}.</h3>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try a different category or search term.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EXPLORE MORE BUTTON - Only show when NOT searching and on Home */}
                    {!search.trim() && (
                        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                            <button 
                                onClick={() => navigate('/store')} 
                                className="btn" 
                                style={{ 
                                    padding: '0.8rem 2.4rem', 
                                    borderRadius: '12px', 
                                    fontSize: '1.05rem', 
                                    fontWeight: '800', 
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    background: 'linear-gradient(135deg, #ec4899, #db2777)', 
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                EXPLORE FULL STORE <ArrowUpRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Auto-Loading Indicator */}
                    {loadingMore && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}
                            />
                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Loading more products...</p>
                        </div>
                    )}
                    {!loading && filteredBooks.length > 0 && (() => {
                        const catBtn = categoryButtons[activeCategory] || {};
                        const bundleMsg = catBtn.message || `I want to buy all ${activeCategory} items bundle`;
                        const bundleLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(bundleMsg)}`;

                        // Safe Price Calculation
                        let totalPrice = 0;
                        try {
                            totalPrice = filteredBooks.reduce((sum, b) => {
                                if (b.price && typeof b.price === 'string') {
                                    const numIndex = b.price.match(/\d/);
                                    if (numIndex) {
                                        const cleanStr = b.price.replace(/[^0-9]/g, '');
                                        const num = parseInt(cleanStr);
                                        return sum + (isNaN(num) ? 0 : num);
                                    }
                                } else if (typeof b.price === 'number') {
                                    return sum + b.price;
                                }
                                return sum;
                            }, 0);
                        } catch (e) {
                            console.error("Price calculation error", e);
                        }

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                className="glass-panel glow-border"
                                style={{ marginTop: '3rem', padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '24px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(22,163,74,0.1), rgba(251,191,36,0.05))', border: '1px solid rgba(22,163,74,0.3)' }}
                            >
                                <h3 className="outfit" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', marginBottom: '0.5rem' }}>
                                    Limited Time Offer — Hurry Up!
                                </h3>


                                <motion.a
                                    href={bundleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn whatsapp-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(37, 211, 102, 0.3)' }}
                                >
                                    Claim Deal
                                </motion.a>
                            </motion.div>
                        );
                    })()}
                </section>

                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <TrustWidget />
                    <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Need Help?</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            We're here to assist you anytime.
                        </p>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn whatsapp-btn" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                            Contact Support
                        </a>
                    </div>
                </aside>
            </div >
        </div >
    );
};

export default Home;
