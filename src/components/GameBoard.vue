<template>
  <div
    class="game-board"
    :style="boardStyle"
    @dragover.prevent
    @drop="onDrop"
  >
    <svg class="board-svg" :viewBox="svgViewBox" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="laser-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="target-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="emitter-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="laser-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
      </defs>

      <g v-for="row in rows" :key="'r' + row">
        <rect
          v-for="col in cols"
          :key="'c' + col"
          :x="(col - 1) * cellSize"
          :y="(row - 1) * cellSize"
          :width="cellSize"
          :height="cellSize"
          :class="cellClass(col - 1, row - 1)"
          @click="onCellClick(col - 1, row - 1)"
          @contextmenu.prevent="onCellRightClick(col - 1, row - 1)"
        />
      </g>

      <g v-for="row in rows" :key="'grid-r' + row">
        <line
          v-for="col in cols"
          :key="'grid-c' + col"
          :x1="(col - 1) * cellSize"
          :y1="(row - 1) * cellSize"
          :x2="col * cellSize"
          :y2="(row - 1) * cellSize"
          stroke="#2d3a52"
          stroke-width="0.5"
        />
        <line
          :x1="0"
          :y1="(row - 1) * cellSize"
          :x2="0"
          :y2="row * cellSize"
          stroke="#2d3a52"
          stroke-width="0.5"
        />
      </g>

      <g v-for="col in cols" :key="'grid-bottom-' + col">
        <line
          :x1="(col - 1) * cellSize"
          :y1="rows * cellSize"
          :x2="col * cellSize"
          :y2="rows * cellSize"
          stroke="#2d3a52"
          stroke-width="0.5"
        />
      </g>
      <line
        v-for="row in rows"
        :key="'grid-right-' + row"
        :x1="cols * cellSize"
        :y1="(row - 1) * cellSize"
        :x2="cols * cellSize"
        :y2="row * cellSize"
        stroke="#2d3a52"
        stroke-width="0.5"
      />

      <g v-if="laserPath.length > 1" class="laser-path" filter="url(#laser-glow)">
        <polyline
          :points="laserPolylinePoints"
          fill="none"
          stroke="url(#laser-grad)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <polyline
          :points="laserPolylinePoints"
          fill="none"
          stroke="#fff"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.5"
        />
      </g>

      <g v-for="mirror in mirrors" :key="'m-' + mirror.x + '-' + mirror.y">
        <line
          :x1="mirror.x * cellSize + mirrorPad"
          :y1="(mirror.y + 1) * cellSize - mirrorPad"
          :x2="(mirror.x + 1) * cellSize - mirrorPad"
          :y2="mirror.y * cellSize + mirrorPad"
          :stroke="mirror.type === '/' ? '#f59e0b' : '#8b5cf6'"
          stroke-width="4"
          stroke-linecap="round"
        />
        <line
          :x1="mirror.x * cellSize + mirrorPad"
          :y1="(mirror.y + 1) * cellSize - mirrorPad"
          :x2="(mirror.x + 1) * cellSize - mirrorPad"
          :y2="mirror.y * cellSize + mirrorPad"
          :stroke="rgba(255,255,255,0.3)"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <text
          :x="mirror.x * cellSize + cellSize / 2"
          :y="mirror.y * cellSize + cellSize / 2 + 4"
          text-anchor="middle"
          :fill="mirror.type === '/' ? '#f59e0b' : '#8b5cf6'"
          font-size="14"
          font-weight="bold"
          opacity="0.5"
        >{{ mirror.type === '/' ? '╱' : '╲' }}</text>
      </g>

      <g :transform="emitterTransform" filter="url(#emitter-glow)">
        <polygon
          :points="emitterArrowPoints"
          fill="#ef4444"
        />
        <circle
          cx="0" cy="0" r="6"
          fill="#ef4444"
          opacity="0.4"
        >
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      <g :transform="targetTransform" filter="url(#target-glow)">
        <circle
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="14"
          :fill="isWon ? '#22c55e' : 'none'"
          :stroke="isWon ? '#22c55e' : '#22c55e'"
          stroke-width="2"
        />
        <circle
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="8"
          :fill="isWon ? '#22c55e' : '#22c55e'"
          opacity="0.6"
        />
        <circle
          v-if="isWon"
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="20"
          fill="#22c55e"
          opacity="0.2"
        >
          <animate attributeName="r" values="16;24;16" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle
          v-if="!isWon"
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="20"
          fill="none"
          stroke="#22c55e"
          stroke-width="1"
          opacity="0.3"
        >
          <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const cellSize = 60
const mirrorPad = 8

const props = defineProps({
  cols: { type: Number, required: true },
  rows: { type: Number, required: true },
  emitter: { type: Object, required: true },
  target: { type: Object, required: true },
  mirrors: { type: Array, required: true },
  laserPath: { type: Array, required: true },
  isWon: { type: Boolean, default: false },
  preMirrorPositions: { type: Array, default: () => [] },
})

const emit = defineEmits(['place-mirror', 'remove-mirror'])

const boardStyle = computed(() => ({
  width: props.cols * cellSize + 'px',
  height: props.rows * cellSize + 'px',
}))

const svgViewBox = computed(() => `0 0 ${props.cols * cellSize} ${props.rows * cellSize}`)

const laserPolylinePoints = computed(() => {
  return props.laserPath.map(p => `${p.x * cellSize + cellSize / 2},${p.y * cellSize + cellSize / 2}`).join(' ')
})

function isOccupied(x, y) {
  if (props.emitter.x === x && props.emitter.y === y) return true
  if (props.target.x === x && props.target.y === y) return true
  return props.preMirrorPositions.includes(`${x},${y}`)
}

function cellClass(x, y) {
  return {
    'cell': true,
    'cell-emitter': props.emitter.x === x && props.emitter.y === y,
    'cell-target': props.target.x === x && props.target.y === y,
    'cell-on-path': isOnPath(x, y),
    'cell-occupied': isOccupied(x, y),
  }
}

function isOnPath(x, y) {
  return props.laserPath.some(p => p.x === x && p.y === y)
}

const emitterTransform = computed(() => {
  return `translate(${props.emitter.x * cellSize + cellSize / 2}, ${props.emitter.y * cellSize + cellSize / 2})`
})

const emitterArrowPoints = computed(() => {
  const d = props.emitter.direction
  const s = 10
  switch (d) {
    case 'RIGHT': return `${s},0 0,${-s * 0.6} 0,${s * 0.6}`
    case 'LEFT': return `${-s},0 0,${-s * 0.6} 0,${s * 0.6}`
    case 'UP': return `0,${-s} ${-s * 0.6},0 ${s * 0.6},0`
    case 'DOWN': return `0,${s} ${-s * 0.6},0 ${s * 0.6},0`
    default: return `${s},0 0,${-s * 0.6} 0,${s * 0.6}`
  }
})

const targetTransform = computed(() => {
  return `translate(${props.target.x * cellSize}, ${props.target.y * cellSize})`
})

function onCellClick(x, y) {
  if (props.isWon) return
  if (isOccupied(x, y)) return
  emit('place-mirror', { x, y })
}

function onCellRightClick(x, y) {
  if (props.isWon) return
  if (props.preMirrorPositions.includes(`${x},${y}`)) return
  emit('remove-mirror', { x, y })
}

function onDrop(e) {
  e.preventDefault()
  const rect = e.currentTarget.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / cellSize)
  const y = Math.floor((e.clientY - rect.top) / cellSize)
  if (x >= 0 && x < props.cols && y >= 0 && y < props.rows) {
    onCellClick(x, y)
  }
}
</script>

<style scoped>
.game-board {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.1), 0 4px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-color);
}

.board-svg {
  display: block;
  background: var(--bg-secondary);
}

.cell {
  fill: var(--bg-secondary);
  cursor: pointer;
  transition: fill 0.15s;
}

.cell:hover {
  fill: rgba(6, 182, 212, 0.08);
}

.cell-emitter {
  fill: rgba(239, 68, 68, 0.08);
}

.cell-target {
  fill: rgba(34, 197, 94, 0.08);
}

.cell-on-path {
  fill: rgba(239, 68, 68, 0.04);
}

.cell-occupied {
  cursor: default;
}

.laser-path {
  pointer-events: none;
}
</style>
