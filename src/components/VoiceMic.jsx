import React from 'react';
import { useVoice } from '../context/VoiceContext';

export default function VoiceMic() {
    const { isListening, isModelLoading, toggleListening, transcript, error, micPermission } = useVoice();

    return (
        <div className='flex flex-col items-end gap-2'>
            {/* Error messages */}
            {error && (
                <div className='bg-red-500/20 backdrop-blur-md text-xs text-red-300 px-3 py-2 rounded-xl border border-red-500/30 max-w-[260px]'>
                    ⚠️ {error}
                </div>
            )}

            {/* First-use hint */}
            {!isListening && !isModelLoading && micPermission !== 'granted' && !error && (
                <div className='bg-indigo-500/20 backdrop-blur-md text-xs text-indigo-300 px-3 py-2 rounded-xl border border-indigo-500/30 max-w-[260px]'>
                    🎤 Tap to enable voice control
                </div>
            )}

            {/* Transcript */}
            {isListening && transcript && (
                <div className='bg-black/60 backdrop-blur-md text-xs text-slate-300 px-3 py-1.5 rounded-full border border-white/10 max-w-[220px] truncate'>
                    🗣️ "{transcript}"
                </div>
            )}

            {/* Mic button */}
            <button
                onClick={toggleListening}
                disabled={isModelLoading}
                className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg
                    ${isModelLoading
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30 animate-pulse cursor-wait'
                        : isListening
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/40 animate-pulse'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105'
                    }`}
                title={isModelLoading ? 'Loading speech model...' : isListening ? 'Stop listening' : 'Start voice control'}
            >
                {isModelLoading ? (
                    <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>

            {/* Status indicator */}
            {isModelLoading && (
                <span className='text-[10px] font-medium tracking-wide text-amber-400 animate-pulse'>
                    📦 LOADING MODEL...
                </span>
            )}
            {isListening && (
                <span className='text-[10px] font-medium tracking-wide text-red-400 animate-pulse'>
                    🎙️ LISTENING...
                </span>
            )}
        </div>
    );
}
