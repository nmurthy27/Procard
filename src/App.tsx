import { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, serverTimestamp, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Profile } from './types';
import { Card } from './components/Card';
import { QRSection } from './components/QRSection';
import { BioEditor } from './components/BioEditor';
import { PhotoSection } from './components/PhotoSection';
import { cn } from './lib/utils';
import { downloadVCard } from './lib/vcard';
import { 
  LogOut, 
  Settings, 
  Plus, 
  User as UserIcon, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Check for public profile view in URL
  const queryParams = new URLSearchParams(window.location.search);
  const publicId = queryParams.get('id');
  const [view] = useState<'dashboard' | 'public'>(publicId ? 'public' : 'dashboard');
  const [publicProfile, setPublicProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Load user profile
        const docRef = doc(db, 'profiles', u.uid);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `profiles/${u.uid}`);
          return;
        }
        
        if (docSnap && docSnap.exists()) {
          setProfile(docSnap.data() as Profile);
        } else {
          // Initialize fresh profile
          const newProfile: Profile = {
            userId: u.uid,
            name: u.displayName || '',
            title: '',
            company: '',
            bio: '',
            linkedin: '',
            twitter: '',
            instagram: '',
            email: u.email || '',
            phone: '',
            photoURL: u.photoURL || '',
            theme: 'modern'
          };
          try {
            await setDoc(docRef, { ...newProfile, updatedAt: serverTimestamp() });
            setProfile(newProfile);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `profiles/${u.uid}`);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch public profile if ID present in URL
  useEffect(() => {
    if (publicId) {
      const fetchPublic = async () => {
        const docRef = doc(db, 'profiles', publicId);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPublicProfile(docSnap.data() as Profile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `profiles/${publicId}`);
        }
      };
      fetchPublic();
    }
  }, [publicId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    
    const docRef = doc(db, 'profiles', user.uid);
    try {
      await setDoc(docRef, { ...newProfile, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `profiles/${user.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Public View
  if (view === 'public' && publicProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-md"
        >
          <Card profile={publicProfile} className="mb-8" />

          <div className="grid grid-cols-1 gap-3 mb-12">
            <button 
              onClick={() => downloadVCard(publicProfile)}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
            >
              <UserPlus className="w-5 h-5" />
              Save to Phone Book
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              {publicProfile.linkedin && (
                <a 
                  href={publicProfile.linkedin.startsWith('http') ? publicProfile.linkedin : `https://linkedin.com/in/${publicProfile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  LinkedIn
                </a>
              )}
              {publicProfile.twitter && (
                <a 
                  href={`https://twitter.com/${publicProfile.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  <Twitter className="w-4 h-4 text-slate-900" />
                  Follow
                </a>
              )}
            </div>
          </div>

          <div className="text-center">
             <button 
               onClick={() => window.location.href = window.location.origin}
               className="text-sm font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
             >
               Create your own ProCard <ChevronRight className="w-4 h-4 inline" />
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Auth Guard / Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Networking Card
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Your digital first <br /> impression, <span className="text-indigo-600">perfected.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
            Create a professional digital business card in seconds with AI-assisted bios and built-in CRM features.
          </p>
          <button
            onClick={signInWithGoogle}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-2xl focus:outline-none hover:bg-slate-800"
          >
            Get Started with Google
            <Plus className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left opacity-80">
            <div>
              <h3 className="font-bold mb-2">Instant QR</h3>
              <p className="text-sm text-slate-500">Scan to share contact details directly into your recipient's phone.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">AI Enhancement</h3>
              <p className="text-sm text-slate-500">Gemini improves your headline and bio for maximum professional impact.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Private CRM</h3>
              <p className="text-sm text-slate-500">Keep track of everyone you meet with private notes and dates.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ProCard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => signOut(auth)}
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-indigo-100 p-0.5 overflow-hidden">
            <img src={user.photoURL || ''} alt="" className="w-full h-full rounded-full" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Editor / Card Preview Toggle (Mobile First Idea) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Your Insights</h2>
              <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            </div>

            <div className="mb-10 pb-10 border-b border-slate-50">
              {profile && (
                <PhotoSection 
                  photoURL={profile.photoURL} 
                  name={profile.name}
                  photoFilter={profile.photoFilter}
                  onUpdate={(updates) => updateProfile(updates)} 
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={profile?.name} 
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Professional Title</label>
                  <input 
                    type="text" 
                    value={profile?.title} 
                    onChange={(e) => updateProfile({ title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Company</label>
                  <input 
                    type="text" 
                    value={profile?.company} 
                    onChange={(e) => updateProfile({ company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                 <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={profile?.email} 
                    onChange={(e) => updateProfile({ email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">LinkedIn Profile</label>
                  <input 
                    type="text" 
                    value={profile?.linkedin} 
                    onChange={(e) => updateProfile({ linkedin: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Twitter / X</label>
                  <input 
                    type="text" 
                    value={profile?.twitter} 
                    onChange={(e) => updateProfile({ twitter: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Instagram</label>
                  <input 
                    type="text" 
                    value={profile?.instagram} 
                    onChange={(e) => updateProfile({ instagram: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    placeholder="@username"
                  />
                </div>
                <div>
                   <label className="text-sm font-semibold text-slate-700 block mb-1.5">Theme</label>
                   <div className="flex gap-2">
                     {(['modern', 'classic', 'minimal', 'bold'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => updateProfile({ theme: t })}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg border-2 capitalize transition-all",
                            profile?.theme === t ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {t}
                        </button>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {profile && (
                <BioEditor 
                  value={profile.bio} 
                  name={profile.name} 
                  title={profile.title}
                  onChange={(bio) => updateProfile({ bio })} 
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Incoming Connections</span>
            </div>
            <div className="text-center py-12">
               <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-slate-300" />
               </div>
               <p className="text-slate-400 font-medium">No connections yet. Share your card to start networking!</p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-8">
          <div className="sticky top-8 space-y-8">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Preview</span>
              </div>
              {profile && <Card profile={profile} />}
              
              <div className="mt-12 w-full">
                <QRSection url={`${window.location.origin}?id=${user.uid}`} />
              </div>
              
              <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold text-sm">
                 <LinkIcon className="w-4 h-4" />
                 <a 
                   href={`${window.location.origin}?id=${user.uid}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="hover:underline flex items-center gap-1"
                 >
                   View Public Profile
                   <ExternalLink className="w-3 h-3" />
                 </a>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 pb-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-sm font-medium">
          <p>© 2026 ProCard AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
