import React, { useState } from 'react'
import { createContext } from 'react'

const QuizContext = createContext();

const quizzes = [
    // ================= PHYSICS =================
    {
        "question": "What is the unit of electrical resistance?",
        "a": "Volt",
        "b": "Ohm",
        "c": "Ampere",
        "d": "Watt",
        "correct": "b"
    },
    {
        "question": "Which wave has the highest frequency?",
        "a": "Radio",
        "b": "Microwave",
        "c": "X-ray",
        "d": "Infrared",
        "correct": "c"
    },
    {
        "question": "Acceleration due to gravity on Earth is approximately?",
        "a": "4.9 m/s²",
        "b": "9.8 m/s²",
        "c": "19.6 m/s²",
        "d": "1.6 m/s²",
        "correct": "b"
    },
    {
        "question": "Who proposed the theory of relativity?",
        "a": "Isaac Newton",
        "b": "Albert Einstein",
        "c": "Niels Bohr",
        "d": "Galileo Galilei",
        "correct": "b"
    },

    // ================= MATHEMATICS =================
    {
        "question": "What is 15 × 12?",
        "a": "160",
        "b": "170",
        "c": "180",
        "d": "190",
        "correct": "c"
    },
    {
        "question": "What is the value of log10(100)?",
        "a": "1",
        "b": "2",
        "c": "10",
        "d": "100",
        "correct": "b"
    },
    {
        "question": "How many degrees are in a right angle?",
        "a": "45",
        "b": "60",
        "c": "90",
        "d": "120",
        "correct": "c"
    },
    {
        "question": "What is the next prime number after 7?",
        "a": "9",
        "b": "10",
        "c": "11",
        "d": "13",
        "correct": "c"
    },

    // ================= CHEMISTRY =================
    {
        "question": "What is the chemical formula of water?",
        "a": "CO2",
        "b": "H2O",
        "c": "O2",
        "d": "NaCl",
        "correct": "b"
    },
    {
        "question": "Which element has atomic number 1?",
        "a": "Helium",
        "b": "Oxygen",
        "c": "Hydrogen",
        "d": "Nitrogen",
        "correct": "c"
    },
    {
        "question": "What type of bond is formed by transfer of electrons?",
        "a": "Covalent",
        "b": "Ionic",
        "c": "Metallic",
        "d": "Hydrogen",
        "correct": "b"
    },
    {
        "question": "Which gas is used in balloons?",
        "a": "Oxygen",
        "b": "Helium",
        "c": "Nitrogen",
        "d": "Carbon dioxide",
        "correct": "b"
    },

    // ================= BIOLOGY =================
    {
        "question": "What is the powerhouse of the cell?",
        "a": "Nucleus",
        "b": "Mitochondria",
        "c": "Ribosome",
        "d": "Golgi body",
        "correct": "b"
    },
    {
        "question": "Human blood is primarily what type of tissue?",
        "a": "Muscle",
        "b": "Nervous",
        "c": "Connective",
        "d": "Epithelial",
        "correct": "c"
    },
    {
        "question": "Which vitamin is produced when skin is exposed to sunlight?",
        "a": "Vitamin A",
        "b": "Vitamin B12",
        "c": "Vitamin C",
        "d": "Vitamin D",
        "correct": "d"
    },
    {
        "question": "DNA stands for?",
        "a": "Deoxyribo Nucleic Acid",
        "b": "Dynamic Nuclear Acid",
        "c": "Double Nitrogen Acid",
        "d": "None",
        "correct": "a"
    },

    // ================= COMPUTER SCIENCE =================
    {
        "question": "What does CPU stand for?",
        "a": "Central Process Unit",
        "b": "Central Processing Unit",
        "c": "Computer Personal Unit",
        "d": "Central Processor Utility",
        "correct": "b"
    },
    {
        "question": "Which data structure uses FIFO?",
        "a": "Stack",
        "b": "Queue",
        "c": "Tree",
        "d": "Graph",
        "correct": "b"
    },
    {
        "question": "Which language runs in the browser?",
        "a": "C++",
        "b": "Java",
        "c": "JavaScript",
        "d": "Python",
        "correct": "c"
    },
    {
        "question": "Git is primarily used for?",
        "a": "Design",
        "b": "Version control",
        "c": "Video editing",
        "d": "Networking",
        "correct": "b"
    },

    // ================= GEOPOLITICS =================
    {
        "question": "Where is the headquarters of the United Nations?",
        "a": "Geneva",
        "b": "New York",
        "c": "Paris",
        "d": "London",
        "correct": "b"
    },
    {
        "question": "Which country uses the Yen currency?",
        "a": "China",
        "b": "Japan",
        "c": "South Korea",
        "d": "Thailand",
        "correct": "b"
    },
    {
        "question": "Brexit refers to the UK leaving which organization?",
        "a": "NATO",
        "b": "European Union",
        "c": "UN",
        "d": "WTO",
        "correct": "b"
    },
    {
        "question": "Which is the largest country by area?",
        "a": "USA",
        "b": "China",
        "c": "Russia",
        "d": "Canada",
        "correct": "c"
    },

    // ================= SPACE =================
    {
        "question": "Which planet has the most moons?",
        "a": "Earth",
        "b": "Mars",
        "c": "Jupiter",
        "d": "Mercury",
        "correct": "c"
    },
    {
        "question": "First human in space was?",
        "a": "Neil Armstrong",
        "b": "Yuri Gagarin",
        "c": "Buzz Aldrin",
        "d": "John Glenn",
        "correct": "b"
    },
    {
        "question": "Milky Way is a type of?",
        "a": "Planet",
        "b": "Galaxy",
        "c": "Star",
        "d": "Asteroid",
        "correct": "b"
    },
    {
        "question": "Which planet is closest to the Sun?",
        "a": "Venus",
        "b": "Mercury",
        "c": "Earth",
        "d": "Mars",
        "correct": "b"
    },

    // ================= ECONOMICS =================
    {
        "question": "What does GDP stand for?",
        "a": "Gross Domestic Product",
        "b": "General Domestic Product",
        "c": "Gross Development Price",
        "d": "Global Domestic Product",
        "correct": "a"
    },
    {
        "question": "Which institution controls monetary policy in India?",
        "a": "SEBI",
        "b": "RBI",
        "c": "NITI Aayog",
        "d": "Finance Ministry",
        "correct": "b"
    },
    {
        "question": "Inflation means?",
        "a": "Prices falling",
        "b": "Prices rising",
        "c": "Currency fixed",
        "d": "Trade surplus",
        "correct": "b"
    },
    {
        "question": "Which tax is levied on goods and services in India?",
        "a": "VAT",
        "b": "GST",
        "c": "Income Tax",
        "d": "Service Tax",
        "correct": "b"
    }
]

export default function QuizHolder(props) {

    const [start, setStart] = useState(false);
    const [exit, setExit] = useState(false);
    const [correct, setCorrect] = useState(0);
    return (
        <QuizContext.Provider value={{
            start, exit, setStart, setExit, quizzes, correct, setCorrect
        }}>
            {props.children}
        </QuizContext.Provider>
    )
}

export { QuizContext };