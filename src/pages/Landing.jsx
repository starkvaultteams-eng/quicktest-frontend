import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { MdVerified, MdRocketLaunch, MdInfo, MdQuiz, MdBolt, MdSecurity, MdLibraryBooks, MdTrendingUp } from 'react-icons/md';

export default function Landing() {
  return (
    <div className="min-h-screen dark bg-background-dark">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 ambient-glow pointer-events-none" />
        

        <Header />

        <main className="flex-1 flex flex-col items-center relative z-10">
          {/* Hero Section */}
          <div className="w-full max-w-[1200px] px-6 py-12 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
              <MdVerified className="text-sm" />
              PRACTICE PLATFORM
            </div>
            
            <h1 className="text-slate-900 dark:text-slate-100 text-5xl md:text-7xl font-[900] leading-[1.1] tracking-tighter mb-6">
              Ace Your <span className="text-primary">Exams.</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Specifically built for Paul University students, Awka. Practice with your course notes and actual past questions in a real exam environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                  <MdRocketLaunch />
                  Start Practicing Now
                </button>
              </Link>
              
              {/* link scrolls down to features section */}
              <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-lg border border-slate-700 dark:border-slate-600 hover:bg-slate-700 dark:hover:bg-slate-600 transition-all">
                <MdInfo />
                Learn More
              </a>
            </div>

            {/* Theme & Dark Mode Toggle */}
            <div className="flex items-center justify-center gap-4 mt-12 mb-12">
            </div>
          </div>

          {/* Features Bento Grid */}
          <div id="features" className="w-full max-w-[1200px] px-6 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Practice */}
              <div className="md:col-span-2 glass-card rounded-xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start Practice Sessions</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Select your course, topic, and difficulty level</p>
                  </div>
                  <MdQuiz className="text-primary text-4xl" />
                </div>
                <div className="mt-6 flex gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Multiple Courses</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Instant Scoring</span>
                </div>
              </div>

              {/* Card 2: Fast */}
              <div className="glass-card rounded-xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all">
                <MdBolt className="text-primary text-3xl mb-4 block" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get scored instantly and review solutions</p>
              </div>

              {/* Card 3: Secure */}
              <div className="glass-card rounded-xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all">
                <MdSecurity className="text-primary text-3xl mb-4 block" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Secure & Private</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your data is protected with JWT authentication</p>
              </div>

              {/* Card 4: Real Content */}
              <div className="glass-card rounded-xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all">
                <MdLibraryBooks className="text-primary text-3xl mb-4 block" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Real Content</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Questions from your actual courses and past exams</p>
              </div>

              {/* Card 5: Track Progress */}
              <div className="md:col-span-2 glass-card rounded-xl p-8 backdrop-blur-sm hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Track Your Progress</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">View your statistics and improvement over time</p>
                  </div>
                  <MdTrendingUp className="text-primary text-4xl" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full bg-primary/10 border-t border-primary/20 py-16">
            <div className="max-w-[1200px] mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Ready to ace your exams?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Join Students already using QuickTest
              </p>
              <Link to="/register">
                <button className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-sm text-slate-600 dark:text-slate-400 border-t border-slate-800">
          <p>© 2025 • Made with ❤️ by Olawale</p>
        </footer>
      </div>
    </div>
  );
}
