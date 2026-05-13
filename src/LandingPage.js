import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, TrendingUp, Zap, FileText, Upload, Download, Lock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 relative z-10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CV Matcher<span className="text-indigo-400">Pro</span></span>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/app')} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log in</button>
          <button onClick={() => navigate('/app')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]">
            Optimize CV Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
          Increase your chances by up to 3x
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight">
          Stop losing incredible jobs <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            to robots.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Wondering why your resume gets ignored? ATS systems (robots) filter your profile before a human ever sees it. Our AI optimizes your CV with the exact keywords the job description demands.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button onClick={() => navigate('/app')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] flex items-center justify-center">
            <Zap className="w-5 h-5 mr-2" /> Optimize for the Job
          </button>
          <button onClick={() => navigate('/app')} className="w-full sm:w-auto px-8 py-4 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center">
            Get Free Analysis
          </button>
        </div>
        <div className="mt-8 text-sm text-gray-500 flex items-center justify-center space-x-4">
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400"/> 2 Free Analyses</span>
          <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400"/> No credit card required</span>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative z-10 py-20 bg-gray-950/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The problem isn't your experience. It's your resume.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">If you're sending the same resume for every job, you're getting eliminated without even knowing.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-panel p-8">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-rose-400 rotate-180" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Silent Elimination</h3>
              <p className="text-gray-400">90% of top companies use ATS. If you don't have the right keywords, the system simply archives your CV.</p>
            </div>
            <div className="glass-panel p-8">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">The One-Size-Fits-All Trap</h3>
              <p className="text-gray-400">Every role demands something different. Sending a generic template drastically reduces your chances of getting a callback.</p>
            </div>
            <div className="glass-panel p-8">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Wasted Hours, Zero Return</h3>
              <p className="text-gray-400">You spend hours editing, formatting, and tweaking text without knowing what recruiters are actually looking for.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How it works</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">No endless forms. Straight to the point, with results in seconds.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 z-0"></div>

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-900 border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] flex items-center justify-center mb-6 relative">
              <span className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <Upload className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Import your CV</h3>
            <p className="text-gray-400">Upload your current resume in PDF. Our AI will read and structure all your experience in seconds.</p>
          </div>

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-900 border border-purple-500/30 rounded-2xl shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] flex items-center justify-center mb-6 relative">
              <span className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <FileText className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Paste the Job</h3>
            <p className="text-gray-400">Copy and paste the job description (from LinkedIn, Indeed, etc). Our system will cross-reference the data.</p>
          </div>

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-900 border border-pink-500/30 rounded-2xl shadow-[0_0_30px_-10px_rgba(236,72,153,0.3)] flex items-center justify-center mb-6 relative">
              <span className="absolute -top-3 -right-3 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <Download className="w-10 h-10 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Get your Report</h3>
            <p className="text-gray-400">Get your match score, missing keywords, ATS errors, and an AI-rewritten summary ready to copy and paste.</p>
          </div>
        </div>
      </section>

      {/* Pricing / Call to Action */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-gray-950 to-[#0B0F19]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="glass-panel p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Invest in your career</h2>
            <p className="text-xl text-gray-400 mb-10">
              Stop sending resumes into the void. Get instant feedback and land the interviews you deserve.
            </p>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Free Tier */}
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl text-left flex flex-col">
                <h3 className="text-2xl font-bold text-white mb-2">ATS Evaluation</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">Free</span>
                </div>
                <ul className="space-y-4 mb-8 text-gray-300">
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> Complete analysis of current CV</li>
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> ATS Match Score</li>
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> Improvement Tips</li>
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> Instant Results</li>
                </ul>
                <button onClick={() => navigate('/app')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10 mt-auto text-lg">
                  Evaluate my CV for free
                </button>
              </div>

              {/* Paid Tier */}
              <div className="bg-gradient-to-b from-indigo-900/40 to-purple-900/20 border border-indigo-500/50 p-8 rounded-3xl text-left relative shadow-2xl flex flex-col">
                <div className="absolute -top-4 left-6 bg-indigo-600 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-white mb-6 mt-2">Optimized CV Generation</h3>
                
                <div className="space-y-4 mb-8">
                  {/* Option 1 */}
                  <a href="https://payhip.com/order?link=5vb8h&pricing_plan=63Wd1mlwzw" className="block bg-gray-900/50 border border-gray-700 hover:border-indigo-500/50 p-4 rounded-xl cursor-pointer transition-colors group">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">20 Resumes</div>
                        <div className="text-indigo-400/80 text-sm font-medium">To test the waters</div>
                      </div>
                      <div className="text-2xl font-bold text-white">$9</div>
                    </div>
                  </a>

                  {/* Option 2 */}
                  <a href="https://payhip.com/order?link=U2tAy&pricing_plan=q3BoKx98BE" className="block bg-indigo-600/10 border-2 border-indigo-500 hover:bg-indigo-600/20 p-4 rounded-xl cursor-pointer relative transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-lg">100 Resumes</div>
                        <div className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-1">Save 58%</div>
                      </div>
                      <div className="text-2xl font-bold text-white">$19</div>
                    </div>
                  </a>
                </div>

                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> 100% optimized CV for each job</li>
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> AI-rewritten professional summary</li>
                  <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" /> Credits never expire</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-bold text-white">CV Matcher<span className="text-indigo-400">Pro</span></span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} CV Matcher Pro. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
