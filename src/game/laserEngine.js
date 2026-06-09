export const CELL_SIZE = 60
export const GRID_COLS = 8
export const GRID_ROWS = 8

export const DIRECTIONS = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
}

export const MIRROR_TYPE = {
  FORWARD: '/',
  BACKWARD: '\\',
}

export function reflectLaser(direction, mirrorType) {
  const { dx, dy } = direction
  if (mirrorType === MIRROR_TYPE.FORWARD) {
    if (dx === 1 && dy === 0) return DIRECTIONS.UP
    if (dx === -1 && dy === 0) return DIRECTIONS.DOWN
    if (dx === 0 && dy === 1) return DIRECTIONS.LEFT
    if (dx === 0 && dy === -1) return DIRECTIONS.RIGHT
  }
  if (mirrorType === MIRROR_TYPE.BACKWARD) {
    if (dx === 1 && dy === 0) return DIRECTIONS.DOWN
    if (dx === -1 && dy === 0) return DIRECTIONS.UP
    if (dx === 0 && dy === 1) return DIRECTIONS.RIGHT
    if (dx === 0 && dy === -1) return DIRECTIONS.LEFT
  }
  return direction
}

export function traceLaserPath(emitter, mirrors, cols, rows) {
  const path = []
  let x = emitter.x
  let y = emitter.y
  let dir = DIRECTIONS[emitter.direction]
  path.push({ x, y })

  const maxSteps = cols * rows * 2
  for (let i = 0; i < maxSteps; i++) {
    const nx = x + dir.dx
    const ny = y + dir.dy

    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
      path.push({ x: nx, y: ny, outOfBounds: true })
      break
    }

    const mirror = mirrors.find(m => m.x === nx && m.y === ny)
    if (mirror) {
      path.push({ x: nx, y: ny, mirror: true })
      dir = reflectLaser(dir, mirror.type)
      x = nx
      y = ny
      continue
    }

    x = nx
    y = ny
    path.push({ x, y })
  }

  return path
}

export function checkWin(path, target) {
  return path.some(p => p.x === target.x && p.y === target.y && !p.outOfBounds)
}
