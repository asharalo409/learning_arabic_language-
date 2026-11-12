/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AiTeacherPage } from './pages/AiTeacherPage';
import { CoursesPage } from './pages/CoursesPage';
import { ListeningPage } from './pages/ListeningPage';
import { SpeakingPage } from './pages/SpeakingPage';
import { GrammarPage } from './pages/GrammarPage';
import { QuranicArabicPage } from './pages/QuranicArabicPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { QuizPage } from './pages/QuizPage';
import { PracticePage } from './pages/PracticePage';
import { DailyChallengePage } from './pages/DailyChallengePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { DailyLessonsPage } from './pages/DailyLessonsPage';
import { BaynaYadaykPage } from './pages/BaynaYadaykPage';
import { SafwatulMasadirPage } from './pages/SafwatulMasadirPage';
import { AuthPage } from './pages/AuthPage';
import { ThemesPage } from './pages/ThemesPage';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ThemeBackdrop } from './components/ThemeBackdrop';
import { SplashScreen } from './components/SplashScreen';

function AppRoutesWrapper() {
  const location = useLocation();
  return (
    <>
      <ThemeBackdrop soundOnBubbleTap={location.pathname === '/themes'} />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai-teacher" element={<AiTeacherPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/beginners" element={<CoursesPage initialLevel={1} />} />
          <Route path="/daily-lessons" element={<DailyLessonsPage />} />
          <Route path="/bayna-yadayk" element={<BaynaYadaykPage />} />
          <Route path="/safwatul-masadir" element={<SafwatulMasadirPage />} />
          <Route path="/listening" element={<ListeningPage />} />
          <Route path="/speaking" element={<SpeakingPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="/quranic-arabic" element={<QuranicArabicPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/daily-challenge" element={<DailyChallengePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <WelcomeOverlay />
      <OfflineIndicator />
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(sessionStorage.getItem('aaa_splash_done_v1'));
  });

  const handleSplashDone = () => {
    sessionStorage.setItem('aaa_splash_done_v1', '1');
    setSplashDone(true);
  };

  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          {!splashDone && <SplashScreen onComplete={handleSplashDone} />}
          <AppRoutesWrapper />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
