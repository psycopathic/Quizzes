import React, { useContext, useEffect } from 'react'
import { QuizContext } from '../context/QuizHolder'
import { useVoice } from '../context/VoiceContext'

export default function Start() {
    const { setStart } = useContext(QuizContext)
    const { setCommands, clearCommands, setKeyBindings, clearKeyBindings } = useVoice();

    useEffect(() => {
        const go = () => setStart(true);
        setCommands({ 'start': go, 'begin': go, 'go': go });
        setKeyBindings({ 'enter': go, ' ': go }); // Enter or Space to start
        return () => {
            clearCommands(['start', 'begin', 'go']);
            clearKeyBindings(['enter', ' ']);
        };
    }, [setStart, setCommands, clearCommands, setKeyBindings, clearKeyBindings]);

    return (
        <div className='animate-fade-in w-full max-w-lg'>
            <div className='glass rounded-3xl p-10 text-center'>
                {/* Icon */}
                <div className='mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>

                <h1 className='text-4xl font-extrabold text-white mb-2 tracking-tight'>Quizzes</h1>
                <p className='text-slate-400 text-sm mb-8'>Test your knowledge across 32 questions</p>

                {/* Topics */}
                <div className='flex flex-wrap justify-center gap-2 mb-8'>
                    {['Physics', 'Math', 'Chemistry', 'Biology', 'CS', 'Space', 'Economics'].map(topic => (
                        <span key={topic} className='text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300'>
                            {topic}
                        </span>
                    ))}
                </div>

                <button
                    onClick={() => setStart(true)}
                    className='glow-btn w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg tracking-wide cursor-pointer hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] transition-all duration-200'
                >
                    Start Quiz →
                </button>

                <p className='text-slate-500 text-xs mt-6'>
                    🎤 Say <span className='text-slate-400 font-medium'>"start"</span> · ⌨️ Press <kbd className='px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]'>Enter</kbd>
                </p>
            </div>
        </div>
    )
}