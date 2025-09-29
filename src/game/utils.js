import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES, TETROMINO_TYPES } from './constants.js';

export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

export function copyBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function createPiece(type) {
  const definition = TETROMINOES[type];
  const rotationIndex = 0;
  const matrix = definition.rotations[rotationIndex];
  const startX = Math.floor((BOARD_WIDTH - matrix[0].length) / 2);
  const startY = -matrix.length;

  return {
    type,
    rotationIndex,
    matrix,
    position: { x: startX, y: startY }
  };
}

export function refillQueue(queue) {
  const nextQueue = [...queue];
  while (nextQueue.length < 7) {
    nextQueue.push(...shuffleBag(TETROMINO_TYPES));
  }
  return nextQueue;
}

function shuffleBag(items) {
  const bag = [...items];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function takeNextPiece(queue) {
  const filledQueue = refillQueue(queue);
  const [nextType, ...rest] = filledQueue;
  return {
    piece: createPiece(nextType),
    queue: rest
  };
}

export function hasCollision(board, piece) {
  const { matrix, position } = piece;
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      const newX = position.x + x;
      const newY = position.y + y;

      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
        return true;
      }

      if (newY >= 0 && board[newY][newX]) {
        return true;
      }
    }
  }
  return false;
}

export function placePieceOnBoard(board, piece) {
  const nextBoard = copyBoard(board);
  const { matrix, position, type } = piece;
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      const boardY = position.y + y;
      const boardX = position.x + x;
      if (boardY < 0) continue;
      nextBoard[boardY][boardX] = { type, ghost: false };
    }
  }
  return nextBoard;
}

export function clearCompletedLines(board) {
  const remainingRows = [];
  let cleared = 0;

  for (let row = 0; row < board.length; row += 1) {
    if (board[row].every((cell) => cell && !cell.ghost)) {
      cleared += 1;
    } else {
      remainingRows.push(board[row]);
    }
  }

  while (remainingRows.length < BOARD_HEIGHT) {
    remainingRows.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return {
    board: remainingRows,
    clearedLines: cleared
  };
}

export function rotatePiece(piece, direction = 1) {
  const definition = TETROMINOES[piece.type];
  const rotations = definition.rotations;
  const totalRotations = rotations.length;
  let nextRotationIndex = (piece.rotationIndex + direction) % totalRotations;
  if (nextRotationIndex < 0) {
    nextRotationIndex += totalRotations;
  }

  return {
    ...piece,
    rotationIndex: nextRotationIndex,
    matrix: rotations[nextRotationIndex]
  };
}

export function tryRotateWithKick(board, piece, direction = 1) {
  const rotated = rotatePiece(piece, direction);
  const kicks = [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: -1 }
  ];

  for (const kick of kicks) {
    const candidate = {
      ...rotated,
      position: {
        x: rotated.position.x + kick.x,
        y: rotated.position.y + kick.y
      }
    };

    if (!hasCollision(board, candidate)) {
      return candidate;
    }
  }

  return null;
}

export function getDropDistance(board, piece) {
  let distance = 0;
  let testPiece = { ...piece, position: { ...piece.position } };

  while (true) {
    const nextPosition = {
      x: testPiece.position.x,
      y: testPiece.position.y + 1
    };
    const candidate = { ...testPiece, position: nextPosition };
    if (hasCollision(board, candidate)) {
      break;
    }
    testPiece = candidate;
    distance += 1;
  }

  return distance;
}

export function projectPieceOntoBoard(board, piece, { includeGhost = true } = {}) {
  const baseBoard = copyBoard(board);
  if (!piece) {
    return baseBoard;
  }

  if (includeGhost) {
    const ghostDistance = getDropDistance(board, piece);
    if (ghostDistance > 0) {
      const ghostPiece = {
        ...piece,
        position: {
          x: piece.position.x,
          y: piece.position.y + ghostDistance
        }
      };
      const { matrix, position, type } = ghostPiece;
      for (let y = 0; y < matrix.length; y += 1) {
        for (let x = 0; x < matrix[y].length; x += 1) {
          if (!matrix[y][x]) continue;
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY < 0 || baseBoard[boardY][boardX]) continue;
          baseBoard[boardY][boardX] = { type, ghost: true };
        }
      }
    }
  }

  const { matrix, position, type } = piece;
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      const boardY = position.y + y;
      const boardX = position.x + x;
      if (boardY < 0) continue;
      baseBoard[boardY][boardX] = { type, ghost: false };
    }
  }

  return baseBoard;
}
