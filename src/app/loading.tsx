export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading...</p>
            </div>
        </div>
    );
}
