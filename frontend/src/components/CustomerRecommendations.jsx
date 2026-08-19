import { useState } from 'react';

export default function CustomerRecommendations() {
  const [customerId, setCustomerId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/customers/${customerId}/recommendations`);
      if (!res.ok) throw new Error('Failed to fetch recommendations from server.');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Multi-Hop Customer Recommendations</h2>
        <p className="text-sm text-slate-400 mb-4">
          Discover restaurants liked by friends of friends up to 4 hops away.
        </p>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Customer ID (e.g., CUST001)"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Traversing...' : 'Analyze Graph'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800/50 text-rose-200 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && data && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-md font-medium mb-4 text-slate-300">Results for: {customerId}</h3>
          {data.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No multi-hop recommendations found for this node.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-lg p-4">
                  <div className="font-medium text-indigo-300">{item.restaurantName || item.name}</div>
                  <div className="text-xs text-slate-500 mt-1">Path Depth: {item.hops || 'Multi-hop'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}