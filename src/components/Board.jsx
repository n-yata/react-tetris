import { BOARD_WIDTH, TETROMINOES } from '../game/constants.js';

export function Board({ board }) {
  return (
    <div
      className="board"
      style={{ gridTemplateColumns: 'repeat(' + BOARD_WIDTH + ', 1fr)' }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => {
          const key = y + '-' + x;
          if (!cell) {
            return <div key={key} className="cell" />;
          }

          const color = TETROMINOES[cell.type].color;
          const classNames = ['cell', 'filled'];
          if (cell.ghost) {
            classNames.push('ghost');
          }

          return (
            <div
              key={key}
              className={classNames.join(' ')}
              style={{ '--cell-color': color }}
            />
          );
        })
      )}
    </div>
  );
}
