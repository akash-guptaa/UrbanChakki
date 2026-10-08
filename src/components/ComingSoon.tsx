import { FiClock, FiTool } from 'react-icons/fi';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <FiClock className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
        We're working hard to bring you the full <strong>{title}</strong> experience in Phase 3! This operational module is currently under active development.
      </p>
      
      <div className="mt-12 inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
        <FiTool />
        <span>Development in Progress</span>
      </div>
    </div>
  );
}
