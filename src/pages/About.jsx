import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[860px] mx-auto space-y-8">
          <section className="glass-card rounded-3xl p-8 border-2 border-primary/20">
            <h1 className="text-3xl font-bold mb-4">About QuickTest</h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              QuickTest is a focused practice platform for first-year courses. It helps you train speed,
              accuracy, and recall by generating short, targeted quizzes with instant feedback.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Start a Quiz
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg font-semibold hover:underline"
              >
                Contribute Materials
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-primary/20">
              <h2 className="text-xl font-bold mb-2">Smart Review</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Focus on questions you missed before. If there are not enough, QuickTest automatically
                tops up with new questions.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-primary/20">
              <h2 className="text-xl font-bold mb-2">Balanced Topics</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                When All Topics is selected, this mode spreads questions across topics for better coverage.
              </p>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-6 border border-primary/20">
            <h2 className="text-xl font-bold mb-3">How question counts work</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If the exact topic doesn’t have enough questions, the backend fills the remainder from the
              same course (and if necessary, from other courses) so you still get the count you requested.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
