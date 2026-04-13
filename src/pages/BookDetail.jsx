import { useParams, Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { BookContext } from '../context/BookContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Tag, Share2, MessageCircle, Copy, Check } from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import BookCard from '../components/BookCard';

const BookDetail = () => {
    const { id } = useParams();
    const { books, whatsappNumber, whatsappGroup, formatDualPrice, getUsdAmount, cryptoNumber, easypaisaNumber } = useContext(BookContext);
    const book = books.find(b => String(b.id) === String(id));

    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const [checkoutOrderId, setCheckoutOrderId] = useState(null);
    const [redirectTimer, setRedirectTimer] = useState(5);

    const [countdown, setCountdown] = useState(15);
    const [canDownload, setCanDownload] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        if (book?.type === 'free' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanDownload(true);
        }
    }, [countdown, book]);

    // Auto WhatsApp redirect after payment
    useEffect(() => {
        if (!purchaseComplete || !checkoutOrderId) return;
        if (redirectTimer <= 0) {
            const msg = `✅ Payment Confirmed!

Hello, I just paid for *${book?.title}* via PayPal.

🧾 Transaction ID: ${checkoutOrderId}

Please send me the access/delivery. Thank you!`;
            const waNumber = whatsappNumber || '923301980891';
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
            return;
        }
        const t = setTimeout(() => setRedirectTimer(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [purchaseComplete, checkoutOrderId, redirectTimer]);

    if (!book) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}><h2>Product not found</h2><Link to="/" className="btn" style={{ marginTop: '1rem', display: 'inline-block' }}>Go Home</Link></div>;

    const relatedBooks = books.filter(b => b.category === book.category && b.id !== book.id).slice(0, 3);

    const whatsappMessage = book.whatsappText
        ? book.whatsappText
        : `I want to buy "${book.title}" from Digital Trusted Zone`;

    const whatsappLink = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
        : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className="container" style={{ padding: '6rem 1rem 3rem' }}>
            <SEO
                title={`${book.title} | Digital Trusted Zone`}
                description={`Get ${book.title}. Premium software/course. Price: ${formatDualPrice(book.price, book.type)}. Instant delivery via WhatsApp.`}
                image={book.image}
            />
            <Link to="/" className="btn" style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back to Products
            </Link>

            <article className="glass-panel" style={{ padding: 'clamp(1.2rem, 4vw, 3rem)', borderRadius: '24px' }}>
                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div className="book-detail-meta" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} /> {book.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Tag size={14} /> {book.category}</span>
                    </div>
                    <h1 className="outfit" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{book.title}</h1>
                    <img src={book.image} alt={book.title} loading="lazy" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px' }} />
                </header>

                <div
                    className="blog-content"
                    style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-primary)', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.content, { ADD_ATTR: ['target', 'class', 'style'] }) }}
                />

                {/* Action Area */}
                <div style={{ marginTop: '3rem', padding: 'clamp(1.2rem, 3vw, 3rem)', background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                    {book.type === 'paid' ? (
                        <>
                            <h2 className="outfit" style={{ marginBottom: '1rem' }}>Unlock Premium Access</h2>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                                {formatDualPrice(book.price, book.type)}
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                                Get instant access to {book.title} with full warranty and support.
                            </p>

                            {purchaseComplete ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(45,212,191,0.08))', border: '2px solid #22c55e', borderRadius: '20px', color: 'var(--text-primary)', textAlign: 'center' }}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                                    <h3 style={{ color: '#22c55e', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Payment Successful!</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                                        Order ID: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', color: 'var(--primary)' }}>{checkoutOrderId}</code>
                                    </p>
                                    <div style={{ margin: '1.2rem 0', padding: '1rem', background: 'rgba(37,211,102,0.08)', borderRadius: '12px', border: '1px solid rgba(37,211,102,0.2)' }}>
                                        <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Redirecting to WhatsApp in...</p>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#22c55e' }}>{redirectTimer}</div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Transaction ID will be auto-typed in the chat</p>
                                    </div>
                                    <a
                                        href={`https://wa.me/${whatsappNumber || '923301980891'}?text=${encodeURIComponent(`✅ Payment Confirmed!

Hello, I just paid for *${book.title}* via PayPal.

🧾 Transaction ID: ${checkoutOrderId}

Please send me the access/delivery. Thank you!`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn"
                                        style={{ background: '#25D366', color: 'white', fontWeight: 700, marginTop: '0.5rem' }}
                                    >
                                        Open WhatsApp Now →
                                    </a>
                                </motion.div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                                    <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                                        <PayPalButtons
                                            style={{ layout: "vertical", shape: "rect" }}
                                            createOrder={(data, actions) => {
                                                const finalUsdPrice = getUsdAmount(book.price);
                                                // Safety fallback
                                                const chargeAmount = parseFloat(finalUsdPrice) || 1.00;
                                                
                                                return actions.order.create({
                                                    purchase_units: [
                                                        {
                                                            description: book.title,
                                                            amount: { value: chargeAmount.toString() },
                                                        },
                                                    ],
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                try {
                                                    const order = await actions.order.capture();
                                                    toast.success("Payment successful! Redirecting to WhatsApp...");
                                                    setCheckoutOrderId(order.id);
                                                    setPurchaseComplete(true);
                                                    setRedirectTimer(5);
                                                } catch (err) {
                                                    toast.error("Transaction failed during capture.");
                                                }
                                            }}
                                            onError={(err) => {
                                                toast.error("PayPal encountered an error. Try again.");
                                            }}
                                        />
                                    </div>

                                    <a href={`https://wa.me/${cryptoNumber || '923301980891'}?text=${encodeURIComponent(`hello dear i want to acces ${book.title} with crypto payment method`)}`} 
                                       target="_blank" rel="noopener noreferrer" 
                                       className="btn" style={{ width: '100%', padding: '0.8rem', background: '#F7931A', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', justifyContent: 'center' }}>
                                        Pay with Crypto
                                    </a>

                                    <a href={`https://wa.me/${easypaisaNumber || '923215150976'}?text=${encodeURIComponent(`hello dear i want to acces ${book.title} with easypaisa payment method`)}`} 
                                       target="_blank" rel="noopener noreferrer" 
                                       className="btn" style={{ width: '100%', padding: '0.8rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', justifyContent: 'center' }}>
                                        Pay with Easypaisa
                                    </a>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="outfit" style={{ marginBottom: '1rem' }}>Get This For Free</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Join our community to get this instantly!
                            </p>

                            {book.downloadUrl && (
                                <a
                                    href={book.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{
                                        width: '100%', maxWidth: '300px', margin: '0 auto 1rem',
                                        justifyContent: 'center', padding: '0.8rem 2rem',
                                        fontSize: '1rem', background: 'var(--primary)',
                                        color: 'white', boxShadow: '0 0 20px rgba(22, 163, 74, 0.3)'
                                    }}
                                >
                                    Download Content
                                </a>
                            )}

                            <a
                                href={whatsappGroup || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn whatsapp-btn"
                                style={{ padding: '0.8rem 2rem', fontSize: '1rem', width: '100%', maxWidth: '300px', justifyContent: 'center' }}
                            >
                                Join WhatsApp Group
                            </a>
                        </>
                    )}
                </div>

                {/* Share Section */}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <button onClick={() => {
                        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out "${book.title}" 👉 ${window.location.href}`)}`, '_blank');
                    }} style={{
                        padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid #25d366',
                        background: 'rgba(37,211,102,0.1)', color: '#25d366', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500'
                    }}>
                        <MessageCircle size={16} /> Share on WhatsApp
                    </button>
                    <button onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }} style={{
                        padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500'
                    }}>
                        {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                    </button>
                    {navigator.share && (
                        <button onClick={() => {
                            navigator.share({ title: book.title, text: book.excerpt || book.title, url: window.location.href }).catch(() => { });
                        }} style={{
                            padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500'
                        }}>
                            <Share2 size={16} /> Share
                        </button>
                    )}
                </div>
            </article>

            {/* Related Books */}
            {relatedBooks.length > 0 && (
                <section style={{ marginTop: '3rem' }}>
                    <h2 className="outfit" style={{ marginBottom: '1.5rem' }}>Related Products</h2>
                    <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {relatedBooks.map(b => <BookCard key={b.id} book={b} />)}
                    </div>
                </section>
            )}
        </div>
    );
};

export default BookDetail;
