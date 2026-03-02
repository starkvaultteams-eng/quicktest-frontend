import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { quizAPI } from '../services/api';
import { formatCourseLabel } from '../utils/course';

export default function History() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    quizAPI
      .getMyAttempts()
      .then((res) => setAttempts(res.data.attempts || res.data))
      .catch((e) => {
        console.error(e);
        if (e.response?.status === 404) navigate('/404');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Quiz History</h1>
          {loading ? (
            <p>Loading...</p>
          ) : attempts.length === 0 ? (
            <p>You haven't taken any quizzes yet.</p>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
}
