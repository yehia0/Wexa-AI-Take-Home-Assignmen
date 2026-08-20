export default function RecommendationsList({ data, customerId }) {
  if (!data) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-6">
      <h3 className="text-md font-medium mb-4 text-slate-300">
        Multi-Hop Recommendations for: <span className="text-indigo-400">{customerId}</span>
      </h3>
      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No multi-hop recommendations found for this node.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-lg p-4">
              <div className="font-medium text-indigo-300">{item.restaurantName || item.name || item.title}</div>
              <div className="text-xs text-slate-500 mt-1">Path Depth: {item.hops || 'Multi-hop'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}