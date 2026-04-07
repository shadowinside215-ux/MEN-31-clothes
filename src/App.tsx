/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  LogOut, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Trash2,
  Package,
  Settings
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface ClothingItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  sizes: string[];
  createdAt: any;
}

const CATEGORIES = [
  "MEN 31 Clothes",
  "Sports",
  "Pants & Boots",
  "T-Shirts",
  "Vests",
  "Accessories"
];

// --- Components ---

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth State (Simple local state as requested)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClothingItem[];
      setItems(newItems);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'sam' && password === 'sam2006') {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal selection:bg-gold selection:text-white">
      {/* Admin Toggle */}
      {!isAdmin && (
        <button 
          onClick={() => setShowLogin(true)}
          className="fixed bottom-6 right-6 p-3 bg-navy text-white rounded-full shadow-lg hover:bg-charcoal transition-colors z-50"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-navy text-white p-4 flex justify-between items-center z-50 shadow-md">
          <div className="flex items-center gap-2 font-serif italic">
            <Package className="w-5 h-5 text-gold" />
            <span>Admin Dashboard</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm hover:text-gold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}

      <main className={cn("max-w-7xl mx-auto px-6 py-12", isAdmin && "pt-24")}>
        <AnimatePresence mode="wait">
          {showLogin ? (
            <LoginView 
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
              onLogin={handleLogin}
              onCancel={() => setShowLogin(false)}
            />
          ) : selectedCategory ? (
            <CategoryItemsView 
              category={selectedCategory}
              items={items.filter(i => i.category === selectedCategory)}
              onBack={() => setSelectedCategory(null)}
              isAdmin={isAdmin}
            />
          ) : (
            <CatalogView 
              categories={CATEGORIES}
              onSelectCategory={setSelectedCategory}
              isAdmin={isAdmin}
              items={items}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Admin Add Modal */}
      {isAdmin && !selectedCategory && !showLogin && (
        <AdminAddItem categories={CATEGORIES} />
      )}
    </div>
  );
}

function CatalogView({ 
  categories, 
  onSelectCategory, 
  isAdmin,
  items 
}: { 
  categories: string[], 
  onSelectCategory: (c: string) => void,
  isAdmin: boolean,
  items: ClothingItem[]
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-16"
    >
      <header className="text-center space-y-4">
        <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-navy">
          MEN 31
        </h1>
        <p className="text-gold font-medium tracking-[0.3em] uppercase text-sm">
          Premium Essentials
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, idx) => {
          const categoryItems = items.filter(i => i.category === category);
          const previewImage = categoryItems[0]?.imageUrl || `https://picsum.photos/seed/${category}/800/1000`;
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelectCategory(category)}
              className="group cursor-pointer relative aspect-[3/4] overflow-hidden bg-platinum"
            >
              <img 
                src={previewImage} 
                alt={category}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/40 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-3xl font-serif text-white mb-2 tracking-tight">
                  {category}
                </h2>
                <div className="h-px w-12 bg-gold transition-all duration-500 group-hover:w-24" />
                <span className="mt-4 text-ivory/80 text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  View Collection
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CategoryItemsView({ 
  category, 
  items, 
  onBack,
  isAdmin 
}: { 
  category: string, 
  items: ClothingItem[], 
  onBack: () => void,
  isAdmin: boolean
}) {
  const deleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'items', id));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gold hover:text-navy transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="uppercase tracking-widest text-sm font-bold">Back to Catalog</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-platinum pb-8">
        <h2 className="text-5xl font-serif font-bold text-navy">{category}</h2>
        <p className="text-charcoal/60 uppercase tracking-widest text-xs">
          {items.length} {items.length === 1 ? 'Item' : 'Items'} Found
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <Package className="w-12 h-12 text-platinum mx-auto mb-4" />
          <p className="text-charcoal/40 italic">No items in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="group space-y-4"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-platinum">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {isAdmin && (
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 text-red-600 rounded-full shadow-sm hover:bg-red-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-navy group-hover:text-gold transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-serif text-gold font-bold">
                    ${item.price}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.sizes.map(size => (
                    <span key={size} className="text-[10px] px-2 py-0.5 border border-platinum text-charcoal/60 uppercase tracking-tighter">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LoginView({ username, password, setUsername, setPassword, onLogin, onCancel }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white p-12 shadow-2xl border border-platinum"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-navy mb-2">Admin Login</h2>
        <p className="text-charcoal/40 text-sm">Access the management system</p>
      </div>
      <form onSubmit={onLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-gold">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-ivory border border-platinum focus:border-gold outline-none transition-colors"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-gold">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-ivory border border-platinum focus:border-gold outline-none transition-colors"
            required
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 p-3 border border-platinum text-charcoal hover:bg-ivory transition-colors uppercase text-xs tracking-widest font-bold"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-1 p-3 bg-navy text-white hover:bg-charcoal transition-colors uppercase text-xs tracking-widest font-bold"
          >
            Login
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function AdminAddItem({ categories }: { categories: string[] }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', '46'];

  const toggleSize = (size: string) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleUpload = () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Please configure Cloudinary credentials in the Secrets panel.');
      return;
    }

    // @ts-ignore
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setImageUrl(result.info.secure_url);
        }
      }
    );
    myWidget.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please upload an image');
      return;
    }
    if (sizes.length === 0) {
      alert('Please select at least one size');
      return;
    }

    try {
      await addDoc(collection(db, 'items'), {
        name,
        price: parseFloat(price),
        category,
        imageUrl,
        sizes,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setName('');
      setPrice('');
      setSizes([]);
      setImageUrl('');
    } catch (err) {
      console.error(err);
      alert('Error adding item');
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 left-6 p-4 bg-gold text-white rounded-full shadow-xl hover:bg-navy transition-all z-50 flex items-center gap-2 pr-6 group"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
        <span className="font-bold uppercase tracking-widest text-xs">Add New Item</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-navy text-white flex justify-between items-center">
                <h2 className="text-2xl font-serif">New Catalog Entry</h2>
                <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Item Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-ivory border border-platinum focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Price (USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 bg-ivory border border-platinum focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-ivory border border-platinum focus:border-gold outline-none appearance-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Image</label>
                    <div 
                      onClick={handleUpload}
                      className="aspect-video bg-ivory border-2 border-dashed border-platinum flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors overflow-hidden relative"
                    >
                      {imageUrl ? (
                        <img src={imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-platinum mb-2" />
                          <span className="text-xs text-charcoal/40">Upload via Cloudinary</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "px-3 py-1 text-[10px] border transition-colors",
                            sizes.includes(size) 
                              ? "bg-navy text-white border-navy" 
                              : "border-platinum text-charcoal/60 hover:border-gold"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit"
                    className="w-full p-4 bg-gold text-white font-bold uppercase tracking-[0.2em] text-sm hover:bg-navy transition-colors"
                  >
                    Publish to Catalog
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
