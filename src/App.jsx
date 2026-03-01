import Result from "./components/Result";
import Start from "./components/Start";
import Quiz from "./components/Quiz";
import { QuizContext } from "./context/QuizHolder";
import { useContext } from "react";
import VoiceMic from "./components/VoiceMic";

function App() {
  const { start, exit } = useContext(QuizContext);
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 font-inter">
      <div className="flex-1 flex items-center justify-center w-full">
        {exit === false ? (
          start === true ? <Quiz /> : <Start />
        ) : (
          <Result />
        )}
      </div>

      {/* Mic button pinned at bottom */}
      <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
        <VoiceMic />
      </div>
    </div>
  );
}

export default App;