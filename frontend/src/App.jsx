import { useState } from 'react';
import CustomerRecommendations from './components/CustomerRecommendations';
import GraphViewer from './components/GraphViewer';

function App() {
  const [activeTab, setActiveTab] = useState('recommendations');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Navigation Bar - Static/Relative to prevent overlap */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              GraphDB Explorer
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CognoDB Powered
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Customer 4-Hops
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'graph'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Visual Subgraph
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {activeTab === 'recommendations' && <CustomerRecommendations />}
        {activeTab === 'graph' && <GraphViewer />}
      </main>
    </div>
  );
}

export default App;
