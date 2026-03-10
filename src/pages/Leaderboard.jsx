import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { quizAPI } from '../services/api';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState('weekly');

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    quizAPI
      .getLeaderboard(season)
      .then((res) => setLeaders(res.data))
      .catch((e) => {
        console.error(e);
        if (e.response?.status === 404) navigate('/404');
      })
      .finally(() => setLoading(false));
  }, [navigate, season]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-col gap-3 mb-6">
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setSeason('weekly')}
                className={`px-4 py-2 rounded-xl text-sm border ${
                  season === 'weekly'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSeason('all')}
                className={`px-4 py-2 rounded-xl text-sm border ${
                  season === 'all'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
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
                const badge =
                  l.badge === 'gold'
                    ? 'bg-yellow-500/20 text-yellow-600'
                    : l.badge === 'silver'
                    ? 'bg-slate-300/20 text-slate-400'
                    : l.badge === 'bronze'
                    ? 'bg-amber-700/20 text-amber-700'
                    : '';
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 text-center font-bold ${rankColor}`}>{idx + 1}</span>
                      {l.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badge}`}>
                          {l.badge}
                        </span>
                      )}
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
