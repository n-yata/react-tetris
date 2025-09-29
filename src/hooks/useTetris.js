import { useCallback, useEffect, useMemo, useReducer } from 'react';
import {
  calculateLevel,
  LINE_CLEAR_SCORES,
  levelToInterval,
  TETROMINOES
} from '../game/constants.js';
import {
  createEmptyBoard,
  takeNextPiece,
  hasCollision,
  placePieceOnBoard,
  clearCompletedLines,
  tryRotateWithKick,
  getDropDistance,
  projectPieceOntoBoard
} from '../game/utils.js';

const initialState = {
  board: createEmptyBoard(),
  queue: [],
  current: null,
  status: 'ready',
  score: 0,
  lines: 0,
  level: 1,
  lastClear: 0
};

function createReadyState() {
  return {
    ...initialState,
    board: createEmptyBoard()
  };
}

function createRunningState() {
  const board = createEmptyBoard();
  const { piece, queue } = takeNextPiece([]);

  return {
    board,
    queue,
    current: piece,
    status: 'running',
    score: 0,
    lines: 0,
    level: 1,
    lastClear: 0
  };
}

function attemptMove(state, dx, dy) {
  if (!state.current) return null;
  const candidate = {
    ...state.current,
    position: {
      x: state.current.position.x + dx,
      y: state.current.position.y + dy
    }
  };

  if (hasCollision(state.board, candidate)) {
    return null;
  }

  return {
    ...state,
    current: candidate
  };
}

function lockPiece(state) {
  if (!state.current) return state;

  const mergedBoard = placePieceOnBoard(state.board, state.current);
  const { board: clearedBoard, clearedLines } = clearCompletedLines(mergedBoard);
  const totalLines = state.lines + clearedLines;
  const level = calculateLevel(totalLines);
  const lineScore = (LINE_CLEAR_SCORES[clearedLines] || 0) * level;
  const { piece: nextPiece, queue } = takeNextPiece(state.queue);
  const gameOver = hasCollision(clearedBoard, nextPiece);

  return {
    ...state,
    board: clearedBoard,
    queue,
    current: gameOver ? null : nextPiece,
    status: gameOver ? 'gameover' : 'running',
    score: state.score + lineScore,
    lines: totalLines,
    level,
    lastClear: clearedLines
  };
}

function stepDown(state, awardPoint) {
  const moved = attemptMove(state, 0, 1);
  if (moved) {
    return awardPoint ? { ...moved, score: moved.score + 1 } : moved;
  }
  return lockPiece(state);
}

function moveHorizontal(state, direction) {
  const offset = direction === 'left' ? -1 : 1;
  const moved = attemptMove(state, offset, 0);
  return moved ?? state;
}

function rotate(state, direction) {
  if (!state.current) return state;
  const rotated = tryRotateWithKick(state.board, state.current, direction);
  if (!rotated) return state;
  return {
    ...state,
    current: rotated
  };
}

function hardDrop(state) {
  if (!state.current) return state;
  const distance = getDropDistance(state.board, state.current);
  if (distance === 0) {
    return lockPiece(state);
  }

  const droppedState = {
    ...state,
    current: {
      ...state.current,
      position: {
        x: state.current.position.x,
        y: state.current.position.y + distance
      }
    },
    score: state.score + distance * 2
  };

  return lockPiece(droppedState);
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return createRunningState();
    case 'RESET':
      return createReadyState();
    case 'RESTART':
      return createRunningState();
    case 'PAUSE':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };
    case 'RESUME':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'running' };
    case 'TICK':
      if (state.status !== 'running') return state;
      return stepDown(state, false);
    case 'SOFT_DROP':
      if (state.status !== 'running') return state;
      return stepDown(state, true);
    case 'MOVE_HORIZONTAL':
      if (state.status !== 'running') return state;
      return moveHorizontal(state, action.direction);
    case 'ROTATE':
      if (state.status !== 'running') return state;
      return rotate(state, action.direction);
    case 'HARD_DROP':
      if (state.status !== 'running') return state;
      return hardDrop(state);
    default:
      return state;
  }
}

export function useTetris() {
  const [state, dispatch] = useReducer(reducer, undefined, createReadyState);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const moveLeft = useCallback(() => dispatch({ type: 'MOVE_HORIZONTAL', direction: 'left' }), []);
  const moveRight = useCallback(() => dispatch({ type: 'MOVE_HORIZONTAL', direction: 'right' }), []);
  const softDrop = useCallback(() => dispatch({ type: 'SOFT_DROP' }), []);
  const rotateCounterClockwise = useCallback(
    () => dispatch({ type: 'ROTATE', direction: -1 }),
    []
  );
  const hardDrop = useCallback(() => dispatch({ type: 'HARD_DROP' }), []);

  useEffect(() => {
    if (state.status !== 'running') return undefined;

    const interval = levelToInterval(state.level);
    const timer = setInterval(() => dispatch({ type: 'TICK' }), interval);

    return () => clearInterval(timer);
  }, [state.status, state.level]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (state.status === 'ready' && event.code === 'Space') {
        event.preventDefault();
        start();
        return;
      }

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          event.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
          event.preventDefault();
          hardDrop();
          break;
        case 'Space':
          event.preventDefault();
          rotateCounterClockwise();
          break;
        case 'KeyP':
          event.preventDefault();
          if (state.status === 'running') {
            pause();
          } else if (state.status === 'paused') {
            resume();
          }
          break;
        case 'KeyR':
          event.preventDefault();
          restart();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, moveLeft, moveRight, softDrop, rotateCounterClockwise, hardDrop, pause, resume, restart, start]);

  const boardWithFallingPiece = useMemo(
    () => projectPieceOntoBoard(state.board, state.current),
    [state.board, state.current]
  );

  const nextPieces = useMemo(
    () => state.queue.slice(0, 3).map((type) => ({ type, color: TETROMINOES[type].color })),
    [state.queue]
  );

  return {
    board: boardWithFallingPiece,
    nextPieces,
    score: state.score,
    lines: state.lines,
    level: state.level,
    status: state.status,
    lastClear: state.lastClear,
    start,
    reset,
    restart,
    pause,
    resume,
    moveLeft,
    moveRight,
    softDrop,
    rotateCounterClockwise,
    hardDrop
  };
}
