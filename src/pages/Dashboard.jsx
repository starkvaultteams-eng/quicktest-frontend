import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCourseLabel } from '../utils/course';
import Header from '../components/Header';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// outlines for available courses (fallback, will be replaced when fetched)
// display names may differ from backend values; we keep a map for substitution
const COURSE_OUTLINES = {
  // additional notes per course could go here
};
const COURSE_DISPLAY_MAP = {
  'Information Literacy': 'Use of Library',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [count, setCount] = useState(10);

  // courseOptions now contains objects {value,label} so we can show friendly names
  const [courseOptions, setCourseOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [courseTopics, setCourseTopics] = useState({}); // map course->topics
  const [difficultyOptions, setDifficultyOptions] = useState([]);
  const [courseTitlesMap, setCourseTitlesMap] = useState({}); // optional friendly titles
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const safeTopic = topic === 'All Topics' ? undefined : topic;
    const safeDifficulty = difficulty === 'All Levels' ? undefined : difficulty;
    console.log('starting quiz with', { course, topic: safeTopic, difficulty: safeDifficulty, count });
    navigate('/quiz', {
      state: { course, topic: safeTopic, difficulty: safeDifficulty, count },
    });
  };

  // optional view courses list (for debug or outline display)
  const [allCourses, setAllCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const { user } = useAuth();
  const [myUploads, setMyUploads] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchMetadata = async () => {
    setLoadingMeta(true);
    setMetaError('');

    // try cache first (also handle old cache shape which stored questions)
    try {
      const cachedRaw = localStorage.getItem('metadataCache');
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const age = Date.now() - (cached.time || 0);
        if (age < 15 * 60 * 1000) {
          if (cached.courses && cached.topics) {
            processMetadata(cached);
            setLoadingMeta(false);
            return;
          }
          if (cached.questions) {
            // migrate from older format
            const qs = cached.questions;
            const courses = [...new Set(qs.map((q) => q.course).filter(Boolean))];
            const topics = [...new Set(qs.map((q) => q.topic).filter(Boolean))];
            processMetadata({ courses, topics });
            try {
              localStorage.setItem(
                'metadataCache',
                JSON.stringify({ time: Date.now(), courses, topics })
              );
            } catch (e) {
              console.warn('failed to write migrated cache', e);
            }
            setLoadingMeta(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('failed to read cache', e);
    }

    try {
      const res = await quizAPI.getMetadata();
      const { courses = [], topics = [], topicsByCourse = {}, difficulties = [], courseTitles = {} } = res.data;
      // cache
      try {
        localStorage.setItem(
          'metadataCache',
          JSON.stringify({ time: Date.now(), courses, topics, topicsByCourse, difficulties, courseTitles })
        );
      } catch (e) {
        console.warn('failed to write cache', e);
      }
      processMetadata({ courses, topics, topicsByCourse, difficulties, courseTitles });
    } catch (e) {
      console.error('error fetching metadata', e);
      if (e.response?.status === 404) {
        navigate('/404');
        return;
      }
      setMetaError('Failed to load course information. Please try again.');
    } finally {
      setLoadingMeta(false);
    }
  };

  const processMetadata = ({ courses = [], topics = [], topicsByCourse = {}, difficulties = [], courseTitles = {} }) => {
    // difficulties now provided by backend; fall back to whatever we can derive
    const diffs = difficulties.length
      ? difficulties
      : [...new Set(topics.map((t) => t.difficulty).filter(Boolean))];

    // topicsByCourse may be empty if the cache migration omitted it or the
    // backend doesn't supply it; fall back to empty arrays so the dropdown
    // still works (it'll just show "All Topics" only).
    const courseMap = {};
    courses.forEach((c) => {
      courseMap[c] = topicsByCourse[c] || [];
    });

    const uniqueTopics = ['All Topics', ...new Set(topics)];

    const mappedCourses = courses.map((c) => ({
      value: c,
      label: formatCourseLabel(c, courseTitles[c]),
    }));

    setCourseOptions(mappedCourses);
    setCourseTopics(courseMap);
    setTopicOptions(uniqueTopics);
    setDifficultyOptions(['All Levels', ...diffs]);
    setCourseTitlesMap(courseTitles); // remember for display cards
    setAllCourses(courses);
    setShowCourses(true);
    if (mappedCourses.length && !course) setCourse(mappedCourses[0].value);
    if (uniqueTopics.length && !topic) setTopic('All Topics');
    if (diffs.length && !difficulty) setDifficulty('All Levels');
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // when the selected course changes, update topic list
  useEffect(() => {
    if (course) {
      const opts = ['All Topics', ...(courseTopics[course] || [])];
      setTopicOptions(opts);
      if (!topic || !opts.includes(topic)) setTopic('All Topics');
    }
  }, [course, courseTopics]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-x-hidden text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 p-6 lg:px-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl font-bold mb-6">Start a New Quiz</h1>

          {loadingMeta && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          {metaError && <p className="text-red-500 mb-4">{metaError}</p>}
          {!loadingMeta && !metaError && (
            <p className="text-sm text-slate-500 mb-4">
              {/* Note: current dataset only contains 100‑level courses (100L). These
              are identified by codes beginning with <code>100</code>. */}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6" disabled={loadingMeta}>
            {/* on large screens, use a card layout similar to the original stitch design */}
            <div className="lg:grid lg:grid-cols-3 gap-6 space-y-6 lg:space-y-0">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 lg:p-8 border-2 border-primary/20">
                {/* form inputs stay here */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Course</label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                      >
                        {courseOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Topic</label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                      >
                        {topicOptions.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      {course === 'Math' && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          Various topics – see list below when you start the quiz.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <div className="grid grid-cols-3 gap-3">
                      {difficultyOptions.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`py-3 rounded-xl border border-primary/10 text-sm transition-all ${
                            difficulty === d
                              ? 'border-2 border-primary bg-primary/10 font-bold text-primary'
                              : 'bg-slate-100 dark:bg-background-dark/50 hover:bg-primary/5 hover:border-primary/40'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-32">
                    <label className="text-sm font-medium"># Questions</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingMeta}
                  className="mt-6 w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Now
                </button>
              </div>
              {/* right column: uploads/links */}
              <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-6 border-2 border-primary/20">
                  <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="w-full text-left px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-primary/5 transition-all"
                    >
                      Leaderboard
                    </button>
                    <button
                      onClick={() => navigate('/upload')}
                      className="w-full text-left px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-primary/5 transition-all"
                    >
                      Contribute Materials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* available courses and outlines (fallback) */}
          {showCourses && (
            <div className="mt-12 max-w-[800px] mx-auto">
              <h2 className="text-xl font-semibold mb-2">Available Courses</h2>
              <p className="text-sm text-slate-500 mb-4">
                The current dataset only contains first‑year (100L) material. You
                can help expand the collection by contributing PDFs via the
                "Upload" page; once higher‑level content is added,
                new courses and difficulties will appear here automatically.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {allCourses.map((c) => (
                  <div
                    key={c}
                    className="glass-card rounded-2xl p-4 border border-primary/20"
                  >
                    <h3 className="font-bold text-lg mb-2">
                      {courseTitlesMap[c]
                        ? `${courseTitlesMap[c]} (${c})`
                        : COURSE_DISPLAY_MAP[c] || c}
                      <span className="ml-2 text-xs text-slate-400">(100L)</span>
                    </h3>
                    <ul className="list-disc list-inside text-sm ml-4">
                      {(COURSE_OUTLINES[c] || []).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
