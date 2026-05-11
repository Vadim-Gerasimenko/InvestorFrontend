<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Вход в систему</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="text" autocomplete="username" />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <p class="register-link">
        Нет аккаунта?
        <router-link to="/register">Зарегистрироваться</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router/index';

const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  const result = await authStore.login(form.value.email, form.value.password);

  if (result.success) {
    console.log('Login success, token saved:', !!localStorage.getItem('access_token'));
    router.push('/dashboard');
  } else {
    errorMessage.value = result.message || 'Ошибка входа';
  }

  isLoading.value = false;
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5e6 0%, #ffedd5 100%);
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #ffa500;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #ff8c00;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link a {
  color: #ffa500;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
