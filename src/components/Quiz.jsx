import React, { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { QuizContext } from '../context/QuizHolder';
import { useVoice } from '../context/VoiceContext';

export default function Quiz() {
    const [current, setCurrent] = useState(0);
    const { quizzes } = useContext(QuizContext);
    const progress = ((current + 1) / quizzes.length) * 100;

    return (
        <div className='animate-fade-in w-full max-w-2xl' key={current}>
            {/* Progress bar */}
            <div className='mb-6'>
                <div className='flex justify-between items-center mb-2'>
                    <span className='text-xs font-medium text-slate-400'>
                        Question {current + 1} of {quizzes.length}
                    </span>
                    <span className='text-xs font-semibold text-indigo-400'>
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                    <div
                        className='progress-fill h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500'
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <Box current={current} next={setCurrent} />

            {/* Keyboard hints */}
            <div className='mt-4 flex justify-center gap-4 flex-wrap'>
                {[
                    { key: '1-4', label: 'Select' },
                    { key: 'Enter', label: 'Next' },
                    { key: 'R', label: 'Reset' },
                    { key: 'Esc', label: 'Exit' },
                ].map(({ key, label }) => (
                    <div key={key} className='flex items-center gap-1.5'>
                        <kbd className='px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]'>{key}</kbd>
                        <span className='text-[11px] text-slate-500'>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const optionLabels = ['A', 'B', 'C', 'D'];
const optionKeys = ['a', 'b', 'c', 'd'];

const Box = ({ current, next }) => {
    const { quizzes, correct, setCorrect, setExit } = useContext(QuizContext);
    const { setCommands, clearCommands, setKeyBindings, clearKeyBindings } = useVoice();
    const [ans, setAns] = useState("");
    const ansRef = useRef("");

    useEffect(() => {
        ansRef.current = ans;
    }, [ans]);

    const saveHandler = useCallback(() => {
        if (quizzes[current].correct === ansRef.current) {
            setCorrect(c => c + 1);
        }
        setAns("");
        if ((current + 1) === quizzes.length) {
            setExit(true);
        } else {
            next(current + 1);
        }
    }, [current, quizzes, setCorrect, setExit, next]);

    // Register voice + keyboard commands
    useEffect(() => {
        // Voice commands
        setCommands({
            'option a': () => setAns('a'),
            'option b': () => setAns('b'),
            'option c': () => setAns('c'),
            'option d': () => setAns('d'),
            'next': () => saveHandler(),
            'save': () => saveHandler(),
            'reset': () => setAns(""),
            'clear': () => setAns(""),
            'exit': () => setExit(true),
            'quit': () => setExit(true),
        });

        // Keyboard shortcuts: 1/2/3/4 or a/b/c/d to select, Enter for next, r to reset, Escape to exit
        setKeyBindings({
            '1': () => setAns('a'),
            '2': () => setAns('b'),
            '3': () => setAns('c'),
            '4': () => setAns('d'),
            'a': () => setAns('a'),
            'b': () => setAns('b'),
            'c': () => setAns('c'),
            'd': () => setAns('d'),
            'enter': () => saveHandler(),
            ' ': () => saveHandler(),
            'r': () => setAns(""),
            'escape': () => setExit(true),
        });

        return () => {
            clearCommands([
                'option a', 'option b', 'option c', 'option d',
                'next', 'save', 'reset', 'clear', 'exit', 'quit'
            ]);
            clearKeyBindings([
                '1', '2', '3', '4', 'a', 'b', 'c', 'd',
                'enter', ' ', 'r', 'escape'
            ]);
        };
    }, [saveHandler, setExit, setCommands, clearCommands, setKeyBindings, clearKeyBindings]);

    return (
        <div className='glass rounded-3xl overflow-hidden'>
            {/* Question */}
            <div className='p-8 pb-6'>
                <h2 className='text-2xl font-bold text-white leading-relaxed'>
                    {quizzes[current].question}
                </h2>
            </div>

            {/* Options */}
            <div className='px-8 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {optionKeys.map((key, i) => {
                    const isSelected = ans === key;
                    return (
                        <div
                            key={key}
                            className={`option-card flex items-center gap-3 p-4 rounded-2xl cursor-pointer border
                                ${isSelected
                                    ? 'bg-indigo-500/20 border-indigo-400 selected-glow'
                                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                                }`}
                            onClick={() => setAns(key)}
                        >
                            <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold
                                ${isSelected
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/10 text-slate-400'
                                }`}>
                                {i + 1}
                            </span>
                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {quizzes[current][key]}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Action buttons */}
            <div className='px-8 pb-8 flex items-center gap-3'>
                <button
                    onClick={() => setAns("")}
                    className='px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer'
                >
                    Reset
                </button>
                <button
                    onClick={saveHandler}
                    className='glow-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-200 cursor-pointer'
                >
                    {(current + 1) === quizzes.length ? 'Finish Quiz ✓' : 'Next →'}
                </button>
                <button
                    onClick={() => setExit(true)}
                    className='px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 cursor-pointer'
                >
                    Exit
                </button>
            </div>
        </div>
    )
}