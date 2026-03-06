import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import PageLoader from '../components/PageLoader';
import { quizAPI } from '../services/api';
import { formatCourseLabel } from '../utils/course';

export default function History() {
  const [attempts, setAttempts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    quizAPI
      .getMyAttempts({ page, limit: 10 })
      .then((res) => {
        const payload = res.data;
        if (Array.isArray(payload)) {
          setAttempts(payload);
          setPagination({ page: 1, totalPages: 1, total: payload.length, limit: payload.length || 10 });
          return;
        }
        setAttempts(payload.attempts || []);
        setPagination(payload.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
      })
      .catch((e) => {
        console.error(e);
        if (e.response?.status === 404) navigate('/404');
      })
      .finally(() => setLoading(false));
  }, [navigate, page]);

  if (loading) {
    return <PageLoader label="Loading your quiz history..." />;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Quiz History</h1>
          {attempts.length === 0 ? (
            <p>You haven't taken any quizzes yet.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {attempts.map((a) => (
                  <li key={a._id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex justify-between">
                      <span>
                    Score: {a.score}/{a.total} (
                    {a.total > 0
                      ? Math.round((a.score / a.total) * 100)
                      : 0}%
                    )
                  </span>
                      <span className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {formatCourseLabel(a.course)} - {a.topic}
                        </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
