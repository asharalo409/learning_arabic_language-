import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import skyMosqueImg from '../assets/images/theme_bright_sky_mosque_1794521633239.jpg';

export const WelcomeOverlay: React.FC = () => {
  const { welcomeOpen, dismissWelcome, triggerSound } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!welcomeOpen) return null;

  const handleEnterAcademy = (targetPath?: string) => {
    triggerSound('welcome', true);
    dismissWelcome();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4 no-print overflow-y-auto">
      <div
        className="rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative my-auto text-white border border-white/25"
        style={{
          background: 'linear-gradient(180deg, #0b2315 0%, #143822 100%)',
        }}
      >
        <button
          type="button"
          onClick={() => handleEnterAcademy()}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Scenic Mosque + Bright Sky Top Photo (Image 3 Welcome aesthetic) */}
        <div className="relative h-56 w-full">
          <img
            src={skyMosqueImg}
            alt="Masjid under luminous bright sky"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(11,35,21,0.12) 0%, rgba(11,35,21,0.55) 65%, #0e2c1a 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-3 px-6 text-center">
            <p className="font-arabic text-3xl text-amber-200 drop-shadow" dir="rtl">
              أَهْلًا وَسَهْلًا وَمَرْحَبًا
            </p>
          </div>
        </div>

        {/* Clean Minimal Body + Pill CTAs */}
        <div className="p-6 sm:p-7 pt-3 space-y-5 text-center">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight">আহলান ওয়া সাহলান</h2>
            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
              আধুনিক ও কুরআনিক আরবি শিক্ষার পূর্ণাঙ্গ একাডেমি
            </p>
          </div>

          <div className="rounded-2xl p-3.5 bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
            <div className="text-[11px] font-semibold text-amber-300">প্রতিষ্ঠাতা</div>
            <div className="text-sm font-bold">তাসীন বিল্লাহ</div>
            <div className="text-[11px] text-white/80">
              আল কুরআন এণ্ড ইসলামিক স্টাডিজ বিভাগ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleEnterAcademy()}
              className="w-full py-3.5 rounded-full bg-white text-[#0b2315] font-bold text-sm shadow-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>{user ? 'একাডেমিতে প্রবেশ করুন' : 'গেস্ট হিসেবে প্রবেশ করুন (লগইন ছাড়া)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleEnterAcademy('/auth')}
              className="w-full py-3 rounded-full bg-white/12 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>{user ? 'আমার অ্যাকাউন্ট ও ড্যাশবোর্ড' : 'Gmail দিয়ে লগইন (ড্যাশবোর্ড সহ)'}</span>
            </button>

            {!user && (
              <p className="text-[11px] text-emerald-100/75 leading-snug pt-0.5">
                গেস্ট হিসেবে সব পাঠ পড়তে পারবেন; ব্যক্তিগত ড্যাশবোর্ড পেতে লগইন করুন।
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
