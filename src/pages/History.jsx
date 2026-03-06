import { useEffect, useMemo, useState } from 'react';
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
  const [course, setCourse] = useState('All Courses');
  const [topic, setTopic] = useState('All Topics');
  const [courses, setCourses] = useState([]);
  const [topicsByCourse, setTopicsByCourse] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    quizAPI
      .getMetadata()
      .then((res) => {
        const payload = res.data || {};
        setCourses(payload.courses || []);
        setTopicsByCourse(payload.topicsByCourse || {});
      })
      .catch((e) => console.error('history metadata error', e));
  }, []);

  useEffect(() => {
    if (topic === 'All Topics') return;
    const validTopics = topicsByCourse[course] || [];
    if (course === 'All Courses' || !validTopics.includes(topic)) {
      setTopic('All Topics');
    }
  }, [course, topic, topicsByCourse]);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (course !== 'All Courses') params.course = course;
    if (topic !== 'All Topics') params.topic = topic;

    quizAPI
      .getMyAttempts(params)
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
  }, [navigate, page, course, topic]);

  const stats = useMemo(() => {
    const totalAttempts = attempts.length;
    const averagePercent = totalAttempts
      ? Math.round(
          attempts.reduce((acc, a) => acc + (a.total > 0 ? (a.score / a.total) * 100 : 0), 0) / totalAttempts
        )
      : 0;
    const bestPercent = totalAttempts
      ? Math.round(
          Math.max(...attempts.map((a) => (a.total > 0 ? (a.score / a.total) * 100 : 0)))
        )
      : 0;
    return { totalAttempts, averagePercent, bestPercent };
  }, [attempts]);

  if (loading) {
    return <PageLoader label="Loading your quiz history..." />;
  }

  const topicOptions = course !== 'All Courses' ? topicsByCourse[course] || [] : [];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Quiz History</h1>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs uppercase text-slate-500">Attempts On Page</p>
              <p className="text-2xl font-black text-primary">{stats.totalAttempts}</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs uppercase text-slate-500">Average Score</p>
              <p className="text-2xl font-black text-primary">{stats.averagePercent}%</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs uppercase text-slate-500">Best Score</p>
              <p className="text-2xl font-black text-primary">{stats.bestPercent}%</p>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Course</label>
              <select
                value={course}
                onChange={(e) => {
                  setPage(1);
                  setCourse(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
              >
                <option>All Courses</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {formatCourseLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Topic</label>
              <select
                value={topic}
                onChange={(e) => {
                  setPage(1);
                  setTopic(e.target.value);
                }}
                className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
              >
                <option>All Topics</option>
                {topicOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {attempts.length === 0 ? (
            <p>You haven't taken any quizzes yet.</p>
          ) : (
            <>
              <ul className="space-y-4">
                {attempts.map((a) => {
                  const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
                  const courseLabel = formatCourseLabel(a.course || 'General');
                  const topicLabel = String(a.topic || '').trim();
                  return (
                    <li key={a._id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">Score: {a.score}/{a.total} ({pct}%)</span>
                        <span className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {topicLabel ? `${courseLabel} • ${topicLabel}` : courseLabel}
                      </div>
                    </li>
                  );
                })}
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
