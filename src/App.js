import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Briefcase, 
  FileText, 
  Sparkles,
  Loader2,
  TrendingUp,
  AlertCircle,
  Upload,
  Lock
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PaywallModal = ({ isLimitReached }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl max-w-lg w-full mx-auto">
    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
      <Lock className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-3xl font-bold mb-2 text-white">Unlock Your Full Report</h3>
    <p className="text-indigo-200 mb-8 text-lg font-medium">
      {isLimitReached ? "You've used your 2 free analyses" : "Upgrade to view your complete analysis"}
    </p>
    <ul className="text-left space-y-4 mb-8 text-gray-300 w-full">
      <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0"/> Unlimited analyses</li>
      <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0"/> Key Strengths breakdown</li>
      <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0"/> Areas for Improvement (actionable)</li>
      <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0"/> ATS Warnings</li>
      <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0"/> AI-Rewritten Profile Summary (copy-ready)</li>
    </ul>
    <a 
      href="https://payhip.com/order?link=U2tAy&pricing_plan=1yz49LJxBp" 
      className="group relative px-8 py-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center"
    >
      Get Lifetime Access — <span className="line-through opacity-60 mr-2 text-base font-normal">$19.99</span> $15
    </a>
    <p className="text-gray-400 text-sm mt-4 font-medium">Instant access. No subscription. Use forever.</p>
  </div>
);

const App = () => {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [uses, setUses] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Usamos um token complexo em vez de "unlocked=true" para ser mais difícil de adivinhar
    if (params.get('transaction') === 'success_h8F2m0PqX') {
      localStorage.setItem('cv_matcher_unlocked', 'true');
      setIsUnlocked(true);
      // Clean up URL without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setIsUnlocked(localStorage.getItem('cv_matcher_unlocked') === 'true');
    }
    setUses(parseInt(localStorage.getItem('cv_matcher_uses') || '0', 10));
  }, []);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    
    setIsPdfLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      setCvText(text);
    } catch (err) {
      console.error(err);
      setError('Error reading PDF file. Please try pasting the text manually.');
    } finally {
      setIsPdfLoading(false);
      e.target.value = null;
    }
  };

  const handleAnalyze = async () => {
    if (!cvText.trim() || !jobDescription.trim()) {
      setError("Please provide both CV and Job Description.");
      return;
    }

    if (!isUnlocked && uses >= 2) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setShowLimitModal(false);

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found. Please set REACT_APP_OPENAI_API_KEY in your .env file.");
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const systemPrompt = "You are an expert ATS analyst. Analyze the CV against the job description and respond ONLY in valid JSON with this structure: { \"match_score\": number 0-100, \"verdict\": \"Strong Match\"|\"Good Match\"|\"Weak Match\"|\"Poor Match\", \"summary\": \"string\", \"keywords_found\": [\"string\"], \"keywords_missing\": [\"string\"], \"strengths\": [{\"point\": \"string\", \"detail\": \"string\"}], \"improvements\": [{\"point\": \"string\", \"detail\": \"string\"}], \"ats_warnings\": [\"string\"], \"rewritten_summary\": \"string\" }";

      const userMessage = `CV: """${cvText}""" Job Description: """${jobDescription}""" Analyze and return JSON only.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      });

      const responseText = response.choices[0].message.content;
      
      let jsonStr = responseText;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      const parsedResults = JSON.parse(jsonStr);
      setResults(parsedResults);

      if (!isUnlocked) {
        setUses(u => {
          const newU = u + 1;
          localStorage.setItem("cv_matcher_uses", newU.toString());
          return newU;
        });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during analysis. Please check your console.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (results?.rewritten_summary) {
      navigator.clipboard.writeText(results.rewritten_summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 50) return 'text-yellow-400 stroke-yellow-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Global Limit Modal for 3rd attempt clicks */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <PaywallModal isLimitReached={true} />
          <button onClick={() => setShowLimitModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
            <XCircle className="w-10 h-10" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 glow-effect">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-gradient">CV Matcher</span> Pro
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            AI-powered ATS optimization. Paste your resume and the job description below to get a detailed match analysis.
          </p>
          {!isUnlocked && (
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
              Free Analyses Used: {uses} / 2
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* CV Input */}
          <div className="glass-panel p-6 flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-indigo-400">
                <FileText className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-semibold text-white">Your CV / Resume</h2>
              </div>
              <label className="cursor-pointer group flex items-center px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors">
                {isPdfLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-400" /> : <Upload className="w-4 h-4 mr-2 text-indigo-400 group-hover:text-indigo-300" />}
                <span className="text-sm text-indigo-300 group-hover:text-indigo-200">Upload PDF</span>
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={isPdfLoading} />
              </label>
            </div>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your full CV text here..."
              className="flex-1 min-h-[300px] w-full bg-gray-950/50 border border-gray-800 rounded-xl p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none font-mono text-sm"
            />
          </div>

          {/* Job Description Input */}
          <div className="glass-panel p-6 flex flex-col">
            <div className="flex items-center mb-4 text-purple-400">
              <Briefcase className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold text-white">Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="flex-1 min-h-[300px] w-full bg-gray-950/50 border border-gray-800 rounded-xl p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden glow-effect"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center">
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  {(!isUnlocked && uses >= 2) ? <Lock className="w-6 h-6 mr-3" /> : <Sparkles className="w-6 h-6 mr-3" />}
                  {(!isUnlocked && uses >= 2) ? "Unlock to Analyze" : "Analyze Match"}
                </>
              )}
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start text-rose-400">
            <AlertCircle className="w-6 h-6 mr-3 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Top Stats Row */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
                <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                    <path className="text-gray-800 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={`${getScoreColor(results.match_score)} transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${results.match_score}, 100`} fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor(results.match_score)}`}>{results.match_score}</span>
                    <span className="text-gray-400 text-sm mt-1">/ 100</span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full border font-medium ${getScoreBg(results.match_score)}`}>{results.verdict}</div>
              </div>

              <div className="glass-panel p-6 md:col-span-2 flex flex-col justify-center">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-indigo-400" /> Executive Summary
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{results.summary}</p>
              </div>
            </div>

            {/* Keywords */}
            <div className="glass-panel p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" /> Keyword Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Found Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords_found?.map((kw, i) => <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-sm">{kw}</span>)}
                    {(!results.keywords_found || results.keywords_found.length === 0) && <span className="text-gray-500 text-sm italic">None found</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords_missing?.map((kw, i) => <span key={i} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-sm">{kw}</span>)}
                    {(!results.keywords_missing || results.keywords_missing.length === 0) && <span className="text-gray-500 text-sm italic">None missing</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Locked Bottom Sections wrapper */}
            <div className="relative mt-8">
              {!isUnlocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                  {/* Subtle dark backdrop over the blurred content */}
                  <div className="absolute inset-0 bg-gray-950/20 rounded-2xl" />
                  <div className="sticky top-20 w-full animate-in fade-in zoom-in duration-500">
                    <PaywallModal isLimitReached={uses >= 2} />
                  </div>
                </div>
              )}

              <div className={`space-y-8 transition-all duration-500 ${!isUnlocked ? 'filter blur-md opacity-40 select-none pointer-events-none' : ''}`}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Key Strengths
                    </h3>
                    <ul className="space-y-4">
                      {results.strengths?.map((strength, i) => (
                        <li key={i} className="flex items-start">
                          <div className="mt-1 mr-3 shrink-0 w-2 h-2 rounded-full bg-emerald-400" />
                          <div><strong className="block text-gray-200">{strength.point}</strong><span className="text-gray-400 text-sm">{strength.detail}</span></div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold mb-6 flex items-center text-indigo-400">
                      <ArrowRight className="w-5 h-5 mr-2" /> Areas for Improvement
                    </h3>
                    <ul className="space-y-4">
                      {results.improvements?.map((imp, i) => (
                        <li key={i} className="flex items-start">
                          <div className="mt-1 mr-3 shrink-0 w-2 h-2 rounded-full bg-indigo-400" />
                          <div><strong className="block text-gray-200">{imp.point}</strong><span className="text-gray-400 text-sm">{imp.detail}</span></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {results.ats_warnings && results.ats_warnings.length > 0 && (
                  <div className="glass-panel p-6 border-orange-500/20 bg-orange-500/5">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-orange-400">
                      <AlertTriangle className="w-5 h-5 mr-2" /> ATS Warnings
                    </h3>
                    <div className="grid gap-3">
                      {results.ats_warnings.map((warning, i) => (
                        <div key={i} className="px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-200 flex items-start">
                          <AlertTriangle className="w-4 h-4 mr-3 shrink-0 mt-0.5 opacity-70" />
                          <p className="text-sm">{warning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="glass-panel p-6 relative group">
                  <div className="absolute top-6 right-6">
                    <button onClick={handleCopy} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center">
                      {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      <span className="ml-2 text-sm hidden group-hover:inline-block">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-400" /> Suggested Profile Summary
                  </h3>
                  <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-5 text-gray-300 leading-relaxed font-serif italic text-lg">
                    "{results.rewritten_summary}"
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default App;
