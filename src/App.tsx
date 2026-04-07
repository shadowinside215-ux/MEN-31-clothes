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
  Settings,
  Languages
} from 'lucide-react';

// --- Translations ---
const translations = {
  en: {
    title: "MEN 31",
    subtitle: "Premium Essentials",
    viewCollection: "View Collection",
    backToCatalog: "Back to Catalog",
    itemsFound: "Items Found",
    itemFound: "Item Found",
    noItems: "No items in this category yet.",
    adminAccess: "Admin Access",
    signInGoogle: "Sign in with Google",
    cancel: "Cancel",
    logout: "Logout",
    adminDashboard: "Admin Dashboard",
    addNewItem: "Add New Item",
    newCatalogEntry: "New Catalog Entry",
    itemName: "Item Name",
    price: "Price (DH)",
    category: "Category",
    image: "Image",
    uploadCloudinary: "Upload via Cloudinary",
    availableSizes: "Available Sizes",
    publish: "Publish to Catalog",
    changeCover: "Change Category Cover",
    buyNow: "Buy Now",
    categories: {
      "MEN 31 Clothes": "MEN 31 Clothes",
      "Sports": "Sports",
      "Pants & Boots": "Pants & Boots",
      "T-Shirts": "T-Shirts",
      "Vests": "Vests",
      "Accessories": "Accessories"
    }
  },
  fr: {
    title: "MEN 31",
    subtitle: "Essentiels Premium",
    viewCollection: "Voir la Collection",
    backToCatalog: "Retour au Catalogue",
    itemsFound: "Articles Trouvés",
    itemFound: "Article Trouvé",
    noItems: "Aucun article dans cette catégorie pour le moment.",
    adminAccess: "Accès Admin",
    signInGoogle: "Se connecter avec Google",
    cancel: "Annuler",
    logout: "Déconnexion",
    adminDashboard: "Tableau de Bord Admin",
    addNewItem: "Ajouter un Article",
    newCatalogEntry: "Nouvelle Entrée au Catalogue",
    itemName: "Nom de l'Article",
    price: "Prix (DH)",
    category: "Catégorie",
    image: "Image",
    uploadCloudinary: "Télécharger via Cloudinary",
    availableSizes: "Tailles Disponibles",
    publish: "Publier au Catalogue",
    changeCover: "Changer la Couverture",
    buyNow: "Acheter",
    categories: {
      "MEN 31 Clothes": "Vêtements MEN 31",
      "Sports": "Sport",
      "Pants & Boots": "Pantalons & Bottes",
      "T-Shirts": "T-Shirts",
      "Vests": "Gilets",
      "Accessories": "Accessoires"
    }
  },
  ar: {
    title: "MEN 31",
    subtitle: "أساسيات فاخرة",
    viewCollection: "عرض المجموعة",
    backToCatalog: "العودة إلى الكتالوج",
    itemsFound: "قطع تم العثور عليها",
    itemFound: "قطعة تم العثور عليها",
    noItems: "لا توجد قطع في هذه الفئة بعد.",
    adminAccess: "دخول المسؤول",
    signInGoogle: "تسجيل الدخول باستخدام جوجل",
    cancel: "إلغاء",
    logout: "تسجيل الخروج",
    adminDashboard: "لوحة تحكم المسؤول",
    addNewItem: "إضافة قطعة جديدة",
    newCatalogEntry: "إدخال جديد للكتالوج",
    itemName: "اسم القطعة",
    price: "السعر (درهم)",
    category: "الفئة",
    image: "الصورة",
    uploadCloudinary: "رفع عبر كلاوديناري",
    availableSizes: "المقاسات المتاحة",
    publish: "نشر في الكتالوج",
    changeCover: "تغيير غلاف الفئة",
    buyNow: "اشتري الآن",
    categories: {
      "MEN 31 Clothes": "ملابس MEN 31",
      "Sports": "رياضة",
      "Pants & Boots": "سراويل وأحذية",
      "T-Shirts": "تي شيرت",
      "Vests": "صدريات",
      "Accessories": "إكسسوارات"
    }
  }
};

type Language = 'en' | 'fr' | 'ar';
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
  serverTimestamp,
  getDocFromServer,
  setDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { db, auth } from './firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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

interface CategoryConfig {
  id: string;
  categoryName: string;
  coverImageUrl: string;
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
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [configsLoading, setConfigsLoading] = useState(true);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Check if user is admin based on email
      const adminEmail = "dragonballsam86@gmail.com";
      setIsAdmin(currentUser?.email === adminEmail && currentUser?.emailVerified === true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClothingItem[];
      setItems(newItems);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'items');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const configs: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as CategoryConfig;
        configs[data.categoryName] = data.coverImageUrl;
      });
      setCategoryConfigs(configs);
      setConfigsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
      setConfigsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowLogin(false);
    } catch (error) {
      console.error("Login failed", error);
      alert('Login failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-navy text-ivory selection:bg-gold selection:text-navy",
      isRTL ? "font-sans text-right" : "font-sans text-left"
    )} dir={isRTL ? "rtl" : "ltr"}>
      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        {(['en', 'fr', 'ar'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "px-2 py-1 text-[10px] font-bold uppercase tracking-widest border transition-colors",
              lang === l ? "bg-gold text-navy border-gold" : "bg-navy/50 text-ivory border-gold/20 hover:border-gold"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Admin Toggle */}
      {!isAdmin && (
        <button 
          onClick={() => setShowLogin(true)}
          className="fixed bottom-6 right-6 p-3 bg-gold text-navy rounded-full shadow-lg hover:bg-ivory transition-colors z-50"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-charcoal text-ivory p-4 flex justify-between items-center z-50 shadow-md border-b border-gold/20">
          <div className="flex items-center gap-2 font-serif italic">
            <Package className="w-5 h-5 text-gold" />
            <span>{t.adminDashboard}</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm hover:text-gold transition-colors"
          >
            <LogOut className="w-4 h-4" /> {t.logout}
          </button>
        </div>
      )}

      <main className={cn("max-w-7xl mx-auto px-6 py-12", isAdmin && "pt-24")}>
        {(loading || configsLoading) ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {showLogin ? (
              <LoginView 
                onLogin={handleLogin}
                onCancel={() => setShowLogin(false)}
                t={t}
              />
            ) : selectedCategory ? (
              <CategoryItemsView 
                category={selectedCategory}
                items={items.filter(i => i.category === selectedCategory)}
                onBack={() => setSelectedCategory(null)}
                isAdmin={isAdmin}
                t={t}
                isRTL={isRTL}
              />
            ) : (
              <CatalogView 
                categories={CATEGORIES}
                onSelectCategory={setSelectedCategory}
                isAdmin={isAdmin}
                items={items}
                categoryConfigs={categoryConfigs}
                t={t}
              />
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Admin Add Modal */}
      {isAdmin && !selectedCategory && !showLogin && (
        <AdminAddItem categories={CATEGORIES} t={t} />
      )}
    </div>
  );
}

function CatalogView({ 
  categories, 
  onSelectCategory, 
  isAdmin,
  items,
  categoryConfigs,
  t
}: { 
  categories: string[], 
  onSelectCategory: (c: string) => void,
  isAdmin: boolean,
  items: ClothingItem[],
  categoryConfigs: Record<string, string>,
  t: any
}) {
  const handleCategoryCoverUpload = (category: string) => {
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
        cropping: true,
        croppingAspectRatio: 0.75, // 3:4 ratio
        showSkipCropButton: false
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          try {
            // Use category name as ID for simplicity
            const categoryId = category.replace(/\s+/g, '-').toLowerCase();
            await setDoc(doc(db, 'categories', categoryId), {
              categoryName: category,
              coverImageUrl: imageUrl
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `categories/${category}`);
          }
        }
      }
    );
    myWidget.open();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-16"
    >
      <header className="text-center space-y-4">
        <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-gold">
          {t.title}
        </h1>
        <p className="text-ivory font-medium tracking-[0.3em] uppercase text-sm">
          {t.subtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, idx) => {
          const categoryItems = items.filter(i => i.category === category);
          const configuredCover = categoryConfigs[category];
          const previewImage = configuredCover || categoryItems[0]?.imageUrl || `https://picsum.photos/seed/${category}/800/1000`;
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer relative aspect-[3/4] overflow-hidden bg-charcoal"
            >
              <div 
                onClick={() => onSelectCategory(category)}
                className="w-full h-full"
              >
                <img 
                  src={previewImage} 
                  alt={category}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/60 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <h2 className="text-3xl font-serif text-ivory mb-2 tracking-tight">
                    {t.categories[category as keyof typeof t.categories] || category}
                  </h2>
                  <div className="h-px w-12 bg-gold transition-all duration-500 group-hover:w-24" />
                  <span className="mt-4 text-gold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.viewCollection}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryCoverUpload(category);
                  }}
                  className="absolute top-4 right-4 p-2 bg-gold text-navy rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ivory"
                  title={t.changeCover}
                >
                  <Upload className="w-4 h-4" />
                </button>
              )}
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
  isAdmin,
  t,
  isRTL
}: { 
  category: string, 
  items: ClothingItem[], 
  onBack: () => void,
  isAdmin: boolean,
  t: any,
  isRTL: boolean
}) {
  const deleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'items', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `items/${id}`);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
      className="space-y-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gold hover:text-ivory transition-colors group"
      >
        {isRTL ? <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /> : <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />}
        <span className="uppercase tracking-widest text-sm font-bold">{t.backToCatalog}</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gold/20 pb-8">
        <h2 className="text-5xl font-serif font-bold text-gold">{t.categories[category as keyof typeof t.categories] || category}</h2>
        <p className="text-ivory/60 uppercase tracking-widest text-xs">
          {items.length} {items.length === 1 ? t.itemFound : t.itemsFound}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <Package className="w-12 h-12 text-charcoal mx-auto mb-4" />
          <p className="text-ivory/40 italic">{t.noItems}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {items.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="group space-y-4"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {isAdmin && (
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute top-4 right-4 p-2 bg-navy/90 text-red-400 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-ivory group-hover:text-gold transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-serif text-gold font-bold">
                      {item.price} DH
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.sizes.map(size => (
                      <span key={size} className="text-[10px] px-2 py-0.5 border border-gold/30 text-gold uppercase tracking-tighter">
                        {size}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4">
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=MAGASIN+2,+RESIDENCE+SALIMA+2,+MAHAJ+SALA+LJADIDA,+Av.+Moulay+Rachid,+Sala+Al+Jadida+11100"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-gold text-navy text-center block text-xs font-bold uppercase tracking-widest hover:bg-ivory transition-colors"
                    >
                      {t.buyNow}
                    </a>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LoginView({ onLogin, onCancel, t }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-charcoal p-12 shadow-2xl border border-gold/20"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-gold mb-2">{t.adminAccess}</h2>
        <p className="text-ivory/40 text-sm">{t.signInGoogle}</p>
      </div>
      <div className="space-y-6">
        <button 
          onClick={onLogin}
          className="w-full p-4 bg-gold text-navy hover:bg-ivory transition-colors uppercase text-xs tracking-widest font-bold flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          {t.signInGoogle}
        </button>
        <button 
          onClick={onCancel}
          className="w-full p-3 border border-gold/20 text-ivory hover:bg-navy transition-colors uppercase text-xs tracking-widest font-bold"
        >
          {t.cancel}
        </button>
      </div>
    </motion.div>
  );
}

function AdminAddItem({ categories, t }: { categories: string[], t: any }) {
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
      handleFirestoreError(err, OperationType.WRITE, 'items');
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 left-6 p-4 bg-gold text-navy rounded-full shadow-xl hover:bg-ivory transition-all z-50 flex items-center gap-2 pr-6 group"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
        <span className="font-bold uppercase tracking-widest text-xs">{t.addNewItem}</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-navy/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-charcoal shadow-2xl overflow-hidden border border-gold/20"
            >
              <div className="p-8 bg-navy text-gold flex justify-between items-center border-b border-gold/20">
                <h2 className="text-2xl font-serif">{t.newCatalogEntry}</h2>
                <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">{t.itemName}</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-navy border border-gold/20 focus:border-gold outline-none text-ivory"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">{t.price}</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 bg-navy border border-gold/20 focus:border-gold outline-none text-ivory"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">{t.category}</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 bg-navy border border-gold/20 focus:border-gold outline-none appearance-none text-ivory"
                      >
                        {categories.map(c => <option key={c} value={c}>{t.categories[c as keyof typeof t.categories] || c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">{t.image}</label>
                    <div 
                      onClick={handleUpload}
                      className="aspect-video bg-navy border-2 border-dashed border-gold/20 flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors overflow-hidden relative"
                    >
                      {imageUrl ? (
                        <img src={imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gold/40 mb-2" />
                          <span className="text-[10px] text-gold/40 uppercase tracking-widest">{t.uploadCloudinary}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gold">{t.availableSizes}</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "px-3 py-1 text-[10px] border transition-colors",
                            sizes.includes(size) 
                              ? "bg-gold text-navy border-gold" 
                              : "border-gold/20 text-gold/60 hover:border-gold"
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
                    className="w-full p-4 bg-gold text-navy font-bold uppercase tracking-[0.2em] text-sm hover:bg-ivory transition-colors"
                  >
                    {t.publish}
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
