import React from 'react';
import CharacterWizard from './components/CharacterWizard';
import { Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen text-white relative">
      <header className="fixed top-0 w-full z-50 glass border-b border-dark-border py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            Tabaxi Generator
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset your character? This will clear all progress.")) {
                window.dispatchEvent(new CustomEvent('reset-character'));
              }
            }}
            className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-bold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            Reset Character
          </button>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        <CharacterWizard />
      </main>

      <footer className="fixed bottom-0 w-full z-50 bg-black/50 backdrop-blur-md border-t border-dark-border py-4 text-center text-sm text-gray-500">
        <a
          href="https://github.com/hardlynoticeable/tabaxi"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 transition-colors"
        >
          Created for D&D 5e Character Generation
        </a>
      </footer>
    </div>
  );
}

export default App;
