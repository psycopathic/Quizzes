import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const VoiceContext = createContext();

const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

export function VoiceProvider({ children }) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [supported] = useState(!!SpeechRecognition);
    const [error, setError] = useState('');
    const recognitionRef = useRef(null);
    const commandsRef = useRef({});
    const shouldListenRef = useRef(false);

    // ─── Speech Recognition (Chrome/Edge only) ───
    useEffect(() => {
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const last = event.results[event.results.length - 1];
            if (last.isFinal) {
                const spoken = last[0].transcript.trim().toLowerCase();
                setTranscript(spoken);
                matchCommand(spoken);
            }
        };

        recognition.onstart = () => setError('');

        recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                setError('Mic permission denied. Allow it in browser settings.');
                setIsListening(false);
                shouldListenRef.current = false;
            } else if (event.error === 'no-speech') {
                // silence, ignore
            } else if (event.error === 'network') {
                setError('Speech API needs internet & may not work in Brave. Use keyboard shortcuts instead.');
                setIsListening(false);
                shouldListenRef.current = false;
            } else {
                setError(`Voice error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            if (shouldListenRef.current) {
                try { recognition.start(); } catch (e) { }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;
        return () => { recognition.onend = null; recognition.abort(); };
    }, []);

    const matchCommand = (spoken) => {
        const commands = commandsRef.current;
        for (const [keyword, action] of Object.entries(commands)) {
            if (spoken.includes(keyword.toLowerCase())) {
                action();
                break;
            }
        }
    };

    const toggleListening = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            setError('Voice not supported in this browser. Use keyboard shortcuts (shown below).');
            return;
        }
        if (shouldListenRef.current) {
            shouldListenRef.current = false;
            recognition.stop();
            setIsListening(false);
        } else {
            shouldListenRef.current = true;
            setError('');
            try {
                recognition.start();
                setIsListening(true);
            } catch (e) {
                setError(`Failed to start: ${e.message}`);
                shouldListenRef.current = false;
            }
        }
    }, []);

    // ─── Keyboard shortcut registry ───
    const keyHandlersRef = useRef({});

    const setKeyBindings = useCallback((bindings) => {
        keyHandlersRef.current = { ...keyHandlersRef.current, ...bindings };
    }, []);

    const clearKeyBindings = useCallback((keys) => {
        const current = { ...keyHandlersRef.current };
        keys.forEach(k => delete current[k]);
        keyHandlersRef.current = current;
    }, []);

    useEffect(() => {
        const handler = (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();
            const action = keyHandlersRef.current[key];
            if (action) {
                e.preventDefault();
                action();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ─── Voice command registry ───
    const setCommands = useCallback((newCommands) => {
        commandsRef.current = { ...commandsRef.current, ...newCommands };
    }, []);

    const clearCommands = useCallback((keys) => {
        const current = { ...commandsRef.current };
        keys.forEach(k => delete current[k]);
        commandsRef.current = current;
    }, []);

    return (
        <VoiceContext.Provider value={{
            isListening, transcript, supported, error, toggleListening,
            setCommands, clearCommands,
            setKeyBindings, clearKeyBindings
        }}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoice() {
    return useContext(VoiceContext);
}
