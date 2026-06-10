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

      <g class="grid-lines">
        <line
          v-for="row in rows + 1"
          :key="'h' + row"
          x1="0"
          :y1="(row - 1) * cellSize"
          :x2="cols * cellSize"
          :y2="(row - 1) * cellSize"
          stroke="#2d3a52"
          stroke-width="0.5"
        />
        <line
          v-for="col in cols + 1"
          :key="'v' + col"
          :x1="(col - 1) * cellSize"
          y1="0"
          :x2="(col - 1) * cellSize"
          :y2="rows * cellSize"
          stroke="#2d3a52"
          stroke-width="0.5"
        />
      </g>

      <g v-for="(seg, idx) in laserSegments" :key="'seg-' + idx" class="laser-path" filter="url(#laser-glow)">
        <line
          :x1="seg.x1 * cellSize + cellSize / 2"
          :y1="seg.y1 * cellSize + cellSize / 2"
          :x2="seg.x2 * cellSize + cellSize / 2"
          :y2="seg.y2 * cellSize + cellSize / 2"
          :stroke="getLaserColor(seg.color)"
          stroke-width="3"
          stroke-linecap="round"
        />
        <line
          :x1="seg.x1 * cellSize + cellSize / 2"
          :y1="seg.y1 * cellSize + cellSize / 2"
          :x2="seg.x2 * cellSize + cellSize / 2"
          :y2="seg.y2 * cellSize + cellSize / 2"
          stroke="#fff"
          stroke-width="1"
          stroke-linecap="round"
          opacity="0.4"
        />
      </g>

      <g v-for="el in elements" :key="'el-' + el.x + '-' + el.y">
        <g v-if="el.type === '/'">
          <line
            :x1="el.x * cellSize + mirrorPad"
            :y1="(el.y + 1) * cellSize - mirrorPad"
            :x2="(el.x + 1) * cellSize - mirrorPad"
            :y2="el.y * cellSize + mirrorPad"
            stroke="#f59e0b"
            stroke-width="4"
            stroke-linecap="round"
          />
          <line
            :x1="el.x * cellSize + mirrorPad"
            :y1="(el.y + 1) * cellSize - mirrorPad"
            :x2="(el.x + 1) * cellSize - mirrorPad"
            :y2="el.y * cellSize + mirrorPad"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </g>

        <g v-else-if="el.type === '\\'">
          <line
            :x1="el.x * cellSize + mirrorPad"
            :y1="el.y * cellSize + mirrorPad"
            :x2="(el.x + 1) * cellSize - mirrorPad"
            :y2="(el.y + 1) * cellSize - mirrorPad"
            stroke="#8b5cf6"
            stroke-width="4"
            stroke-linecap="round"
          />
          <line
            :x1="el.x * cellSize + mirrorPad"
            :y1="el.y * cellSize + mirrorPad"
            :x2="(el.x + 1) * cellSize - mirrorPad"
            :y2="(el.y + 1) * cellSize - mirrorPad"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </g>

        <g v-else-if="el.type === 'splitter'">
          <rect
            :x="el.x * cellSize + 12"
            :y="el.y * cellSize + 12"
            :width="cellSize - 24"
            :height="cellSize - 24"
            rx="4"
            fill="none"
            stroke="#06b6d4"
            stroke-width="2.5"
          />
          <line
            :x1="el.x * cellSize + cellSize / 2"
            :y1="el.y * cellSize + 12"
            :x2="el.x * cellSize + cellSize / 2"
            :y2="(el.y + 1) * cellSize - 12"
            stroke="#06b6d4"
            stroke-width="2"
            stroke-dasharray="3,3"
          />
          <circle
            :cx="el.x * cellSize + cellSize / 2"
            :cy="el.y * cellSize + cellSize / 2"
            r="4"
            fill="#06b6d4"
          />
        </g>

        <g v-else-if="el.type === 'lens'">
          <ellipse
            :cx="el.x * cellSize + cellSize / 2"
            :cy="el.y * cellSize + cellSize / 2"
            rx="6"
            :ry="cellSize / 2 - 10"
            fill="none"
            stroke="#eab308"
            stroke-width="2.5"
          />
          <ellipse
            :cx="el.x * cellSize + cellSize / 2"
            :cy="el.y * cellSize + cellSize / 2"
            rx="3"
            :ry="cellSize / 2 - 14"
            fill="rgba(234,179,8,0.15)"
            stroke="none"
          />
        </g>

        <g v-else-if="el.type === 'filter-red'">
          <rect
            :x="el.x * cellSize + 10"
            :y="el.y * cellSize + 10"
            :width="cellSize - 20"
            :height="cellSize - 20"
            rx="3"
            fill="rgba(239,68,68,0.2)"
            stroke="#ef4444"
            stroke-width="2"
            stroke-dasharray="4,2"
          />
          <text
            :x="el.x * cellSize + cellSize / 2"
            :y="el.y * cellSize + cellSize / 2 + 5"
            text-anchor="middle"
            fill="#ef4444"
            font-size="16"
            font-weight="bold"
          >R</text>
        </g>

        <g v-else-if="el.type === 'filter-green'">
          <rect
            :x="el.x * cellSize + 10"
            :y="el.y * cellSize + 10"
            :width="cellSize - 20"
            :height="cellSize - 20"
            rx="3"
            fill="rgba(34,197,94,0.2)"
            stroke="#22c55e"
            stroke-width="2"
            stroke-dasharray="4,2"
          />
          <text
            :x="el.x * cellSize + cellSize / 2"
            :y="el.y * cellSize + cellSize / 2 + 5"
            text-anchor="middle"
            fill="#22c55e"
            font-size="16"
            font-weight="bold"
          >G</text>
        </g>

        <g v-else-if="el.type === 'filter-blue'">
          <rect
            :x="el.x * cellSize + 10"
            :y="el.y * cellSize + 10"
            :width="cellSize - 20"
            :height="cellSize - 20"
            rx="3"
            fill="rgba(59,130,246,0.2)"
            stroke="#3b82f6"
            stroke-width="2"
            stroke-dasharray="4,2"
          />
          <text
            :x="el.x * cellSize + cellSize / 2"
            :y="el.y * cellSize + cellSize / 2 + 5"
            text-anchor="middle"
            fill="#3b82f6"
            font-size="16"
            font-weight="bold"
          >B</text>
        </g>

        <g v-else-if="el.type === 'fiber-in'">
          <rect
            :x="el.x * cellSize + 8"
            :y="el.y * cellSize + 8"
            :width="cellSize - 16"
            :height="cellSize - 16"
            rx="8"
            fill="rgba(168,85,247,0.2)"
            stroke="#a855f7"
            stroke-width="2"
          />
          <text
            :x="el.x * cellSize + cellSize / 2"
            :y="el.y * cellSize + cellSize / 2 + 5"
            text-anchor="middle"
            fill="#a855f7"
            font-size="14"
            font-weight="bold"
          >IN</text>
        </g>

        <g v-else-if="el.type === 'fiber-out'">
          <rect
            :x="el.x * cellSize + 8"
            :y="el.y * cellSize + 8"
            :width="cellSize - 16"
            :height="cellSize - 16"
            rx="8"
            fill="rgba(168,85,247,0.1)"
            stroke="#a855f7"
            stroke-width="2"
            stroke-dasharray="4,2"
          />
          <text
            :x="el.x * cellSize + cellSize / 2"
            :y="el.y * cellSize + cellSize / 2 + 5"
            text-anchor="middle"
            fill="#a855f7"
            font-size="12"
            font-weight="bold"
          >OUT</text>
        </g>
      </g>

      <g v-for="(em, idx) in emitters" :key="'em-' + idx" :transform="getEmitterTransform(em)" filter="url(#emitter-glow)">
        <polygon
          :points="getEmitterArrowPoints(em.direction)"
          :fill="getLaserColor(em.color || 'red')"
        />
        <circle
          cx="0" cy="0" r="6"
          :fill="getLaserColor(em.color || 'red')"
          opacity="0.4"
        >
          <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      <g v-for="(tgt, idx) in targets" :key="'tgt-' + idx" :transform="getTargetTransform(tgt)" filter="url(#target-glow)">
        <circle
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="14"
          :fill="isTargetHit(tgt) ? getLaserColor(tgt.color || 'red') : 'none'"
          :stroke="getLaserColor(tgt.color || 'red')"
          stroke-width="2"
        />
        <circle
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="8"
          :fill="getLaserColor(tgt.color || 'red')"
          :opacity="isTargetHit(tgt) ? 0.8 : 0.4"
        />
        <circle
          v-if="isTargetHit(tgt)"
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="20"
          :fill="getLaserColor(tgt.color || 'red')"
          opacity="0.2"
        >
          <animate attributeName="r" values="16;24;16" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle
          v-if="!isTargetHit(tgt)"
          :cx="cellSize / 2" :cy="cellSize / 2"
          r="20"
          fill="none"
          :stroke="getLaserColor(tgt.color || 'red')"
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
import { LASER_COLORS } from '../game/laserEngine.js'

const cellSize = 60
const mirrorPad = 8

const props = defineProps({
  cols: { type: Number, required: true },
  rows: { type: Number, required: true },
  emitters: { type: Array, required: true },
  targets: { type: Array, required: true },
  elements: { type: Array, required: true },
  laserSegments: { type: Array, required: true },
  isWon: { type: Boolean, default: false },
  hitTargets: { type: Array, default: () => [] },
  preElementPositions: { type: Array, default: () => [] },
})

const emit = defineEmits(['place-element', 'remove-element'])

const boardStyle = computed(() => ({
  width: props.cols * cellSize + 'px',
  height: props.rows * cellSize + 'px',
}))

const svgViewBox = computed(() => `0 0 ${props.cols * cellSize} ${props.rows * cellSize}`)

function getLaserColor(color) {
  return LASER_COLORS[color] || LASER_COLORS.red
}

function isOccupied(x, y) {
  if (props.emitters.some(e => e.x === x && e.y === y)) return true
  if (props.targets.some(t => t.x === x && t.y === y)) return true
  return props.preElementPositions.includes(`${x},${y}`)
}

function cellClass(x, y) {
  const isEmitter = props.emitters.some(e => e.x === x && e.y === y)
  const isTarget = props.targets.some(t => t.x === x && t.y === y)
  const onPath = props.laserSegments.some(s =>
    (s.x1 === x && s.y1 === y) || (s.x2 === x && s.y2 === y)
  )
  return {
    'cell': true,
    'cell-emitter': isEmitter,
    'cell-target': isTarget,
    'cell-on-path': onPath,
    'cell-occupied': isOccupied(x, y),
  }
}

function isTargetHit(tgt) {
  return props.isWon || props.hitTargets.some(t => t.x === tgt.x && t.y === tgt.y)
}

function getEmitterTransform(em) {
  return `translate(${em.x * cellSize + cellSize / 2}, ${em.y * cellSize + cellSize / 2})`
}

function getEmitterArrowPoints(direction) {
  const s = 10
  switch (direction) {
    case 'RIGHT': return `${s},0 0,${-s * 0.6} 0,${s * 0.6}`
    case 'LEFT': return `${-s},0 0,${-s * 0.6} 0,${s * 0.6}`
    case 'UP': return `0,${-s} ${-s * 0.6},0 ${s * 0.6},0`
    case 'DOWN': return `0,${s} ${-s * 0.6},0 ${s * 0.6},0`
    default: return `${s},0 0,${-s * 0.6} 0,${s * 0.6}`
  }
}

function getTargetTransform(tgt) {
  return `translate(${tgt.x * cellSize}, ${tgt.y * cellSize})`
}

function onCellClick(x, y) {
  if (props.isWon) return
  if (isOccupied(x, y)) return
  emit('place-element', { x, y })
}

function onCellRightClick(x, y) {
  if (props.isWon) return
  if (props.preElementPositions.includes(`${x},${y}`)) return
  emit('remove-element', { x, y })
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
