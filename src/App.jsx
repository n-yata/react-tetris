import { Board } from './components/Board.jsx';
import { GameControls } from './components/GameControls.jsx';
import { NextQueue } from './components/NextQueue.jsx';
import { StatsPanel } from './components/StatsPanel.jsx';
import { useTetris } from './hooks/useTetris.js';
import './App.css';

const STATUS_MESSAGE = {
  ready: 'スペースキーまたはスタートボタンで開始',
  paused: '一時停止中',
  gameover: 'ゲームオーバー! スタートで再挑戦'
};

export default function App() {
  const {
    board,
    nextPieces,
    score,
    lines,
    level,
    status,
    lastClear,
    start,
    reset,
    restart,
    pause,
    resume,
    hardDrop
  } = useTetris();

  const showOverlay = status !== 'running';

  return (
    <div className="app">
      <header className="app-header">
        <h1>React Tetris</h1>
      </header>
      <main className="layout">
        <section className="board-section">
          <div className="board-wrapper">
            <Board board={board} />
            {showOverlay && status in STATUS_MESSAGE && (
              <div className="board-overlay">
                <p>{STATUS_MESSAGE[status]}</p>
              </div>
            )}
          </div>
        </section>
        <aside className="sidebar">
          <StatsPanel
            score={score}
            lines={lines}
            level={level}
            status={status}
            lastClear={lastClear}
          />
          <NextQueue pieces={nextPieces} />
          <GameControls
            status={status}
            start={start}
            pause={pause}
            resume={resume}
            restart={restart}
            reset={reset}
            hardDrop={hardDrop}
          />
        </aside>
      </main>
      <footer className="app-footer">
        <p>矢印キーやスペースキーで操作できます。</p>
      </footer>
    </div>
  );
}
