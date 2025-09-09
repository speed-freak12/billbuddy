import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc, onSnapshot, query, setDoc, getDoc, setLogLevel } from 'firebase/firestore';

// --- Firebase and App Config ---
const firebaseConfig = {
  apiKey: "AIzaSyBS2ozSgAt-8bYeuGmORcdoGvyl0KIDG_A",
  authDomain: "billbuddy12.firebaseapp.com",
  projectId: "billbuddy12",
  storageBucket: "billbuddy12.firebasestorage.app",
  messagingSenderId: "352696913198",
  appId: "1:352696913198:web:da11158c95df05b21efebf",
  measurementId: "G-4LG1XN59M6"
};
const appId = firebaseConfig.projectId;``
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// setLogLevel('debug'); // Uncomment for detailed Firestore logs

// --- Currency Data ---
const currencies = [
    { code: 'INR', symbol: '₹' }, { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, 
    { code: 'JPY', symbol: '¥' }, { code: 'GBP', symbol: '£' }, { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' }, { code: 'CHF', symbol: 'CHF' }, { code: 'CNY', symbol: '¥' },
    { code: 'SEK', symbol: 'kr' }, { code: 'NZD', symbol: 'NZ$' }, { code: 'MXN', symbol: 'Mex$' },
    { code: 'SGD', symbol: 'S$' }, { code: 'HKD', symbol: 'HK$' }, { code: 'NOK', symbol: 'kr' },
    { code: 'KRW', symbol: '₩' }, { code: 'TRY', symbol: '₺' }, { code: 'RUB', symbol: '₽' },
    { code: 'BRL', symbol: 'R$' }, { code: 'ZAR', symbol: 'R' }, { code: 'DKK', symbol: 'kr' },
    { code: 'PLN', symbol: 'zł' }, { code: 'TWD', symbol: 'NT$' }, { code: 'THB', symbol: '฿' },
    { code: 'IDR', symbol: 'Rp' }, { code: 'HUF', symbol: 'Ft' }, { code: 'CZK', symbol: 'Kč' },
    { code: 'ILS', symbol: '₪' }, { code: 'CLP', symbol: 'CLP$' }, { code: 'PHP', symbol: '₱' },
    { code: 'AED', symbol: 'د.إ' }, { code: 'COP', symbol: 'COL$' }, { code: 'SAR', symbol: '﷼' },
    { code: 'MYR', symbol: 'RM' }, { code: 'RON', symbol: 'lei' }, { code: 'ARS', symbol: 'ARS$' },
    { code: 'VND', symbol: '₫' }, { code: 'NGN', symbol: '₦' }, { code: 'UAH', symbol: '₴' },
    { code: 'BDT', symbol: '৳' }, { code: 'PKR', symbol: '₨' }, { code: 'EGP', symbol: 'E£' },
    { code: 'IQD', symbol: 'ع.د' }, { code: 'QAR', symbol: 'ر.ق' }, { code: 'KWD', symbol: 'د.ك' },
    { code: 'OMR', symbol: 'ر.ع.' }, { code: 'JOD', symbol: 'د.א' }, { code: 'BHD', symbol: 'ب.د' },
    { code: 'LKR', symbol: 'රු' },
];

// --- Helper Functions ---
const getNextDueDate = (startDate, cycle) => {
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return new Date(); // Return today if invalid date
    
    const now = new Date();
    // If the due date is in the past, advance it to the future
    while (date < now) {
        switch (cycle) {
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'annually':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                return date; // Should not happen
        }
    }
    return date;
};

// --- React Components ---

const Header = ({ total, currencyCode, onSettingsClick }) => {
    const currencySymbol = currencies.find(c => c.code === currencyCode)?.symbol || '₹';
    return (
        <header className="bg-gray-800 text-white p-6 rounded-lg shadow-lg mb-8 relative">
            <h1 className="text-4xl font-bold text-center">Bill Buddy</h1>
            <p className="text-center text-gray-300 mt-2">Your Personal Subscription Tracker</p>
            <div className="mt-6 bg-blue-500 p-4 rounded-lg text-center">
                <h2 className="text-lg font-semibold text-blue-100">Estimated Monthly Total</h2>
                <p className="text-4xl font-bold text-white mt-1">
                    {currencySymbol}{total.toFixed(2)}
                </p>
            </div>
            <button onClick={onSettingsClick} className="absolute top-4 right-4 text-white hover:text-gray-300 transition" aria-label="Open Settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </header>
    );
};

const AddSubscriptionForm = ({ userId }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [cycle, setCycle] = useState('monthly');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const commonSubscriptions = ['Netflix', 'Amazon Prime', 'Hotstar', 'Electricity', 'Phone Recharge', 'Internet'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !amount || !dueDate) {
            setError('Please fill out all fields.');
            return;
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        setError('');
        
        try {
            const subsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'subscriptions');
            await addDoc(subsCollectionRef, {
                name,
                amount: numericAmount,
                cycle,
                startDate: dueDate,
            });
            setName('');
            setAmount('');
            setCycle('monthly');
            setDueDate(new Date().toISOString().split('T')[0]);
        } catch(err) {
            console.error("Error adding document: ", err);
            setError('Failed to add subscription. Please try again.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Add New Subscription</h2>
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Quick Add:</p>
                <div className="flex flex-wrap gap-2">
                    {commonSubscriptions.map(subName => (
                        <button
                            key={subName}
                            type="button"
                            onClick={() => setName(subName)}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {subName}
                        </button>
                    ))}
                </div>
            </div>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="flex flex-col">
                    <label htmlFor="name" className="text-sm font-medium text-gray-600 mb-1">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Netflix" className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="amount" className="text-sm font-medium text-gray-600 mb-1">Amount</label>
                    <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 12.99" step="0.01" className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="cycle" className="text-sm font-medium text-gray-600 mb-1">Billing Cycle</label>
                    <select id="cycle" value={cycle} onChange={(e) => setCycle(e.target.value)} className="p-3 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none transition">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="annually">Annually</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="due-date" className="text-sm font-medium text-gray-600 mb-1">First Due Date</label>
                    <input type="date" id="due-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" />
                </div>
                <button type="submit" className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition shadow-sm w-full lg:col-span-1">Add Bill</button>
            </form>
        </div>
    );
};

const SubscriptionList = ({ subscriptions, onDelete, currencyCode }) => {
    const currencySymbol = currencies.find(c => c.code === currencyCode)?.symbol || '₹';
    const sortedSubs = [...subscriptions].sort((a, b) => a.nextDueDate - b.nextDueDate);

    if (subscriptions.length === 0) {
        return (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <p className="text-gray-500">No subscriptions added yet. Add one to get started!</p>
            </div>
        );
    }
    
    const isDueSoon = (date) => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        return date >= today && date <= sevenDaysFromNow;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-2xl font-bold mb-4 text-gray-700">Your Subscriptions</h2>
            <div className="space-y-4">
                {sortedSubs.map(sub => {
                    const dueDate = sub.nextDueDate.toLocaleDateString('en-CA');
                    const dueSoon = isDueSoon(sub.nextDueDate);

                    return (
                        <div key={sub.id} className={`p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${dueSoon ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-gray-50'}`}>
                           <div className="flex-1 text-center md:text-left">
                                <p className="font-bold text-lg text-gray-800">{sub.name}</p>
                                {dueSoon && <p className="text-sm font-semibold text-yellow-700">Due Soon!</p>}
                           </div>
                            <div className="flex-1 text-center md:text-left text-gray-600">
                                <p>Next Bill: <span className="font-medium text-gray-800">{dueDate}</span></p>
                            </div>
                           <div className="flex-1 text-center md:text-left text-gray-600">
                                <p className="capitalize">{sub.cycle}</p>
                           </div>
                            <div className="flex-1 text-center md:text-right font-bold text-xl text-blue-600">
                               {currencySymbol}{sub.amount.toFixed(2)}
                            </div>
                            <button onClick={() => onDelete(sub.id)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all font-semibold">
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, userId, currency, onCurrencyChange }) => {
    if (!isOpen) return null;
    const [activeTab, setActiveTab] = useState('account');

    const TabButton = ({ tabName, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition" aria-label="Close settings">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6 border-b">
                        <nav className="flex space-x-2">
                            <TabButton tabName="account">Account</TabButton>
                            <TabButton tabName="payments">Payments</TabButton>
                            <TabButton tabName="currency">Currency</TabButton>
                        </nav>
                    </div>
                    <div>
                        {activeTab === 'account' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Account Details</h3>
                                <p className="text-gray-600 text-sm">Your data is stored privately and associated with this unique user ID.</p>
                                <div className="mt-4 bg-gray-100 p-3 rounded-md text-gray-800 text-xs break-all">
                                    {userId}
                                </div>
                            </div>
                        )}
                        {activeTab === 'payments' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Settings</h3>
                                <p className="text-gray-500 text-center p-4">Payment integration features are coming soon!</p>
                            </div>
                        )}
                        {activeTab === 'currency' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Display Currency</h3>
                                <div className="flex items-center">
                                    <label htmlFor="currency-select" className="text-sm font-medium text-gray-600 mr-3">
                                        Select Currency:
                                    </label>
                                    <select
                                        id="currency-select"
                                        value={currency}
                                        onChange={onCurrencyChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.code}>
                                                {c.code} - {c.symbol}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="bg-gray-50 p-4 text-right rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('INR');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    const userCredential = await signInAnonymously(auth);
                    setUserId(userCredential.user.uid);
                } catch (error) {
                     console.error("Anonymous sign-in failed:", error);
                     setLoading(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchSettings = async () => {
             const settingsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'main');
             try {
                const docSnap = await getDoc(settingsDocRef);
                if (docSnap.exists() && docSnap.data().currency) {
                    setCurrency(docSnap.data().currency);
                }
             } catch(err) {
                 console.error("Error fetching settings:", err);
             }
        };

        fetchSettings();

        const subsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'subscriptions');
        const q = query(subsCollectionRef);
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const subsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                nextDueDate: getNextDueDate(doc.data().startDate, doc.data().cycle),
            }));
            setSubscriptions(subsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching subscriptions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleDelete = async (id) => {
        if(!userId) return;
        try {
            const subDocRef = doc(db, 'artifacts', appId, 'users', userId, 'subscriptions', id);
            await deleteDoc(subDocRef);
        } catch(err) {
            console.error("Error deleting document: ", err);
        }
    };
    
    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        if (!userId) return;
        
        const settingsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'main');
        try {
            await setDoc(settingsDocRef, { currency: newCurrency }, { merge: true });
        } catch(err) {
            console.error("Error saving settings:", err);
        }
    };

    const totalMonthlyCost = useMemo(() => {
        return subscriptions.reduce((total, sub) => {
            switch (sub.cycle) {
                case 'weekly':
                    return total + sub.amount * 4.33; // Average weeks in a month
                case 'monthly':
                    return total + sub.amount;
                case 'annually':
                    return total + sub.amount / 12;
                default:
                    return total;
            }
        }, 0);
    }, [subscriptions]);
    
    if (loading && !userId) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-gray-600">Loading Bill Buddy...</p>
            </div>
        );
    }
    
    if(!userId) {
         return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-red-600">Could not authenticate. Please refresh the page.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-8">
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                userId={userId}
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
            />
            <div className="max-w-4xl mx-auto">
                <Header 
                    total={totalMonthlyCost} 
                    currencyCode={currency} 
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />
                <main>
                    <AddSubscriptionForm userId={userId} />
                    <SubscriptionList subscriptions={subscriptions} onDelete={handleDelete} currencyCode={currency} />
                </main>
                 <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>Powered by React & Firebase</p>
                </footer>
            </div>
        </div>
    );
}


