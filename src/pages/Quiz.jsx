import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { quizAPI } from '../services/api';
import Latex from '../components/Latex';
import { MdInfo, MdArrowBack, MdBookmark, MdArrowForward, MdDone } from 'react-icons/md';
import { formatCourseLabel } from '../utils/course';

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = location.state;
  const [questions, setQuestions] = useState([]);
  const [courseTitlesMap, setCourseTitlesMap] = useState({});
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!params) {
      navigate('/dashboard');
      return;
    }

    const { course, topic, difficulty, count } = params;
    console.log('fetching quiz', { course, topic, difficulty, count });
    quizAPI
      .getQuestions(course, topic, difficulty, count)
      .then((res) => {
        setQuestions(res.data.questions || res.data);
        // metadata endpoint isn't called here; keep empty unless dashboard
        // injected something later via state (unlikely).  We're just providing a
        // placeholder in case we want to reuse title map between pages.
        setCourseTitlesMap({});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params, navigate]);

  const selectOption = (option) => {
    setAnswers({ ...answers, [current]: option });
  };

  const goPrevious = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const goNext = async () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // submit
      setSubmitting(true);
      try {
        // build payload with actual question IDs so the backend can score correctly
        const payload = Object.entries(answers).map(([idx, answer]) => {
          const q = questions[Number(idx)];
          return {
            questionId: q?._id,
            selectedOption: answer,
          };
        });
        const res = await quizAPI.submitAnswers(payload);
        // server now returns detailedAnswers so we can mark each question
        const { score: serverScore, detailedAnswers = [] } = res.data;
        // fallback: calculate locally only if no server score was provided
        const normalize = (v) => (v === undefined || v === null ? '' : String(v).trim().toUpperCase());
        const calculated = questions.reduce((acc, q, i) => {
          const ans = normalize(answers[i]);
          const corr = normalize(q.correct_option || q.correct);
          return acc + (ans === corr ? 1 : 0);
        }, 0);
        const score = typeof serverScore === 'number' ? serverScore : calculated;
        const timeSpent = Date.now() - startTimeRef.current;
        const avgSpeed = timeSpent > 0 ? (questions.length / (timeSpent / 1000)) : 0; // q/sec
        navigate('/results', { state: { questions, answers, courseTitlesMap, score, timeSpent, avgSpeed, detailedAnswers } });
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">No questions found for the selected criteria.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          Go back and try again
        </button>
      </div>
    );
  }

  const q = questions[current];
  const percent = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        {/* progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-semibold text-primary">
              Question {current + 1} of {questions.length}
            </span>
            <span className="text-sm text-slate-500">
              {percent}% Completed
            </span>
          </div>
          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* question card */}
        <div className="glass-card rounded-xl p-6 md:p-10 mb-8 shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              {formatCourseLabel(q.course)}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full uppercase tracking-wider">
              {q.difficulty || ''}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-semibold mb-8 leading-relaxed break-words text-slate-900 dark:text-slate-100">
            <Latex>{q.question_latex || q.question}</Latex>
          </h2>

          {q.hint && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm italic">
              <MdInfo className="text-sm" />
              <span>{q.hint}</span>
            </div>
          )}
        </div>

        {/* options grid or free‑response */}
        {['A', 'B', 'C', 'D'].some((opt) => {
          const t = q[`option_${opt.toLowerCase()}`] || '';
          return t.toLowerCase() === 'n/a';
        }) ? (
          <div className="mb-12">
            <label className="block mb-2 font-medium">Your answer</label>
            <textarea
              value={answers[current] || ''}
              onChange={(e) => setAnswers({ ...answers, [current]: e.target.value })}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-primary focus:border-primary"
              rows={4}
              placeholder="Type your answer here"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const text = q[`option_${opt.toLowerCase()}`] || '';
              const selected = answers[current] === opt;
              return (
                <label key={opt} className="group relative cursor-pointer">
                  <input
                    type="radio"
                    className="sr-only peer"
                    name="quiz_option"
                    checked={selected}
                    onChange={() => selectOption(opt)}
                  />
                  <div
                    className={`h-full flex items-center gap-4 p-5 rounded-xl border-2 bg-transparent peer-checked:border-primary peer-checked:bg-primary/5 transition-all ${
                      selected ? 'border-primary' : 'border-slate-200 dark:border-primary/10'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                        selected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-primary/10 text-slate-600 dark:text-primary'
                      }`}
                    >
                      {opt}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-base md:text-lg font-bold ${selected ? 'text-primary' : ''} text-slate-900 dark:text-slate-100 break-words`}>
                        <Latex>{text}</Latex>
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* footer actions */}
        <div className="flex items-center justify-between pt-8 border-t border-primary/10">
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            onClick={goPrevious}
            disabled={current === 0}
          >
            <MdArrowBack />
            Previous
          </button>
          <div className="flex items-center gap-4">
            {current < questions.length - 1 && (
              <button
                className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary hover:bg-primary/10 transition-colors"
                onClick={goNext}
              >
                <MdBookmark />
                Review Later
              </button>
            )}
            <button
              onClick={goNext}
              disabled={submitting}
              className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {current < questions.length - 1 ? 'Next Question' : submitting ? 'Submitting...' : 'Finish'}
              {current < questions.length - 1 ? <MdArrowForward /> : <MdDone />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
