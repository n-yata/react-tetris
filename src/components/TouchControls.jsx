export function TouchControls({ onLeft, onRight, onUp, onDown, onRotate }) {
  return (
    <div className="touch-controls">
      <div className="touch-row">
        <span className="touch-spacer" aria-hidden="true" />
        <button type="button" className="touch-button" onClick={onUp}>
          ↑
        </button>
        <span className="touch-spacer" aria-hidden="true" />
      </div>
      <div className="touch-row">
        <button type="button" className="touch-button" onClick={onLeft}>
          ←
        </button>
        <button type="button" className="touch-button rotate" onClick={onRotate}>
          回転
        </button>
        <button type="button" className="touch-button" onClick={onRight}>
          →
        </button>
      </div>
      <div className="touch-row">
        <span className="touch-spacer" aria-hidden="true" />
        <button type="button" className="touch-button" onClick={onDown}>
          ↓
        </button>
        <span className="touch-spacer" aria-hidden="true" />
      </div>
    </div>
  );
}
