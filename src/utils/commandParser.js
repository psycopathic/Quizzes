/**
 * Command Parser — maps spoken text to quiz actions.
 *
 * Normalizes transcript, handles variations ("one" / "1" / "won"),
 * and debounces duplicate commands.
 */

// Number word → digit mapping (handles common misheard words)
const NUMBER_MAP = {
    'one': 1, '1': 1, 'won': 1, 'wan': 1, 'first': 1,
    'two': 2, '2': 2, 'to': 2, 'too': 2, 'tu': 2, 'second': 2,
    'three': 3, '3': 3, 'tree': 3, 'free': 3, 'third': 3,
    'four': 4, '4': 4, 'for': 4, 'fore': 4, 'fourth': 4,
};

// Command patterns — each returns { type, payload? } or null
const COMMAND_PATTERNS = [
    // Option selection: "option one", "option 1", just "one", "a", "b", etc.
    {
        type: 'SELECT_OPTION',
        match: (text) => {
            // "option X" patterns
            const optionMatch = text.match(/option\s+(\S+)/);
            if (optionMatch) {
                const num = NUMBER_MAP[optionMatch[1]];
                if (num && num >= 1 && num <= 4) return { index: num - 1 };
            }

            // Letter selection: "a", "b", "c", "d"
            const letterMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
            // Only match if the entire text is just the letter
            if (text.length <= 2 && letterMap[text] !== undefined) {
                return { index: letterMap[text] };
            }

            // Direct number: "one", "1", "two", "2", etc.
            // Check if the text is primarily a number word
            const words = text.split(/\s+/);
            if (words.length <= 2) {
                for (const word of words) {
                    const num = NUMBER_MAP[word];
                    if (num && num >= 1 && num <= 4) return { index: num - 1 };
                }
            }

            return null;
        }
    },

    // Start quiz
    {
        type: 'START',
        match: (text) => {
            const triggers = ['start', 'begin', 'go', 'start quiz', 'begin quiz', 'let\'s go'];
            return triggers.some(t => text.includes(t)) ? {} : null;
        }
    },

    // Next question
    {
        type: 'NEXT',
        match: (text) => {
            const triggers = ['next', 'save', 'submit', 'continue', 'next question'];
            return triggers.some(t => text.includes(t)) ? {} : null;
        }
    },

    // Reset / clear selection
    {
        type: 'RESET',
        match: (text) => {
            const triggers = ['reset', 'clear', 'undo', 'deselect'];
            return triggers.some(t => text.includes(t)) ? {} : null;
        }
    },

    // Exit quiz
    {
        type: 'EXIT',
        match: (text) => {
            const triggers = ['exit', 'quit', 'stop', 'end'];
            return triggers.some(t => text.includes(t)) ? {} : null;
        }
    },

    // Play again (Result screen)
    {
        type: 'PLAY_AGAIN',
        match: (text) => {
            const triggers = ['play again', 'restart', 'again', 'retry', 'redo'];
            return triggers.some(t => text.includes(t)) ? {} : null;
        }
    },
];

/**
 * Parse a transcript string into a command object.
 * @param {string} transcript - Raw transcript from STT
 * @returns {{ type: string, payload?: object } | null}
 */
export function parseCommand(transcript) {
    if (!transcript || typeof transcript !== 'string') return null;

    const text = transcript.toLowerCase().trim();
    if (!text) return null;

    for (const pattern of COMMAND_PATTERNS) {
        const result = pattern.match(text);
        if (result !== null) {
            return { type: pattern.type, payload: result };
        }
    }

    return null;
}

/**
 * Create a debounced command handler that ignores duplicate commands
 * within the specified cooldown period.
 * @param {number} cooldownMs - Cooldown in milliseconds (default 1500ms)
 */
export function createCommandDebouncer(cooldownMs = 1500) {
    let lastCommand = null;
    let lastTime = 0;

    return (command) => {
        if (!command) return null;

        const now = Date.now();
        const isSame = lastCommand &&
            lastCommand.type === command.type &&
            JSON.stringify(lastCommand.payload) === JSON.stringify(command.payload);

        if (isSame && (now - lastTime) < cooldownMs) {
            return null; // Debounced
        }

        lastCommand = command;
        lastTime = now;
        return command;
    };
}
