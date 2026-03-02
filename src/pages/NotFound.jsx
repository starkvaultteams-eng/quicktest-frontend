import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { MdErrorOutline } from 'react-icons/md';

export default function NotFound() {
  return (
    <div className="min-h-screen dark:bg-background-dark bg-background-light flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center space-y-4">
          <MdErrorOutline className="text-6xl text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400">Sorry, we couldn’t find what you were looking for.</p>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            Go to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
