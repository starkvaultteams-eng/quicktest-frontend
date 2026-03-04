import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import PageLoader from '../components/PageLoader';
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
      setSubmitting(true);
      try {
        const payload = Object.entries(answers).map(([idx, answer]) => {
          const q = questions[Number(idx)];
          return {
            questionId: q?._id,
            selectedOption: answer,
          };
        });
        const res = await quizAPI.submitAnswers(payload);
        const { score: serverScore, detailedAnswers = [] } = res.data;
        const normalize = (v) => (v === undefined || v === null ? '' : String(v).trim().toUpperCase());
        const calculated = questions.reduce((acc, q, i) => {
          const ans = normalize(answers[i]);
          const corr = normalize(q.correct_option || q.correct);
          return acc + (ans === corr ? 1 : 0);
        }, 0);
        const score = typeof serverScore === 'number' ? serverScore : calculated;
        const timeSpent = Date.now() - startTimeRef.current;
        const avgSpeed = timeSpent > 0 ? (questions.length / (timeSpent / 1000)) : 0;
        navigate('/results', { state: { questions, answers, courseTitlesMap, score, timeSpent, avgSpeed, detailedAnswers } });
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <PageLoader label="Preparing your quiz..." />;
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
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[980px] mx-auto">
          <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-primary">Quiz Session</p>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Answer Questions Carefully</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {formatCourseLabel(q.course)} {q.difficulty ? `• ${q.difficulty}` : ''}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 px-3 py-2">
                  <p className="text-xs text-slate-500">Question</p>
                  <p className="font-bold">{current + 1}/{questions.length}</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 px-3 py-2">
                  <p className="text-xs text-slate-500">Answered</p>
                  <p className="font-bold">{answeredCount}</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 px-3 py-2">
                  <p className="text-xs text-slate-500">Progress</p>
                  <p className="font-bold">{percent}%</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-white/80 dark:bg-slate-900/70 p-6 md:p-10 mb-8 shadow-xl shadow-primary/5 backdrop-blur-sm">
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
                      className={`h-full flex items-center gap-4 p-5 rounded-xl border-2 bg-white dark:bg-slate-900/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all ${
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

          <div className="mt-5 flex flex-wrap gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-8 min-w-8 px-2 rounded-md text-xs font-bold border transition-colors ${
                  i === current
                    ? 'border-primary bg-primary text-white'
                    : answers[i]
                    ? 'border-green-400 bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'border-slate-300 dark:border-slate-700 bg-transparent text-slate-500'
                }`}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
