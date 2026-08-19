import { useEffect, useState } from 'react';

export default function GraphViewer() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/graph/subgraph')
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-semibold mb-2">Network Subgraph View</h2>
      <p className="text-sm text-slate-400 mb-6">Visual representation of nodes and relationships loaded from CognoDB.</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-[500px]">
          <pre className="text-cyan-300">
            {JSON.stringify(graphData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}