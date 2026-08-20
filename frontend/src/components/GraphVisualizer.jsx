import ForceGraph2D from 'react-force-graph-2d';

export default function GraphVisualizer({ graphData, customerId }) {
  if (!graphData) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium text-slate-300">
          Interactive Network Graph for: <span className="text-indigo-400">{customerId}</span>
        </h3>
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
  );
}