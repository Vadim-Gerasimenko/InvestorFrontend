<template>
  <div class="home">
    <h1>Добро пожаловать!</h1>
    <p>Вы успешно вошли в систему</p>
    <button @click="handleLogout" class="logout-btn">Выйти</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 100px;
}

.logout-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>