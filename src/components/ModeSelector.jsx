import { useMode } from '../contexts/ModeContext';

const ModeSelector = () => {
  const { mode, setMode } = useMode();

  return (
    <div className="flex gap-4 justify-center mb-6">
      <button
        onClick={() => setMode('Cinema')}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          mode === 'Cinema'
            ? 'bg-purple-600 text-white shadow-lg scale-105'
            : 'bg-white text-gray-700 shadow hover:bg-gray-50'
        }`}
      >
        🎬 Cinema
      </button>
      <button
        onClick={() => setMode('Home')}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          mode === 'Home'
            ? 'bg-purple-600 text-white shadow-lg scale-105'
            : 'bg-white text-gray-700 shadow hover:bg-gray-50'
        }`}
      >
        🏠 Home
      </button>
    </div>
  );
};

export default ModeSelector;
