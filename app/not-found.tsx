import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="text-center p-8">
        <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Link Not Found</h2>
        <p className="text-xl text-gray-600 mb-8">
          The short link your looking for does not exist or has been deleted.
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          ← Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
