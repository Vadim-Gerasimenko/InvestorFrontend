<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Регистрация</h2>

      <form @submit.prevent="handleRegister">

        <div class="form-group">
          <label for="lastName"> Фамилия <span class="required">*</span> </label>
          <input id="lastName" v-model="form.lastName" type="text" placeholder="Иванов" />
        </div>

        <div class="form-group">
          <label for="firstName"> Имя <span class="required">*</span> </label>
          <input id="firstName" v-model="form.firstName" type="text" placeholder="Иван" />
        </div>

        <div class="form-group">
          <label for="middleName"> Отчество </label>
          <input
            id="middleName"
            v-model="form.middleName"
            type="text"
            placeholder="Иванович (необязательно)"
          />
        </div>

        <div class="form-group">
          <label for="birthDate"> Дата рождения <span class="required">*</span> </label>
          <input
            id="birthDate"
            v-model="form.birthDate"
            @input="formatBirthDate"
            @keydown="handleDateKeydown"
            type="text"
            placeholder="ДД.ММ.ГГГГ"
            maxlength="10"
          />
        </div>

        <div class="form-group">
          <label for="phoneNumber"> Телефон <span class="required">*</span> </label>
          <input
            id="phoneNumber"
            v-model="form.phoneNumber"
            @input="formatPhoneNumber"
            @keydown="handlePhoneKeydown"
            type="text"
            placeholder="+7 (999) 999-99-99"
            maxlength="18"
          />
        </div>

        <div class="form-group">
          <label for="email"> Email <span class="required">*</span> </label>
          <input id="email" v-model="form.email" type="text" placeholder="example@mail.com" />
        </div>

        <div class="form-group">
          <label for="password"> Пароль <span class="required">*</span> </label>
          <input id="password" v-model="form.password" type="password" placeholder="Пароль" />
        </div>

        <div class="form-group">
          <label for="confirmPassword"> Подтверждение пароля <span class="required">*</span> </label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="Повторите пароль" />
          <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
        </div>

        <div class="required-hint"><span class="required">*</span> - обязательные поля</div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <p class="login-link">
        Уже есть аккаунт?
        <router-link to="/login">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  middleName: '',
  phoneNumber: '',
  birthDate: '',
})

const passwordError = computed(() => {
  if (form.confirmPassword === '') return ''
  if (form.password !== form.confirmPassword) return 'Пароли не совпадают'
  return ''
})

const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')

  if (value.length === 0) {
    form.phoneNumber = ''
    return
  }

  if (value.length === 1 && value === '8') {
    value = '7'
  }

  let formatted = ''
  if (value.length > 0) {
    formatted = '+7'
    if (value.length > 1) {
      formatted += ' (' + value.substring(1, Math.min(4, value.length))
    }
    if (value.length >= 4) {
      formatted += ') ' + value.substring(4, Math.min(7, value.length))
    }
    if (value.length >= 7) {
      formatted += '-' + value.substring(7, Math.min(9, value.length))
    }
    if (value.length >= 9) {
      formatted += '-' + value.substring(9, Math.min(11, value.length))
    }
  }

  form.phoneNumber = formatted
}

const handlePhoneKeydown = (event) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const formatBirthDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')

  if (value.length === 0) {
    form.birthDate = ''
    return
  }

  if (value.length > 8) {
    value = value.slice(0, 8)
  }

  let formatted = ''
  for (let i = 0; i < value.length; i++) {
    if (i === 2 || i === 4) {
      formatted += '.'
    }
    formatted += value[i]
  }

  form.birthDate = formatted
}

const handleDateKeydown = (event) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const cleanPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '')
}

const handleRegister = async () => {
  isLoading.value = true
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Пароли не совпадают'
    isLoading.value = false
    return
  }

  const cleanedPhone = cleanPhoneNumber(form.phoneNumber)

  if (cleanedPhone.length !== 11) {
    errorMessage.value = 'Введите корректный номер телефона (11 цифр)'
    isLoading.value = false
    return
  }

  if (form.birthDate.length !== 10) {
    errorMessage.value = 'Введите корректную дату рождения в формате ДД.ММ.ГГГГ'
    isLoading.value = false
    return
  }

  const registerData = {
    email: form.email,
    password: form.password,
    profile: {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName || null,
      phoneNumber: cleanedPhone,
      birthDate: form.birthDate,
      avatarUrl: null,
    },
  }

  const result = await authStore.register(registerData)

  if (result.success) {
    router.push('/login')
  } else {
    errorMessage.value = result.message
  }

  isLoading.value = false
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5e6 0%, #ffedd5 100%);
  padding: 2rem 1rem;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
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

.required {
  color: #ffa500;
  font-weight: bold;
}

.required-hint {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
  text-align: right;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
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

.error-text {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #ffa500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>