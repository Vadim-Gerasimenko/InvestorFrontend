<!-- components/NotificationBanner.vue -->
<template>
  <div v-if="show" class="notification-banner" :class="type">
    <span class="notification-message">{{ message }}</span>
    <button class="notification-close" @click="close">×</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'warning'
  },
  autoClose: {
    type: Number,
    default: 0
  }
})

const show = ref(true)

const close = () => {
  show.value = false
}

if (props.autoClose > 0) {
  setTimeout(() => {
    show.value = false
  }, props.autoClose)
}
</script>

<style scoped>
.notification-banner {
  position: fixed;
  top: 20px;
  right: 20px;
  left: 20px;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

.notification-banner.warning {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  color: #856404;
}

.notification-banner.error {
  background: #f8d7da;
  border-left: 4px solid #f44336;
  color: #721c24;
}

.notification-banner.success {
  background: #d4edda;
  border-left: 4px solid #4caf50;
  color: #155724;
}

.notification-message {
  flex: 1;
  font-size: 0.9rem;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  color: inherit;
  opacity: 0.7;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>