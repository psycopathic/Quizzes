import React, { useContext, useEffect } from 'react'
import { QuizContext } from '../context/QuizHolder'
import { useVoice } from '../context/VoiceContext'

export default function Result() {
    const { correct, setExit, setStart, setCorrect, quizzes } = useContext(QuizContext)
    const { setCommands, clearCommands, setKeyBindings, clearKeyBindings } = useVoice();
    const percentage = Math.round((correct / quizzes.length) * 100);

    const playAgain = () => {
        setCorrect(0);
        setExit(false);
        setStart(false);
    }

    useEffect(() => {
        setCommands({ 'play again': playAgain, 'restart': playAgain, 'again': playAgain });
        setKeyBindings({ 'enter': playAgain, ' ': playAgain, 'r': playAgain });
        return () => {
            clearCommands(['play again', 'restart', 'again']);
            clearKeyBindings(['enter', ' ', 'r']);
        };
    }, [setCommands, clearCommands, setKeyBindings, clearKeyBindings]);

    const getGrade = () => {
        if (percentage >= 90) return { emoji: '🏆', text: 'Outstanding!', color: 'from-yellow-400 to-amber-500' };
        if (percentage >= 70) return { emoji: '🌟', text: 'Great Job!', color: 'from-green-400 to-emerald-500' };
        if (percentage >= 50) return { emoji: '👍', text: 'Good Effort!', color: 'from-blue-400 to-indigo-500' };
        return { emoji: '💪', text: 'Keep Practicing!', color: 'from-orange-400 to-red-500' };
    }

    const grade = getGrade();

    return (
        <div className='animate-scale-in w-full max-w-md'>
            <div className='glass rounded-3xl p-10 text-center'>
                <div className='text-6xl mb-4'>{grade.emoji}</div>

                <h2 className={`text-3xl font-extrabold bg-gradient-to-r ${grade.color} bg-clip-text text-transparent mb-2`}>
                    {grade.text}
                </h2>

                {/* Score ring */}
                <div className='relative mx-auto w-36 h-36 my-8'>
                    <svg className='w-full h-full -rotate-90' viewBox='0 0 120 120'>
                        <circle cx='60' cy='60' r='50' fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='10' />
                        <circle
                            cx='60' cy='60' r='50' fill='none'
                            stroke='url(#scoreGradient)'
                            strokeWidth='10'
                            strokeLinecap='round'
                            strokeDasharray={`${(percentage / 100) * 314} 314`}
                            style={{ transition: 'stroke-dasharray 1s ease-out' }}
                        />
                        <defs>
                            <linearGradient id='scoreGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                                <stop offset='0%' stopColor='#6366f1' />
                                <stop offset='100%' stopColor='#a855f7' />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className='absolute inset-0 flex flex-col items-center justify-center'>
                        <span className='text-3xl font-extrabold text-white'>{percentage}%</span>
                        <span className='text-xs text-slate-400 mt-1'>Score</span>
                    </div>
                </div>

                {/* Stats */}
                <div className='flex justify-center gap-6 mb-8'>
                    <div className='text-center'>
                        <div className='text-2xl font-bold text-emerald-400'>{correct}</div>
                        <div className='text-xs text-slate-500'>Correct</div>
                    </div>
                    <div className='w-px bg-white/10'></div>
                    <div className='text-center'>
                        <div className='text-2xl font-bold text-red-400'>{quizzes.length - correct}</div>
                        <div className='text-xs text-slate-500'>Wrong</div>
                    </div>
                    <div className='w-px bg-white/10'></div>
                    <div className='text-center'>
                        <div className='text-2xl font-bold text-slate-300'>{quizzes.length}</div>
                        <div className='text-xs text-slate-500'>Total</div>
                    </div>
                </div>

                <button
                    onClick={playAgain}
                    className='glow-btn w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg tracking-wide cursor-pointer hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] transition-all duration-200'
                >
                    Play Again ↻
                </button>

                <p className='text-slate-500 text-xs mt-6'>
                    🎤 Say <span className='text-slate-400 font-medium'>"play again"</span> · ⌨️ Press <kbd className='px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]'>Enter</kbd>
                </p>
            </div>
        </div>
    )
}