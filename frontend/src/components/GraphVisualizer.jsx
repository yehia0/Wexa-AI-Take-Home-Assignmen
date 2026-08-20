import { useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphViewer() {
  const [customerId, setCustomerId] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchGraph = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://wexa-ai-take-home-assignmen-backend.onrender.com/api/graph/customer/${customerId}`);
      if (!res.ok) throw new Error('Failed to fetch customer subgraph.');
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Box Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Customer Subgraph Network (2-Hops)</h2>
        <p className="text-sm text-slate-400 mb-4">
          Visualize nodes and relationships centered around a specific customer graphically.
        </p>
        <form onSubmit={handleFetchGraph} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Customer ID (e.g., c1)"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-white"
          >
            {loading ? 'Rendering...' : 'Load Visual Graph'}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-950/50 border border-rose-800/50 text-rose-200 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Graph Visualization Container */}
      {!loading && graphData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-slate-300">Interactive Network for: {customerId}</h3>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-indigo-300 border border-slate-700">
              Nodes: {graphData.nodes?.length || 0} | Links: {graphData.links?.length || 0}
            </span>
          </div>
          
          <div className="h-[500px] border border-slate-800 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
            {graphData.nodes && graphData.nodes.length > 0 ? (
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="name"
                nodeColor={() => "#6366f1"}
                linkColor={() => "#475569"}
                nodeRelSize={6}
                width={850}
                height={500}
              />
            ) : (
              <div className="text-slate-500 text-sm">No graph nodes found for this ID.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}