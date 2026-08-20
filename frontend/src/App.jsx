import { useState } from 'react';
import CustomerSelector from './components/CustomerSelector';
import RecommendationsList from './components/RecommendationsList';
import GraphVisualizer from './components/GraphVisualizer';

export default function App() {
  const [customerId, setCustomerId] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    setRecommendations(null);
    setGraphData(null);

    try {
      // طلب التوصيات لوحدها
      const recRes = await fetch(`https://wexa-ai-take-home-assignmen-backend.onrender.com/api/customers/${customerId}/recommendations`);
      if (!recRes.ok) throw new Error(`Failed to fetch recommendations (Status: ${recRes.status})`);
      const recJson = await recRes.json();
      setRecommendations(recJson);

      // طلب الـ Graph لوحده
      const graphRes = await fetch(`https://wexa-ai-take-home-assignmen-backend.onrender.com/api/graph/customer/${customerId}`);
      if (!graphRes.ok) throw new Error(`Failed to fetch graph data (Status: ${graphRes.status})`);
      const graphJson = await graphRes.json();
      setGraphData(graphJson);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-indigo-400">Wexa Take-Home Assignment</h1>
          <p className="text-sm text-slate-400">Multi-Hop Recommendations & Graph Visualization</p>
        </header>

        <CustomerSelector 
          customerId={customerId} 
          setCustomerId={setCustomerId} 
          onSearch={handleSearch} 
          loading={loading} 
        />

        {error && (
          <div className="bg-rose-950/50 border border-rose-800/50 text-rose-200 p-4 rounded-xl text-sm">
            ⚠️ Error: {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

        <RecommendationsList 
          data={recommendations} 
          customerId={customerId} 
          loading={loading} 
        />

        <GraphVisualizer 
          graphData={graphData} 
          customerId={customerId} 
          loading={loading} 
        />
      </div>
    </div>
  );
}