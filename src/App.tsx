import React, { useState } from 'react';
import { ActiveView, StudentInfo, ScoreState } from './types';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { StudentEntryView } from './components/StudentEntryView';
import { Game1MCQView } from './components/Game1MCQView';
import { Game2TrueFalseView } from './components/Game2TrueFalseView';
import { Game3DragDropView } from './components/Game3DragDropView';
import { Game4SpeedBlitzView } from './components/Game4SpeedBlitzView';
import { ResultsEvaluationView } from './components/ResultsEvaluationView';
import { HandbookView } from './components/HandbookView';
import { soundManager } from './utils/sound';

const INITIAL_SCORE_STATE: ScoreState = {
  game1: { score: 0, answeredCount: 0, answers: {}, isCompleted: false },
  game2: { score: 0, answeredCount: 0, answers: {}, isCompleted: false },
  game3: { score: 0, matches: {}, isCompleted: false },
  game4: { score: 0, answeredCount: 0, correctCount: 0, answers: {}, isCompleted: false },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveView>('game1_mcq');
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [scoreState, setScoreState] = useState<ScoreState>(INITIAL_SCORE_STATE);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted);

  const handleLogin = (studentInfo: StudentInfo) => {
    setStudent(studentInfo);
    setIsLoggedIn(true);
    setActiveView('game1_mcq');
  };

  const handleLogout = () => {
    soundManager.playClick();
    setIsLoggedIn(false);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleResetAll = () => {
    soundManager.playClick();
    setScoreState(INITIAL_SCORE_STATE);
    setActiveView('game1_mcq');
  };

  const handleUpdateScore = (
    gameKey: keyof ScoreState,
    newScore: number,
    data: any,
    isCompleted: boolean
  ) => {
    setScoreState((prev) => {
      if (gameKey === 'game1') {
        return {
          ...prev,
          game1: {
            ...prev.game1,
            score: newScore,
            answers: data,
            answeredCount: Object.keys(data).length,
            isCompleted,
          },
        };
      }
      if (gameKey === 'game2') {
        return {
          ...prev,
          game2: {
            ...prev.game2,
            score: newScore,
            answers: data,
            answeredCount: Object.keys(data).length,
            isCompleted,
          },
        };
      }
      if (gameKey === 'game3') {
        return {
          ...prev,
          game3: {
            ...prev.game3,
            score: newScore,
            matches: data,
            isCompleted,
          },
        };
      }
      if (gameKey === 'game4') {
        return {
          ...prev,
          game4: {
            ...prev.game4,
            score: newScore,
            answers: data,
            answeredCount: Object.keys(data).length,
            isCompleted,
          },
        };
      }
      return prev;
    });
  };

  // If not logged in, show the entrance login portal
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        initialStudent={student}
      />
    );
  }

  return (
    <div id="ai-assessment-app-root" className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* Vertical Sidebar */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        student={student}
        scoreState={scoreState}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetAll={handleResetAll}
        onLogout={handleLogout}
      />

      {/* Main Content Stage */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {activeView === 'student_entry' && (
          <StudentEntryView
            student={student}
            onSaveStudent={(info) => setStudent(info)}
            onProceedToQuiz={() => setActiveView('game1_mcq')}
          />
        )}

        {activeView === 'game1_mcq' && (
          <Game1MCQView
            scoreState={scoreState}
            onUpdateScore={(k, s, a, c) => handleUpdateScore(k, s, a, c)}
            onNextGame={() => setActiveView('game2_truefalse')}
          />
        )}

        {activeView === 'game2_truefalse' && (
          <Game2TrueFalseView
            scoreState={scoreState}
            onUpdateScore={(k, s, a, c) => handleUpdateScore(k, s, a, c)}
            onNextGame={() => setActiveView('game3_dragdrop')}
          />
        )}

        {activeView === 'game3_dragdrop' && (
          <Game3DragDropView
            scoreState={scoreState}
            onUpdateScore={(k, s, m, c) => handleUpdateScore(k, s, m, c)}
            onNextGame={() => setActiveView('game4_speed')}
          />
        )}

        {activeView === 'game4_speed' && (
          <Game4SpeedBlitzView
            scoreState={scoreState}
            onUpdateScore={(k, s, a, c) => handleUpdateScore(k, s, a, c)}
            onViewResults={() => setActiveView('results_evaluation')}
          />
        )}

        {activeView === 'results_evaluation' && (
          <ResultsEvaluationView
            student={student}
            scoreState={scoreState}
            onNavigateGame={(v) => setActiveView(v)}
          />
        )}

        {activeView === 'handbook' && (
          <HandbookView />
        )}
      </main>
    </div>
  );
}
