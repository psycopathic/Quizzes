import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createModel } from 'vosk-browser';
import { parseCommand, createCommandDebouncer } from '../utils/commandParser';

const VoiceContext = createContext();

const MODEL_URL = '/models/vosk-model-small-en-us.tar.gz';

export function VoiceProvider({ children }) {
    const [isListening, setIsListening] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isModelReady, setIsModelReady] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const [micPermission, setMicPermission] = useState('unknown');

    const modelRef = useRef(null);
    const recognizerRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const sourceRef = useRef(null);
    const processorRef = useRef(null);
    const commandsRef = useRef({});
    const debouncerRef = useRef(createCommandDebouncer(1500));
    const shouldListenRef = useRef(false);

    // Keyboard shortcut registry
    const keyHandlersRef = useRef({});

    // ─── Check mic permission state ───
    useEffect(() => {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' })
                .then((status) => {
                    setMicPermission(status.state);
                    status.onchange = () => setMicPermission(status.state);
                })
                .catch(() => setMicPermission('unknown'));
        }
    }, []);

    // ─── Load Vosk model ───
    const loadModel = async () => {
        if (modelRef.current) return modelRef.current;

        setIsModelLoading(true);
        setError('');
        console.log('[Voice] Loading Vosk model...');

        try {
            const model = await createModel(MODEL_URL);
            model.setLogLevel(-1);
            modelRef.current = model;
            setIsModelReady(true);
            console.log('[Voice] Vosk model loaded!');
            return model;
        } catch (err) {
            console.error('[Voice] Model load failed:', err);
            setError('Failed to load speech model. Please refresh and try again.');
            throw err;
        } finally {
            setIsModelLoading(false);
        }
    };

    // ─── Process recognized text ───
    const handleTranscript = useCallback((text) => {
        if (!text || text.trim() === '') return;

        const cleaned = text.trim().toLowerCase();
        setTranscript(cleaned);
        console.log('[Voice] Heard:', cleaned);

        // Try command parser first (fuzzy matching)
        const command = parseCommand(cleaned);
        const debounced = debouncerRef.current(command);

        if (debounced) {
            console.log('[Voice] Command:', debounced.type, debounced.payload);
            executeCommand(debounced);
            return;
        }

        // Fallback: keyword matching against registered commands
        const commands = commandsRef.current;
        for (const [keyword, action] of Object.entries(commands)) {
            if (cleaned.includes(keyword.toLowerCase())) {
                console.log('[Voice] Keyword match:', keyword);
                action();
                return;
            }
        }
    }, []);

    // ─── Execute parsed command ───
    const executeCommand = (command) => {
        const commands = commandsRef.current;
        const optionKeys = ['a', 'b', 'c', 'd'];

        switch (command.type) {
            case 'SELECT_OPTION': {
                const idx = command.payload?.index;
                if (idx !== undefined && idx >= 0 && idx <= 3) {
                    const key = `option ${optionKeys[idx]}`;
                    if (commands[key]) commands[key]();
                    else if (commands[`option ${idx + 1}`]) commands[`option ${idx + 1}`]();
                    else {
                        for (const [k, action] of Object.entries(commands)) {
                            if (k === optionKeys[idx] || k === `${idx + 1}`) {
                                action();
                                break;
                            }
                        }
                    }
                }
                break;
            }
            case 'START':
                if (commands['start']) commands['start']();
                else if (commands['begin']) commands['begin']();
                else if (commands['go']) commands['go']();
                break;
            case 'NEXT':
                if (commands['next']) commands['next']();
                else if (commands['save']) commands['save']();
                break;
            case 'RESET':
                if (commands['reset']) commands['reset']();
                else if (commands['clear']) commands['clear']();
                break;
            case 'EXIT':
                if (commands['exit']) commands['exit']();
                else if (commands['quit']) commands['quit']();
                break;
            case 'PLAY_AGAIN':
                if (commands['play again']) commands['play again']();
                else if (commands['restart']) commands['restart']();
                else if (commands['again']) commands['again']();
                break;
        }
    };

    // ─── Start listening ───
    const startListening = async () => {
        try {
            // 1. Load model if not loaded
            const model = await loadModel();

            // 2. Get microphone access (don't force sampleRate — Firefox rejects mismatched rates)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                }
            });
            setMicPermission('granted');
            mediaStreamRef.current = stream;

            // 3. Connect audio pipeline (use device's native sample rate)
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            // Resume AudioContext if suspended (browser autoplay policy)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const sampleRate = audioContext.sampleRate;
            console.log('[Voice] AudioContext sample rate:', sampleRate);

            // 4. Create recognizer with actual sample rate
            const recognizer = new model.KaldiRecognizer(sampleRate);
            recognizerRef.current = recognizer;

            recognizer.on('result', (message) => {
                const text = message.result?.text;
                if (text && text.trim() !== '') {
                    handleTranscript(text);
                }
            });

            recognizer.on('partialresult', (message) => {
                const partial = message.result?.partial;
                if (partial && partial.trim() !== '') {
                    setTranscript(partial);
                }
            });

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (event) => {
                try {
                    if (shouldListenRef.current && recognizerRef.current) {
                        recognizer.acceptWaveform(event.inputBuffer);
                    }
                } catch (err) {
                    console.warn('[Voice] acceptWaveform error:', err);
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            shouldListenRef.current = true;
            setIsListening(true);
            setError('');
            console.log('[Voice] Listening started (Vosk WASM)');

        } catch (err) {
            console.error('[Voice] Start failed:', err);

            if (err.name === 'NotAllowedError') {
                setMicPermission('denied');
                setError('Microphone blocked. Allow mic access in browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found.');
            } else {
                setError(`Voice error: ${err.message}`);
            }
        }
    };

    // ─── Stop listening ───
    const stopListening = () => {
        shouldListenRef.current = false;

        // Disconnect audio nodes
        if (processorRef.current) {
            processorRef.current.onaudioprocess = null;
            try { processorRef.current.disconnect(); } catch (e) { }
            processorRef.current = null;
        }

        if (sourceRef.current) {
            try { sourceRef.current.disconnect(); } catch (e) { }
            sourceRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }

        // Stop media tracks
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        // Free recognizer (model stays for reuse)
        if (recognizerRef.current) {
            recognizerRef.current.remove();
            recognizerRef.current = null;
        }

        setIsListening(false);
        console.log('[Voice] Listening stopped');
    };

    // ─── Toggle ───
    const toggleListening = useCallback(async () => {
        if (shouldListenRef.current) {
            stopListening();
        } else {
            await startListening();
        }
    }, []);

    // ─── Cleanup on unmount ───
    useEffect(() => {
        return () => {
            shouldListenRef.current = false;
            if (processorRef.current) {
                processorRef.current.onaudioprocess = null;
                try { processorRef.current.disconnect(); } catch (e) { }
            }
            if (sourceRef.current) {
                try { sourceRef.current.disconnect(); } catch (e) { }
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (recognizerRef.current) {
                recognizerRef.current.remove();
            }
            if (modelRef.current) {
                modelRef.current.terminate();
            }
        };
    }, []);

    // ─── Keyboard shortcut handler ───
    useEffect(() => {
        const handler = (e) => {
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

    // ─── Command & key binding registries ───
    const setCommands = useCallback((newCommands) => {
        commandsRef.current = { ...commandsRef.current, ...newCommands };
    }, []);

    const clearCommands = useCallback((keys) => {
        const current = { ...commandsRef.current };
        keys.forEach(k => delete current[k]);
        commandsRef.current = current;
    }, []);

    const setKeyBindings = useCallback((bindings) => {
        keyHandlersRef.current = { ...keyHandlersRef.current, ...bindings };
    }, []);

    const clearKeyBindings = useCallback((keys) => {
        const current = { ...keyHandlersRef.current };
        keys.forEach(k => delete current[k]);
        keyHandlersRef.current = current;
    }, []);

    return (
        <VoiceContext.Provider value={{
            isListening, isModelLoading, isModelReady, transcript, error,
            micPermission, toggleListening,
            setCommands, clearCommands,
            setKeyBindings, clearKeyBindings,
        }}>
            {children}
        </VoiceContext.Provider>
    );
}

export function useVoice() {
    return useContext(VoiceContext);
}
