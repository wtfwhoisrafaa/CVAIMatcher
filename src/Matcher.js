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
  Lock,
  LogOut,
  User
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PaywallModal = ({ onClose }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto relative">
    {onClose && (
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
        <XCircle className="w-8 h-8" />
      </button>
    )}
    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 mt-4">
      <Lock className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-3xl font-bold mb-2 text-white">Out of Credits</h3>
    <p className="text-indigo-200 mb-8 text-lg font-medium">
      Top up your account to generate more AI-optimized resumes. Credits never expire.
    </p>
    
    <div className="grid sm:grid-cols-2 gap-6 w-full mb-6">
      {/* 20 Credits */}
      <div className="bg-gray-950 border border-gray-800 p-6 rounded-2xl text-left hover:border-indigo-500/50 transition-colors flex flex-col">
        <h4 className="text-xl font-bold text-white mb-1">Starter</h4>
        <div className="mb-4">
          <span className="text-3xl font-bold text-white">$9</span>
          <span className="text-gray-400 text-sm"> / one-time</span>
        </div>
        <ul className="space-y-3 mb-6 text-sm text-gray-300">
          <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2 shrink-0" /> 20 analyses</li>
          <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2 shrink-0" /> Full CV rewrites</li>
        </ul>
        <a
          href="https://payhip.com/order?link=5vb8h&pricing_plan=63Wd1mlwzw"
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors text-center mt-auto"
        >
          Buy 20 Credits
        </a>
      </div>

      {/* 100 Credits */}
      <div className="bg-gradient-to-b from-indigo-900/40 to-purple-900/20 border border-purple-500/50 p-6 rounded-2xl text-left relative flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Recommended
        </div>
        <h4 className="text-xl font-bold text-white mb-1">Pro</h4>
        <div className="mb-4">
          <span className="text-3xl font-bold text-white">$19</span>
          <span className="text-gray-400 text-sm"> / one-time</span>
        </div>
        <ul className="space-y-3 mb-6 text-sm text-gray-300">
          <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 100 analyses</li>
          <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Full CV rewrites</li>
        </ul>
        <a
          href="https://payhip.com/order?link=U2tAy&pricing_plan=q3BoKx98BE"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] text-center mt-auto"
        >
          Buy 100 Credits
        </a>
      </div>
    </div>
  </div>
);

const Matcher = ({ session }) => {
  const navigate = useNavigate();
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedFullCV, setCopiedFullCV] = useState(false);

  const [credits, setCredits] = useState(0);
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const syncCredits = async () => {
      if (!session?.user) return;

      try {
        let { data, error: fetchError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // User exists in Auth but not in Profiles - Create them now with 2 credits
          const { data: newData, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: session.user.id, email: session.user.email, credits: 2 }])
            .select()
            .single();
          
          if (createError) throw createError;
          data = newData;
        } else if (fetchError) {
          throw fetchError;
        }

        let currentCredits = data.credits;
        const params = new URLSearchParams(window.location.search);
        let transactionCredits = 0;
        if (params.get('transaction') === 'success_20') transactionCredits = 20;
        else if (params.get('transaction') === 'success_100') transactionCredits = 100;

        if (transactionCredits > 0) {
          const newTotal = currentCredits + transactionCredits;
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newTotal })
            .eq('id', session.user.id);

          if (!updateError) {
            currentCredits = newTotal;
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        setCredits(currentCredits);
      } catch (err) {
        console.error("Error syncing credits:", err);
      }
    };

    syncCredits();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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

    if (Number(credits) <= 0) {
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

    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during analysis. Please check your console.");
    } finally {
      // Deduct credit for analysis
      const newC = Math.max(0, credits - 1);
      await supabase.from('profiles').update({ credits: newC }).eq('id', session.user.id);
      setCredits(newC);

      setLoading(false);
    }
  };
  const handleGenerateCV = async () => {
    if (Number(credits) <= 0) {
      setShowLimitModal(true);
      return;
    }

    setIsGeneratingCV(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) throw new Error("API Key not found.");

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const systemPrompt = "You are an expert Resume Writer. Your task is to rewrite the provided CV to perfectly match the provided job description. Tailor the professional summary, skills, and bullet points to highlight the exact keywords and requirements of the job. DO NOT fabricate experience, just rephrase and emphasize the relevant parts. Return the result as a raw string in a JSON object: { \"optimized_cv\": \"string\" }. Use markdown formatting (like **bold**, bullet points) for structure.";

      const userMessage = `CV: """${cvText}""" Job Description: """${jobDescription}""" Return JSON only.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      });

      let jsonStr = response.choices[0].message.content;
      if (jsonStr.includes('```json')) jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      else if (jsonStr.includes('```')) jsonStr = jsonStr.split('```')[1].split('```')[0].trim();

      const parsed = JSON.parse(jsonStr);
      
      setResults(prev => ({ ...prev, optimized_cv: parsed.optimized_cv }));

      // Update Supabase credits (deduct 1 for generation)
      const newC = Math.max(0, credits - 1);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ credits: newC })
        .eq('id', session.user.id);

      if (updateErr) throw updateErr;
      setCredits(newC);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate CV.");
    } finally {
      setIsGeneratingCV(false);
    }
  };

  const handleCopy = () => {
    if (results?.rewritten_summary) {
      navigator.clipboard.writeText(results.rewritten_summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyFullCV = () => {
    if (results?.optimized_cv) {
      navigator.clipboard.writeText(results.optimized_cv);
      setCopiedFullCV(true);
      setTimeout(() => setCopiedFullCV(false), 2000);
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

      {/* Global Limit Modal for 0 credits clicks */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <PaywallModal onClose={() => setShowLimitModal(false)} />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 relative">
          <div className="absolute top-0 right-0 flex items-center space-x-4">
            {session ? (
              <>
                <div className="hidden md:flex items-center text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{session?.user?.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all border border-gray-700 shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg"
              >
                <User className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

          <div className="text-center pt-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 glow-effect">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              <span className="text-gradient">CV Matcher</span> Pro
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              AI-powered ATS optimization. Paste your resume and the job description below to get a detailed match analysis.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
              Credits Remaining: {credits}
            </div>
          </div>
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
                  <Sparkles className="w-6 h-6 mr-3" />
                  Analyze Match (Free)
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

            <div className="relative mt-8">
              <div className="space-y-8 transition-all duration-500">
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
                    {credits > 0 ? (
                      <ul className="space-y-4">
                        {results.improvements?.map((imp, i) => (
                          <li key={i} className="flex items-start">
                            <div className="mt-1 mr-3 shrink-0 w-2 h-2 rounded-full bg-indigo-400" />
                            <div><strong className="block text-gray-200">{imp.point}</strong><span className="text-gray-400 text-sm">{imp.detail}</span></div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-8 text-center bg-gray-950/50 rounded-xl border border-dashed border-gray-800">
                        <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 px-4">Unlock premium analysis to see specific improvement points.</p>
                      </div>
                    )}
                  </div>
                </div>

                {results.ats_warnings && results.ats_warnings.length > 0 && (
                  <div className="glass-panel p-6 border-orange-500/20 bg-orange-500/5 relative overflow-hidden">
                    {credits <= 0 && (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[4px] z-10 flex items-center justify-center p-6 text-center">
                        <div className="bg-gray-900 border border-orange-500/30 p-4 rounded-xl shadow-2xl">
                          <Lock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-1">Premium Feature</p>
                          <p className="text-sm text-gray-300">Login to see ATS critical warnings.</p>
                        </div>
                      </div>
                    )}
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
                  {credits < 0 && ( // Should not happen with new logic, but for safety
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[6px] z-10 flex items-center justify-center p-6 text-center rounded-2xl">
                       <div className="bg-gray-900/90 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
                          <Lock className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                          <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">Premium Feature</p>
                          <p className="text-gray-400 text-sm mb-4">Purchase credits to unlock this summary.</p>
                          <button onClick={() => setShowLimitModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                            Buy Credits
                          </button>
                       </div>
                    </div>
                  )}
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

                {/* Full Optimized CV Section */}
                <div className="glass-panel p-6 relative group border-indigo-500/20 bg-indigo-500/5">
                  {results.optimized_cv ? (
                    <>
                      <div className="absolute top-6 right-6">
                        <button onClick={handleCopyFullCV} className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded-lg transition-colors flex items-center border border-indigo-500/30">
                          {copiedFullCV ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                          <span className="ml-2 text-sm font-semibold">{copiedFullCV ? 'Copied!' : 'Copy Full CV'}</span>
                        </button>
                      </div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center text-indigo-400">
                        <FileText className="w-6 h-6 mr-2" /> Your Complete Optimized Resume
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        We've rewritten your entire resume to perfectly match the job description. Copy the text below and paste it into your favorite resume builder or Word document.
                      </p>
                      <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-6 text-gray-200 leading-relaxed font-sans whitespace-pre-wrap text-sm max-h-[500px] overflow-y-auto">
                        {results.optimized_cv}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-white">Generate Your Optimized CV</h3>
                      <p className="text-indigo-200/70 mb-6 max-w-md mx-auto">
                        Use 1 credit to have our AI rewrite your entire resume based on this analysis, perfectly tailored to the job description.
                      </p>
                      <button
                        onClick={handleGenerateCV}
                        disabled={isGeneratingCV}
                        className="px-8 py-3 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] flex items-center disabled:opacity-50"
                      >
                        {isGeneratingCV ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          <><FileText className="w-5 h-5 mr-2" /> Generate CV (1 Credit)</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Matcher;
