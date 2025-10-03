// components/LoadingScreen.js
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}