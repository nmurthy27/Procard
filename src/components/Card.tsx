import { motion } from 'motion/react';
import { Profile } from '../types';
import { Mail, Linkedin, Twitter, Instagram, Phone, Building2, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface CardProps {
  profile: Profile;
  className?: string;
}

export function Card({ profile, className }: CardProps) {
  const themes = {
    modern: "bg-white text-slate-900 shadow-xl border border-slate-100",
    classic: "bg-slate-900 text-white shadow-2xl",
    minimal: "bg-zinc-50 text-zinc-900 border border-zinc-200",
    bold: "bg-indigo-600 text-white shadow-indigo-200 shadow-2xl"
  };

  const themeClass = themes[profile.theme] || themes.modern;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-md rounded-3xl p-8 relative overflow-hidden", themeClass, className)}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <motion.h2 
            className="text-3xl font-bold tracking-tight mb-1"
            layoutId="profile-name"
          >
            {profile.name || "Your Name"}
          </motion.h2>
          <p className="text-lg opacity-80 font-medium">
            {profile.title || "Your Professional Title"}
          </p>
          {profile.company && (
            <div className="flex items-center mt-2 opacity-60 text-sm">
              <Building2 className="w-4 h-4 mr-1.5" />
              {profile.company}
            </div>
          )}
        </div>
        
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 border-2 border-white/20">
          {profile.photoURL ? (
            <img 
              src={profile.photoURL} 
              alt={profile.name} 
              className="w-full h-full object-cover transition-all duration-500" 
              style={{ filter: profile.photoFilter || 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <User className="w-10 h-10" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {profile.bio && (
          <p className="text-sm leading-relaxed opacity-90 italic">
            "{profile.bio}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {profile.email && (
          <div className="flex items-center text-sm opacity-80">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{profile.email}</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center text-sm opacity-80">
            <Phone className="w-4 h-4 mr-2" />
            <span>{profile.phone}</span>
          </div>
        )}
        {profile.linkedin && (
          <div className="flex items-center text-sm opacity-80">
            <Linkedin className="w-4 h-4 mr-2" />
            <span>LinkedIn</span>
          </div>
        )}
        {profile.twitter && (
          <div className="flex items-center text-sm opacity-80">
            <Twitter className="w-4 h-4 mr-2" />
            <span>Twitter</span>
          </div>
        )}
        {profile.instagram && (
          <div className="flex items-center text-sm opacity-80">
            <Instagram className="w-4 h-4 mr-2" />
            <span>Instagram</span>
          </div>
        )}
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}
