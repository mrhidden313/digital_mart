import { createContext, useState, useEffect, useRef, useCallback } from 'react';
import {
    getBooks, getAllBooks, addBookAPI, updateBookAPI, deleteBookAPI, reorderBooksAPI,
    getSettings, saveSettings,
    getCategoryButtons, saveCategoryButtons, resetToDefaults,

    getCategoriesAPI, addCategoryAPI, deleteCategoryAPI, updateCategoryAPI,
    getTrashAPI, moveToTrashAPI, restoreBookAPI, permanentDeleteBookAPI, emptyTrashAPI,
    getGlobalSettingsAPI, updateGlobalSettingsAPI
} from '../services/api';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth'; // Direct import from SDK
import { auth } from '../services/firebase'; // Import initialized auth instance

const googleProvider = new GoogleAuthProvider();

export const BookContext = createContext();

// Fixed Categories
export const CATEGORIES = [
    'All',
    'Free',
    'Paid'
];

export const WHATSAPP_NUMBER = '923301980891';

export const BookProvider = ({ children }) => {
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [trash, setTrash] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const lastDocRef = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [logo, setLogo] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('923301980891');
    const [cryptoNumber, setCryptoNumber] = useState('923301980891');
    const [easypaisaNumber, setEasypaisaNumber] = useState('923215150976');
    const [whatsappGroup, setWhatsappGroup] = useState('');
    const [categoryButtons, setCategoryButtons] = useState({});
    const [activeCategory, setActiveCategory] = useState('All');
    const [pkrRate, setPkrRate] = useState(278);

    // Categories State
    const [categories, setCategories] = useState(['All', 'Free', 'Paid']); // UI list
    const [customCategories, setCustomCategories] = useState([]); // DB list

    // Ref to track current category for preventing race conditions
    const activeCategoryRef = useRef(activeCategory);
    useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);

    // Ref to prevent parallel fetches (fix for duplicates)
    const isFetchingRef = useRef(false);

    // Progressive Auto-Loading: Load 3 posts, then auto-load next 3, repeat
    const loadNextBatch = useCallback(async (isFirst = false) => {
        // RACE CONDITION GUARD: 
        if (activeCategoryRef.current !== activeCategory) return;

        // PARALLEL FETCH GUARD:
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            if (isFirst) {
                setLoading(true);
                lastDocRef.current = null;
                setHasMore(true);
            } else {
                setLoadingMore(true);
            }

            // Determine filter params
            let filterParam = activeCategory;
            if (!['All', 'Free', 'Paid'].includes(activeCategory)) {
                const children = customCategories.filter(c => c.parent === activeCategory).map(c => c.name);
                if (children.length > 0) {
                    filterParam = [activeCategory, ...children];
                }
            }

            const { books: newBooks, lastDoc, hasMore: more } = await getBooks(lastDocRef.current, filterParam);

            // Checks after await
            if (activeCategoryRef.current !== activeCategory) {
                isFetchingRef.current = false;
                return;
            }

            lastDocRef.current = lastDoc;
            setHasMore(more);

            // DEDUPLICATION LOGIC
            setBooks(prev => {
                const combined = isFirst ? newBooks : [...prev, ...newBooks];
                // Remove duplicates by ID
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique;
            });

            setLoading(false);
            setLoadingMore(false);

            // Release lock
            isFetchingRef.current = false;

            // Auto-load next batch
            if (more) {
                setTimeout(() => {
                    if (activeCategoryRef.current === activeCategory) {
                        loadNextBatch(false);
                    }
                }, 500);
            }
        } catch (e) {
            console.error('Failed to load books', e);
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [activeCategory, customCategories]);

    // Load data on mount & category change
    useEffect(() => {
        setBooks([]); // Strict Clear
        lastDocRef.current = null;
        setHasMore(true);
        isFetchingRef.current = false; // Reset lock

        // Small timeout to ensure state clears before new fetch
        const t = setTimeout(() => {
            loadNextBatch(true);
        }, 10);
        return () => clearTimeout(t);
    }, [activeCategory, loadNextBatch]); // loadNextBatch now depends on activeCategory

    // Initial Load of Meta Data
    useEffect(() => {
        const loadInitialData = async () => {
            // 1. All books for admin
            try {
                const all = await getAllBooks();
                setAllBooks(all);
            } catch (e) { console.error(e); }

            // 2. Categories
            try {
                const dbCats = await getCategoriesAPI();
                setCustomCategories(dbCats);
                const names = dbCats.map(c => c.name);
                setCategories(['All', 'Free', 'Paid', ...names]);
            } catch (e) { console.error(e); }

            // 3. Trash
            try {
                const trashData = await getTrashAPI();
                setTrash(trashData);
            } catch (e) { console.error(e); }

            // 5. Global Config (Firestore)
            const globalSettings = await getGlobalSettingsAPI();
            if (globalSettings) {
                setWhatsappNumber(globalSettings.whatsappNumber || '923301980891');
                setCryptoNumber(globalSettings.cryptoNumber || '923301980891');
                setEasypaisaNumber(globalSettings.easypaisaNumber || '923215150976');
                setLogo(globalSettings.logo || '/logo.png');
                setWhatsappGroup(globalSettings.whatsappGroup || '');
            }

            // 6. Exchange Rate (USD to PKR)
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await res.json();
                if (data && data.rates && data.rates.PKR) {
                    setPkrRate(data.rates.PKR);
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate", err);
            }

            // 7. Old Settings (LocalStorage legacy)
            const settings = getSettings();
            if (!globalSettings) {
                setLogo(settings.logo || '');
            }
            setCategoryButtons(getCategoryButtons());
        };

        loadInitialData();
    }, []);

    const updateGlobalSettings = async (newSettings) => {
        try {
            await updateGlobalSettingsAPI(newSettings);
            if (newSettings.whatsappNumber) setWhatsappNumber(newSettings.whatsappNumber);
            if (newSettings.cryptoNumber) setCryptoNumber(newSettings.cryptoNumber);
            if (newSettings.easypaisaNumber) setEasypaisaNumber(newSettings.easypaisaNumber);
            if (newSettings.logo) setLogo(newSettings.logo);
            if (newSettings.whatsappGroup) setWhatsappGroup(newSettings.whatsappGroup);
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };

    const addBook = async (book) => {
        try {
            const newBook = await addBookAPI(book);
            setBooks(prev => [newBook, ...prev]);
        } catch (e) {
            console.error("Failed to add book", e);
        }
    };

    const updateBook = async (book) => {
        try {
            await updateBookAPI(book);
            setBooks(prev => prev.map(b => b.id === book.id ? book : b));
        } catch (e) {
            console.error("Failed to update book", e);
        }
    };

    const deleteBook = async (id) => {
        try {
            const bookToDelete = books.find(b => b.id === id);
            if (bookToDelete) {
                await moveToTrashAPI(bookToDelete);
                setBooks(prev => prev.filter(b => b.id !== id));
                setTrash(prev => [bookToDelete, ...prev]);
            }
        } catch (e) {
            console.error("Failed to move book to trash", e);
        }
    };

    const restoreBook = async (id) => {
        try {
            const bookToRestore = trash.find(b => b.id === id);
            if (bookToRestore) {
                await restoreBookAPI(bookToRestore);
                setTrash(prev => prev.filter(b => b.id !== id));
                setBooks(prev => [bookToRestore, ...prev]);
            }
        } catch (e) {
            console.error("Failed to restore book", e);
        }
    };

    const permanentDeleteBook = async (id) => {
        try {
            await permanentDeleteBookAPI(id);
            setTrash(prev => prev.filter(b => b.id !== id));
        } catch (e) {
            console.error("Failed to permanently delete book", e);
        }
    };

    const emptyTrash = async () => {
        try {
            await emptyTrashAPI();
            setTrash([]);
        } catch (e) {
            console.error("Failed to empty trash", e);
        }
    };

    const reorderBooks = (newOrder) => {
        setBooks(newOrder);
    };

    const updateLogo = (newLogo) => {
        setLogo(newLogo);
        const settings = getSettings();
        saveSettings({ ...settings, logo: newLogo });
    };

    const updateWhatsappNumber = (num) => {
        setWhatsappNumber(num);
        const settings = getSettings();
        saveSettings({ ...settings, whatsappNumber: num });
    };

    const updateWhatsappGroup = (link) => {
        setWhatsappGroup(link);
        const settings = getSettings();
        saveSettings({ ...settings, whatsappGroup: link });
    };

    const updateCategoryButton = (category, data) => {
        const updated = { ...categoryButtons, [category]: data };
        setCategoryButtons(updated);
        saveCategoryButtons(updated);
    };

    // Category Management
    const addCategory = async (name) => {
        if (categories.includes(name)) return;
        try {
            const newCat = await addCategoryAPI(name);
            setCustomCategories(prev => [...prev, newCat]);
            setCategories(prev => [...prev, name]);
        } catch (e) {
            console.error("Failed to add category", e);
        }
    };

    const updateCategory = async (id, oldName, newName) => {
        try {
            await updateCategoryAPI(id, newName);
            setCustomCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
            setCategories(prev => prev.map(c => c === oldName ? newName : c));
            if (activeCategory === oldName) setActiveCategory(newName);

            const booksToUpdate = books.filter(b => b.category === oldName);
            const updatePromises = booksToUpdate.map(b => updateBookAPI({ ...b, category: newName }));
            await Promise.all(updatePromises);

            setBooks(prev => prev.map(b => b.category === oldName ? { ...b, category: newName } : b));

        } catch (e) {
            console.error("Failed to update category", e);
        }
    };

    const deleteCategory = async (id, name) => {
        try {
            const deletedCat = await deleteCategoryAPI(id);

            setCustomCategories(prev => prev.filter(c => c.id !== id));
            setCategories(prev => prev.filter(c => c !== name));
            if (activeCategory === name) setActiveCategory('All');

            if (deletedCat) {
                setTrash(prev => [{ ...deletedCat, title: `Category: ${deletedCat.name}` }, ...prev]);
            }

            const booksToDelete = books.filter(b => b.category === name);
            if (booksToDelete.length > 0) {
                const deletePromises = booksToDelete.map(b => moveToTrashAPI(b));
                await Promise.all(deletePromises);
                setBooks(prev => prev.filter(b => b.category !== name));
                setTrash(prev => [...booksToDelete, ...prev]);
            }

        } catch (e) {
            console.error("Failed to delete category", e);
        }
    };


    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                // Check if user authenticated via password (Admin) or google (User)
                // AdminLogin uses signInWithEmailAndPassword (password provider)
                const isPass = user.providerData.some(p => p.providerId === 'password');
                setIsAdmin(isPass);
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.message };
        }
    };

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error("Google login failed", error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setIsAdmin(false);
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };


    // -- Currency Helpers --
    const getUsdAmount = (pricePKR) => {
        if (!pricePKR) return 0;
        // Extract numbers and decimals
        const cleanPrice = String(pricePKR).replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanPrice);
        if (isNaN(num)) return 0;
        // Convert PKR to USD
        return (num / pkrRate).toFixed(2);
    };

    const formatDualPrice = (pricePKR, type) => {
        if (type === 'free') return 'Free';
        if (!pricePKR) return 'Ask Price';
        const usd = getUsdAmount(pricePKR);
        return `${pricePKR} ($${usd})`;
    };

    return (
        <BookContext.Provider value={{
            books, allBooks, trash, loading, loadingMore, hasMore,
            addBook, updateBook, deleteBook, reorderBooks,
            restoreBook, permanentDeleteBook, emptyTrash,
            isAdmin, currentUser, authLoading, login, googleLogin, logout,
            logo, updateLogo,
            whatsappNumber, updateWhatsappNumber,
            cryptoNumber, easypaisaNumber, updateGlobalSettings,
            whatsappGroup, updateWhatsappGroup,
            categoryButtons, updateCategoryButton,
            activeCategory, setActiveCategory,

            categories, customCategories, addCategory, deleteCategory, updateCategory,
            resetToDefaults,
            getUsdAmount, formatDualPrice
        }}>
            {children}
        </BookContext.Provider>
    );
};
