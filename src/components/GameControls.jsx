export function GameControls({
  status,
  start,
  pause,
  resume,
  restart,
  reset,
  hardDrop
}) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isReady = status === 'ready';
  const isGameOver = status === 'gameover';

  return (
    <div className="game-controls">
      <h2>Controls</h2>
      <div className="buttons">
        {(isReady || isGameOver) && (
          <button type="button" onClick={start} className="primary">
            スタート
          </button>
        )}
        {isRunning && (
          <button type="button" onClick={pause}>
            一時停止
          </button>
        )}
        {isPaused && (
          <button type="button" onClick={resume}>
            再開
          </button>
        )}
        {!isReady && !isGameOver && (
          <button type="button" onClick={restart}>
            リスタート
          </button>
        )}
        <button type="button" onClick={reset}>
          リセット
        </button>
        <button type="button" onClick={hardDrop}>
          ハードドロップ
        </button>
      </div>
      <div className="keyboard-help">
        <h3>キーボード操作</h3>
        <ul>
          <li>← → : 左右移動</li>
          <li>↓ : ソフトドロップ</li>
          <li>↑ : ハードドロップ</li>
          <li>Space : 左回転</li>
          <li>P : ポーズ / 再開</li>
          <li>R : リスタート</li>
        </ul>
      </div>
    </div>
  );
}
