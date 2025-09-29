const CLEAR_MESSAGES = {
  1: 'シングル',
  2: 'ダブル',
  3: 'トリプル',
  4: 'テトリス!'
};

const STATUS_LABELS = {
  ready: '準備OK',
  running: 'プレイ中',
  paused: '一時停止中',
  gameover: 'ゲームオーバー'
};

export function StatsPanel({ score, lines, level, status, lastClear }) {
  return (
    <div className="stats-panel">
      <h2>Stats</h2>
      <dl>
        <div className="stat">
          <dt>スコア</dt>
          <dd>{score}</dd>
        </div>
        <div className="stat">
          <dt>レベル</dt>
          <dd>{level}</dd>
        </div>
        <div className="stat">
          <dt>ライン</dt>
          <dd>{lines}</dd>
        </div>
        <div className="stat">
          <dt>状態</dt>
          <dd>{STATUS_LABELS[status]}</dd>
        </div>
      </dl>
      {lastClear > 0 && <p className="clear-message">{CLEAR_MESSAGES[lastClear]}</p>}
    </div>
  );
}
