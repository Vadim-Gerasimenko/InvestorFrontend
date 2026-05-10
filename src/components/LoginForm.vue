<template>
  <div class="login-container">
    <h2>Вход в систему</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username">Логин:</label>
        <input
          id="username"
          type="text"
          v-model="username"
          required
          placeholder="Введите логин"
        />
      </div>

      <div class="form-group">
        <label for="password">Пароль:</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="Введите пароль"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await authStore.login({
      username: username.value,
      password: password.value
    });

    if (result.success) {
      // Перенаправляем на главную страницу
      router.push('/');
    } else {
      errorMessage.value = result.error || 'Ошибка входа';
    }
  } catch (error) {
    errorMessage.value = 'Ошибка соединения с сервером';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>