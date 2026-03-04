import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Latex from '../components/Latex';
import { MdChecklist, MdRefresh, MdDashboard, MdCheckCircle, MdCancel } from 'react-icons/md';
import { formatCourseLabel } from '../utils/course';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  useEffect(() => {
    if (!state) {
      navigate('/dashboard');
    }
  }, [state, navigate]);

  if (!state) return null;

  const { questions, answers, score, timeSpent = 0, avgSpeed = 0, detailedAnswers = [], courseTitlesMap = {} } = state;
  const total = questions.length;

  // helper for normalization when we have to fall back
  const normalize = (v) => (v === undefined || v === null ? '' : String(v).trim().toUpperCase());
  const toId = (v) => (v === undefined || v === null ? '' : String(v));

  // convert detailedAnswers list into a map keyed by questionId for quick lookup
  const detailMap = {};
  detailedAnswers.forEach((d) => {
    const qid = toId(d?.questionId);
    if (qid) {
      detailMap[qid] = d;
    }
  });

  // compute a display score: trust server value if provided, otherwise derive from details or raw answers
  const calculatedFromDetails = detailedAnswers.length
    ? detailedAnswers.filter((d) => d.isCorrect).length
    : null;
  const displayScore =
    typeof score === 'number' && !isNaN(score)
      ? score
      : calculatedFromDetails !== null
      ? calculatedFromDetails
      : // last-resort fallback same as previous behaviour
        questions.reduce((acc, q, idx) => {
          const ans = normalize(answers[idx]);
          const corr = normalize(q.correct_option || q.correct);
          return acc + (ans === corr ? 1 : 0);
        }, 0);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[960px] mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative size-32 md:size-40">
              <svg className="size-full" viewBox="0 0 36 36">
                <path
                  className="stroke-primary/10 fill-none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeWidth="3"
                />
                <path
                  className="stroke-primary fill-none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray={`${(displayScore / total) * 100}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-100 leading-none">
                  {Math.round((displayScore / total) * 100)}%
                </span>
                <span className="text-xs font-bold text-primary uppercase mt-1">
                  {displayScore >= total * 0.5 ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold text-slate-100">
                  {displayScore >= total * 0.5 ? 'Great job!' : 'Keep trying!'}
                </h3>
                <p className="text-slate-400 mt-1">
                  You scored {displayScore} out of {total}.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-background-dark/40 px-4 py-2 rounded-lg border border-primary/10">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Time Spent</p>
                  <p className="text-lg font-bold text-slate-100">
                    {(() => {
                      const sec = Math.floor(timeSpent / 1000);
                      const m = Math.floor(sec / 60);
                      const s = sec % 60;
                      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                    })()}
                  </p>
                </div>
                <div className="bg-background-dark/40 px-4 py-2 rounded-lg border border-primary/10">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Average Speed</p>
                  <p className="text-lg font-bold text-slate-100">
                    {(() => {
                      const qpm = avgSpeed * 60;
                      return `${qpm.toFixed(2)} q/min`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
              <h2 className="text-slate-100 text-2xl font-bold leading-tight tracking-tight flex items-center gap-2">
                <MdChecklist className="text-primary" />
                Question Review
              </h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                  {displayScore} Correct
                </span>
                <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20">
                  {total - displayScore} Incorrect
                </span>
              </div>
            </div>

            {questions.map((q, idx) => {
              const qid = toId(q?._id);
              const detail = detailMap[qid] || {};
              const rawUserAns =
                detail.selectedOption !== undefined && detail.selectedOption !== null
                  ? detail.selectedOption
                  : answers?.[idx];
              const correct = detail.correctOption || q.correct_option || q.correct || '';
              const userAnsNormalized = normalize(rawUserAns);
              const hasAnswer = userAnsNormalized !== '';
              const fallbackIsCorrect = hasAnswer && userAnsNormalized === normalize(correct);
              const isCorrect =
                typeof detail.isCorrect === 'boolean'
                  ? hasAnswer && detail.isCorrect
                  : fallbackIsCorrect;
              const userAns = hasAnswer ? rawUserAns : 'Not answered';

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    isCorrect ? 'bg-primary/5 border-primary/10' : 'bg-red-500/5 border-red-500/10'
                  } border rounded-xl overflow-hidden shadow-sm`}
                >
                  <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${
                      isCorrect ? 'border-primary/5 bg-background-dark/20' : 'border-red-500/5 bg-background-dark/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-8 rounded-full ${
                          isCorrect ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        } text-sm font-bold flex items-center justify-center`}
                      >
                        {idx + 1}
                      </span>
                        <span className="text-sm font-bold text-slate-300">
                        {formatCourseLabel(q.course, courseTitlesMap[q.course])}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 font-bold text-sm ${
                        isCorrect ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {isCorrect ? <MdCheckCircle className="text-[18px]" /> : <MdCancel className="text-[18px]" />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-slate-100 text-lg font-medium">
                      <Latex>{q.question_latex || q.question}</Latex>
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase font-black text-slate-500 tracking-widest">
                          Your Answer
                        </p>
                        <div
                          className={`p-3 rounded-lg font-bold math-font text-lg ${
                            isCorrect ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                          }`}
                        >
                          {userAns}
                        </div>
                      </div>
                    </div>
                    {q.solution_latex && (
                      <div className="mt-4 pt-4 border-t border-primary/5">
                        <p className="text-xs uppercase font-black text-slate-500 tracking-widest mb-2">
                          Explanation
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          <Latex>{q.solution_latex}</Latex>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate('/quiz', { state: location.state })}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20"
            >
              <MdRefresh />
              Retry Quiz
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full md:w-auto bg-primary/10 hover:bg-primary/20 text-primary font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <MdDashboard />
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
      <footer className="py-6 mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Made with ❤️ by Olawale • © 2025</p>
      </footer>
    </div>
  );
}
