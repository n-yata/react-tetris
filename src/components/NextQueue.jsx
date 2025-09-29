import { TETROMINOES } from '../game/constants.js';

const PREVIEW_SIZE = 4;

export function NextQueue({ pieces }) {
  return (
    <div className="next-queue">
      <h2>Next</h2>
      <div className="queue-list">
        {pieces.length === 0 && <p className="placeholder">開始すると次のミノが表示されます</p>}
        {pieces.map(({ type }, index) => (
          <div key={type + '-' + index} className="queue-item">
            <MiniTetromino type={type} />
            <span className="queue-label">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniTetromino({ type }) {
  const definition = TETROMINOES[type];
  const matrix = definition.rotations[0];
  const color = definition.color;

  return (
    <div
      className="mini-grid"
      style={{ gridTemplateColumns: 'repeat(' + PREVIEW_SIZE + ', 1fr)' }}
    >
      {Array.from({ length: PREVIEW_SIZE * PREVIEW_SIZE }).map((_, index) => {
        const y = Math.floor(index / PREVIEW_SIZE);
        const x = index % PREVIEW_SIZE;
        const value = matrix[y] && matrix[y][x];

        return (
          <div
            key={type + '-' + index}
            className={value ? 'mini-cell filled' : 'mini-cell'}
            style={value ? { '--cell-color': color } : undefined}
          />
        );
      })}
    </div>
  );
}
