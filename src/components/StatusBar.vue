<template>
  <div class="status-bar">
    <div class="status-group">
      <button class="nav-btn" @click="$emit('show-levels')" title="选择关卡">
        📋
      </button>
      <span class="level-label">第 {{ level }} 关</span>
    </div>

    <div class="status-group element-count">
      <span class="element-icon">🔬</span>
      <span class="count-text">{{ remainingElements }} / {{ maxElements }}</span>
    </div>

    <div v-if="stars > 0" class="status-group star-display">
      <span v-for="i in 3" :key="i" class="mini-star" :class="{ filled: i <= stars }">★</span>
    </div>

    <div class="status-group actions">
      <button class="action-btn reset-btn" @click="$emit('reset')" title="重置">↻</button>
      <button
        v-if="isWon"
        class="action-btn next-btn"
        @click="$emit('next')"
        title="下一关"
      >→</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  level: { type: Number, required: true },
  maxElements: { type: Number, required: true },
  remainingElements: { type: Number, required: true },
  isWon: { type: Boolean, default: false },
  stars: { type: Number, default: 0 },
})

defineEmits(['reset', 'next', 'show-levels'])
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  border-color: var(--accent);
  background: rgba(6, 182, 212, 0.1);
}

.level-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent);
}

.element-count {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 6px 14px;
}

.element-icon {
  font-size: 1rem;
}

.count-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f59e0b;
}

.star-display {
  gap: 2px;
}

.mini-star {
  font-size: 0.9rem;
  color: #374151;
}

.mini-star.filled {
  color: #eab308;
  text-shadow: 0 0 6px rgba(234, 179, 8, 0.4);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.next-btn {
  border-color: var(--target-color);
  color: var(--target-color);
  animation: pulse 1.5s ease-in-out infinite;
}

.next-btn:hover {
  box-shadow: 0 0 12px var(--target-glow);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
