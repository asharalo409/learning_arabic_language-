/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
      </BrowserRouter>
    </AppProvider>
  );
}
