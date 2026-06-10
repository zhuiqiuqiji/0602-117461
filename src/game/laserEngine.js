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

export const ELEMENT_TYPE = {
  MIRROR_FORWARD: '/',
  MIRROR_BACKWARD: '\\',
  SPLITTER: 'splitter',
  LENS: 'lens',
  FILTER_RED: 'filter-red',
  FILTER_GREEN: 'filter-green',
  FILTER_BLUE: 'filter-blue',
  FIBER_IN: 'fiber-in',
  FIBER_OUT: 'fiber-out',
}

export const LASER_COLORS = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  cyan: '#06b6d4',
  magenta: '#d946ef',
  white: '#f1f5f9',
}

export const COLOR_FILTER_MAP = {
  'filter-red': 'red',
  'filter-green': 'green',
  'filter-blue': 'blue',
}

export function isMirrorType(type) {
  return type === '/' || type === '\\'
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

function splitterReflection(direction) {
  const { dx, dy } = direction
  if (dx === 1 && dy === 0) return { reflected: DIRECTIONS.UP, passed: DIRECTIONS.RIGHT }
  if (dx === -1 && dy === 0) return { reflected: DIRECTIONS.DOWN, passed: DIRECTIONS.LEFT }
  if (dx === 0 && dy === 1) return { reflected: DIRECTIONS.RIGHT, passed: DIRECTIONS.DOWN }
  if (dx === 0 && dy === -1) return { reflected: DIRECTIONS.LEFT, passed: DIRECTIONS.UP }
  return { reflected: direction, passed: direction }
}

function traceSingleBeam(startX, startY, startDir, color, elements, fiberPairs, cols, rows, visited) {
  const segments = []
  let x = startX
  let y = startY
  let dir = startDir
  const maxSteps = cols * rows * 2

  for (let i = 0; i < maxSteps; i++) {
    const nx = x + dir.dx
    const ny = y + dir.dy

    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color, outOfBounds: true })
      break
    }

    const key = `${nx},${ny},${dir.dx},${dir.dy},${color}`
    if (visited.has(key)) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      break
    }
    visited.add(key)

    const el = elements.find(e => e.x === nx && e.y === ny)
    if (!el) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      x = nx
      y = ny
      continue
    }

    if (isMirrorType(el.type)) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      dir = reflectLaser(dir, el.type)
      x = nx
      y = ny
      continue
    }

    if (el.type === ELEMENT_TYPE.SPLITTER) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      const { reflected, passed } = splitterReflection(dir)
      const splitVisited = new Set(visited)
      const subSegments = traceSingleBeam(nx, ny, passed, color, elements, fiberPairs, cols, rows, splitVisited)
      visited.forEach(k => splitVisited.add(k))
      segments.push(...subSegments)
      dir = reflected
      x = nx
      y = ny
      continue
    }

    if (el.type === ELEMENT_TYPE.LENS) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      x = nx
      y = ny
      continue
    }

    if (el.type.startsWith('filter-')) {
      const newColor = COLOR_FILTER_MAP[el.type] || color
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      color = newColor
      x = nx
      y = ny
      continue
    }

    if (el.type === ELEMENT_TYPE.FIBER_IN) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      const pairId = el.pairId
      const fiberOut = fiberPairs.find(f => f.pairId === pairId && f.type === ELEMENT_TYPE.FIBER_OUT && (f.x !== nx || f.y !== ny))
      if (fiberOut) {
        x = fiberOut.x
        y = fiberOut.y
        if (fiberOut.direction && DIRECTIONS[fiberOut.direction]) {
          dir = DIRECTIONS[fiberOut.direction]
        }
      } else {
        x = nx
        y = ny
      }
      continue
    }

    if (el.type === ELEMENT_TYPE.FIBER_OUT) {
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
      x = nx
      y = ny
      continue
    }

    segments.push({ x1: x, y1: y, x2: nx, y2: ny, color })
    x = nx
    y = ny
  }

  return segments
}

export function traceAllLaserPaths(emitters, elements, cols, rows) {
  const fiberPairs = elements.filter(e => e.type === ELEMENT_TYPE.FIBER_IN || e.type === ELEMENT_TYPE.FIBER_OUT)
  const allSegments = []
  const visited = new Set()

  for (const emitter of emitters) {
    const dir = DIRECTIONS[emitter.direction]
    const color = emitter.color || 'red'
    const segments = traceSingleBeam(emitter.x, emitter.y, dir, color, elements, fiberPairs, cols, rows, visited)
    allSegments.push(...segments)
  }

  return allSegments
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

export function checkWin(segments, targets) {
  const targetList = Array.isArray(targets) ? targets : [targets]
  return targetList.every(target => {
    const requiredColor = target.color || null
    return segments.some(seg => {
      if (seg.outOfBounds) return false
      if (seg.x2 !== target.x || seg.y2 !== target.y) return false
      if (requiredColor && seg.color !== requiredColor) return false
      return true
    })
  })
}

export function getStarRating(usedCount, maxCount, optimalCount) {
  if (usedCount <= optimalCount) return 3
  if (usedCount <= optimalCount + 1) return 2
  return 1
}
