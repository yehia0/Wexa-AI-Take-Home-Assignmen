export default function CustomerSelector({ customerId, setCustomerId, onSearch, loading, placeholder, buttonText }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <form onSubmit={onSearch} className="flex gap-4">
        <input
          type="text"
          placeholder={placeholder || "Enter Customer ID (e.g., c1)"}
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-white"
        >
          {loading ? 'Processing...' : (buttonText || 'Search')}
        </button>
      </form>
    </div>
  );
}