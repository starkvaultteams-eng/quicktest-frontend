import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { quizAPI } from '../services/api';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    quizAPI
      .getLeaderboard()
      .then((res) => setLeaders(res.data))
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
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : leaders.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <div className="space-y-3">
              {leaders.map((l, idx) => {
                const rankColor =
                  idx === 0
                    ? 'text-yellow-500'
                    : idx === 1
                    ? 'text-gray-400'
                    : idx === 2
                    ? 'text-amber-700'
                    : '';
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 text-center font-bold ${rankColor}`}>{idx + 1}</span>
                      <span className="truncate">
                        {l.username
                          ? l.username
                          : `User ${l._id ? l._id.toString().slice(-6) : ''}`}
                      </span>
                    </div>
                    {(() => {
                      let raw = Number(l.avgScore || 0);
                      // convert fractions to percent
                      if (raw > 0 && raw <= 1) {
                        raw = raw * 100;
                      }
                      // anything up to 100 is treated as a percentage
                      if (raw <= 100) {
                        return (
                          <span className="font-bold">
                            {raw.toFixed(2)}%
                          </span>
                        );
                      }
                      // larger values probably represent raw points
                      return (
                        <span className="font-bold">
                          {raw.toFixed(2)} pts
                        </span>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
