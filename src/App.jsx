import React from 'react';
import CharacterWizard from './components/CharacterWizard';
import { Cat, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen text-white relative">
      <header className="fixed top-0 w-full z-50 glass border-b border-dark-border py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Cat className="text-emerald-400 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            Tabaxi Generator
          </h1>
        </div>
        <div className="flex gap-4">
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
