import { useState, useContext, useEffect } from 'react';
import { BookContext, WHATSAPP_NUMBER } from '../context/BookContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import TrustWidget from '../components/TrustWidget';
import SEO from '../components/SEO';
import { useSearchParams } from 'react-router-dom';

const Store = () => {
    const { 
        books, allBooks, activeCategory, setActiveCategory, 
        categories, loading, loadingMore, hasMore 
    } = useContext(BookContext);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get('q') || '';
    const [search, setSearch] = useState(queryParam);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setSearch(queryParam);
    }, [queryParam]);

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        if (!matchesSearch) return false;

        if (activeCategory === 'All') return true;
        if (activeCategory === 'Free') return book.type === 'free';
        if (activeCategory === 'Paid') return book.type === 'paid';
        return book.category === activeCategory;
    });

    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('I want to buy a product')}`;

    return (
        <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
            <SEO
                title="Store | Digital Trusted Zone"
                description="Explore our full collection of premium software and subscriptions."
            />

            <div style={{ marginBottom: '2rem' }}>
                <h1 className="outfit" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Full Store</h1>
                <p style={{ color: 'var(--text-muted)' }}>Browse all premium digital assets with 2x2 progressive loading.</p>
            </div>

            {/* Global Search Bar */}
            <div className="glass-panel" style={{ padding: '0.7rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', position: 'relative', zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search the entire store..."
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
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>
                
                {/* Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-panel"
                            style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '5px', zIndex: 60, overflow: 'hidden' }}
                        >
                            {suggestions.map((book, i) => (
                                <a key={book.id} href={`/product/${book.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', textDecoration: 'none' }}>
                                    <img src={book.image} alt={book.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
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

            <div className="home-main" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem' }}>
                <section>
                    {/* Category Filter for Store */}
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={activeCategory === cat ? 'btn btn-primary' : 'btn'}
                                style={{ padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '2rem', padding: '1rem 0' }}>
                        {loading ? (
                             [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            filteredBooks.length > 0 ? (
                                filteredBooks.map((book, index) => (
                                    <BookCard key={book.id} book={book} index={index} />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                                    <h3>No products found.</h3>
                                </div>
                            )
                        )}
                    </div>

                    {loadingMore && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}
                            />
                        </div>
                    )}
                </section>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <TrustWidget />
                    <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: '14px' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Support</h4>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn whatsapp-btn" style={{ width: '100%', justifyContent: 'center' }}>WhatsApp</a>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Store;
