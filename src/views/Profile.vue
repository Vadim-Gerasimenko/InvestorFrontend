<template>
  <div class="profile-container">
    <NotificationBanner
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
    />
    <div class="profile-content">
      <div class="info-card">
        <div v-if="!editing" class="view-mode">
          <div class="user-name">
            {{ user.lastName }} {{ user.firstName }} {{ user.middleName || '' }}
          </div>
          <div class="user-email">{{ user.email }}</div>
          <div class="user-phone">{{ formattedPhone }}</div>
          <button @click="startEdit" class="edit-btn">Редактировать</button>
        </div>

        <div v-else class="edit-mode">
          <div class="form-group">
            <label>Фамилия</label>
            <input v-model="editData.lastName" type="text" />
            <span v-if="profileErrors.lastName" class="error-text">{{
              profileErrors.lastName
            }}</span>
          </div>
          <div class="form-group">
            <label>Имя</label>
            <input v-model="editData.firstName" type="text" />
            <span v-if="profileErrors.firstName" class="error-text">{{
              profileErrors.firstName
            }}</span>
          </div>
          <div class="form-group">
            <label>Отчество</label>
            <input v-model="editData.middleName" type="text" />
          </div>
          <div class="form-group">
            <label>Дата рождения</label>
            <input
              v-model="editData.birthDate"
              @input="formatBirthDateInput"
              @keydown="handleDateKeydown"
              type="text"
              placeholder="ДД.ММ.ГГГГ"
              maxlength="10"
            />
            <span v-if="profileErrors.birthDate" class="error-text">{{
              profileErrors.birthDate
            }}</span>
          </div>
          <div class="form-group">
            <label>Телефон</label>
            <input
              v-model="editData.phoneNumber"
              @input="formatPhoneInput"
              @keydown="handlePhoneKeydown"
              type="text"
              placeholder="+7 (999) 999-99-99"
              maxlength="18"
            />
            <span v-if="profileErrors.phoneNumber" class="error-text">{{
              profileErrors.phoneNumber
            }}</span>
          </div>
          <div class="form-actions">
            <button @click="saveProfile" class="save-btn">Сохранить</button>
            <button @click="cancelEdit" class="cancel-btn">Отмена</button>
          </div>
        </div>
      </div>

      <div class="tariff-card" v-if="tariff.name && tariff.fees && tariff.fees.length > 0">
        <h1 class="tariff-title">{{ tariff.name }}</h1>

        <div class="tax-section">
          <h2>Налоги</h2>
          <div class="tax-list">
            <div class="tax-item">
              <span>НДФЛ</span>
              <span>13%</span>
            </div>
          </div>
        </div>

        <div class="commission-section">
          <h2>Комиссия за операции</h2>
          <div class="commission-list">
            <div class="commission-item" v-for="fee in tariff.fees" :key="fee.instrument">
              <span>{{ fee.instrument }}</span>
              <span>{{ (fee.percentNano / 1000000000).toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tokens-card">
        <h2>Токены Т-Инвестиций</h2>

        <div v-if="tokens.length === 0" class="warning-box">
          <svg class="warning-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="warning-text">
            <strong>Токен отсутствует или некорректен</strong>
            <p>
              Пожалуйста, выпустите новый токен на сайте
              <a href="https://www.tbank.ru/invest/settings/api/" target="_blank" rel="noopener noreferrer" class="warning-link">
                Т-Инвестиции
              </a>
               для конкретного счёта или для всех счетов сразу в режиме "Только просмотр".
            </p>
          </div>
        </div>

        <div class="tokens-list">
          <div
            v-for="token in tokens"
            :key="token.id"
            class="token-item"
            @click="openTokenModal(token)"
          >
            <span class="token-name">{{ token.name }}</span>
            <span class="token-check" v-if="token.isActive">✓</span>
            <span class="token-check empty" v-else></span>
          </div>
          <div class="token-item add-token" @click="openAddModal">
            <span class="token-name add-text">добавить токен</span>
            <span class="token-check add-icon">+</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Добавить токен</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Имя токена</label>
            <input v-model="newToken.name" type="text" placeholder="Мой токен" />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label>Токен</label>
            <input v-model="newToken.value" type="text" placeholder="t.xxxx..." />
            <span v-if="errors.value" class="error-text">{{ errors.value }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="addToken" class="save-btn">Добавить</button>
          <button @click="closeModals" class="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>

    <div v-if="showManageModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Управление токеном</h3>
          <button class="close-btn" @click="closeModals">×</button>
        </div>
        <div class="modal-body">
          <div class="token-info">
            <label>Имя токена</label>
            <p class="token-name-display">{{ selectedToken?.name }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="activateToken" class="save-btn">Активировать</button>
          <button @click="deleteToken" class="delete-btn">Удалить</button>
          <button @click="closeModals" class="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/axios'
import { handleTokenError } from '@/utils/errorHandler'
import NotificationBanner from '@/components/NotificationBanner.vue'

const notification = ref({
  show: false,
  message: '',
  type: 'warning',
})

const showNotification = ({ message, type }) => {
  notification.value = {
    show: true,
    message,
    type,
  }

  setTimeout(() => {
    notification.value.show = false
  }, 15000)
}

const editing = ref(false)
const showAddModal = ref(false)
const showManageModal = ref(false)
const selectedToken = ref(null)
const isLoading = ref(false)

const user = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
})

const tariff = ref({
  name: '',
  fees: [],
})

const tokens = ref([])
const activeToken = ref(null)

const profileErrors = reactive({
  lastName: '',
  firstName: '',
  email: '',
  phoneNumber: '',
})

const editData = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  email: '',
  phoneNumber: '',
})

const newToken = reactive({
  name: '',
  value: '',
})

const errors = reactive({
  name: '',
  value: '',
})

const validateProfile = () => {
  let isValid = true
  profileErrors.lastName = ''
  profileErrors.firstName = ''
  profileErrors.email = ''
  profileErrors.phoneNumber = ''

  if (!editData.lastName.trim()) {
    profileErrors.lastName = 'Фамилия обязательна'
    isValid = false
  }

  if (!editData.firstName.trim()) {
    profileErrors.firstName = 'Имя обязательно'
    isValid = false
  }

  if (!editData.email.trim()) {
    profileErrors.email = 'Email обязателен'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
    profileErrors.email = 'Неверный формат email'
    isValid = false
  }

  const phone = editData.phoneNumber.replace(/\D/g, '')
  if (!phone) {
    profileErrors.phoneNumber = 'Телефон обязателен'
    isValid = false
  } else if (phone.length !== 11) {
    profileErrors.phoneNumber = 'Телефон должен содержать 11 цифр'
    isValid = false
  }

  if (editData.birthDate) {
    const birthDateRegex = /^\d{2}\.\d{2}\.\d{4}$/
    if (!birthDateRegex.test(editData.birthDate)) {
      profileErrors.birthDate = 'Введите дату в формате ДД.ММ.ГГГГ'
      isValid = false
    } else {
      const [day, month, year] = editData.birthDate.split('.').map(Number)
      const date = new Date(year, month - 1, day)
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        profileErrors.birthDate = 'Введите корректную дату'
        isValid = false
      }
    }
  }

  return isValid
}

const formattedPhone = computed(() => {
  const phone = user.phoneNumber.replace(/\D/g, '')
  if (phone.length === 11) {
    return `+7 (${phone.substring(1, 4)}) ${phone.substring(4, 7)}-${phone.substring(7, 9)}-${phone.substring(9, 11)}`
  }
  return user.phoneNumber
})

const formatPhoneInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length === 0) {
    editData.phoneNumber = ''
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
  editData.phoneNumber = formatted
}

const handlePhoneKeydown = (event) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const formatBirthDateForView = (date) => {
  console.log('formatBirthDateForView called with:', date)
  if (!date) return ''
  if (Array.isArray(date)) {
    const [year, month, day] = date
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`
  }
  if (typeof date === 'string') {
    return date
  }
  return ''
}

const formatBirthDateInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')

  if (value.length === 0) {
    editData.birthDate = ''
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

  editData.birthDate = formatted
}

const handleDateKeydown = (event) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const loadProfile = async () => {
  try {
    const response = await api.get('/api/profile/user')
    const data = response.data
    user.lastName = data.lastName || ''
    user.firstName = data.firstName || ''
    user.middleName = data.middleName || ''
    user.email = data.email || ''
    user.phoneNumber = data.phoneNumber?.replace(/\D/g, '') || ''
    user.birthDate = data.birthDate || ''
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error)
  }
}

const updateProfile = async () => {
  try {
    const profileData = {
      lastName: editData.lastName,
      firstName: editData.firstName,
      middleName: editData.middleName,
      email: editData.email,
      phoneNumber: editData.phoneNumber.replace(/\D/g, ''),
      birthDate: editData.birthDate || '',
    }
    await api.put('/api/profile/user', profileData)
    await loadProfile()
    return true
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    return false
  }
}

const loadTariff = async () => {
  try {
    const response = await api.get('/api/profile/tariff')
    tariff.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки тарифа:', error)
    console.error('Ошибка загрузки тарифа:', error)

    if (
      error.response?.data?.message === 'No active token found' ||
      error.response?.data?.message?.includes('Tariff not found')
    ) {
      showNotification({
        message:
          'Токен отсутствует или некорректен. Пожалуйста, получите новый токен на сайте Т-Инвестиций и добавьте его ниже.',
        type: 'warning',
      })
    }
  }
}

const loadTokens = async () => {
  try {
    const response = await api.get('/api/profile/tokens')
    const data = response.data
    activeToken.value = data.activeToken
    tokens.value = data.tokens.map((t) => ({
      id: t.tokenName,
      name: t.tokenName,
      isActive: activeToken.value?.tokenName === t.tokenName,
    }))
  } catch (error) {
    console.error('Ошибка загрузки токенов:', error)

    if (error.response?.data?.message === 'No active token found') {
      showNotification({
        message:
          'У вас нет активного токена. Добавьте токен Т-Инвестиций для работы с приложением.',
        type: 'warning',
      })
    }
  }
}

const startEdit = () => {
  Object.assign(editData, {
    lastName: user.lastName,
    firstName: user.firstName,
    middleName: user.middleName,
    email: user.email,
    phoneNumber: formattedPhone.value,
    birthDate: user.birthDate,
  })
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const saveProfile = async () => {
  if (!validateProfile()) return
  const success = await updateProfile()
  if (success) {
    editing.value = false
    alert('Данные сохранены')
  } else {
    alert('Ошибка сохранения')
  }
}

const openAddModal = () => {
  newToken.name = ''
  newToken.value = ''
  errors.name = ''
  errors.value = ''
  showAddModal.value = true
}

const openTokenModal = (token) => {
  selectedToken.value = token
  showManageModal.value = true
}

const closeModals = () => {
  showAddModal.value = false
  showManageModal.value = false
  selectedToken.value = null
}

const validateToken = () => {
  let isValid = true
  errors.name = ''
  errors.value = ''

  if (!newToken.name.trim()) {
    errors.name = 'Имя токена обязательно'
    isValid = false
  } else if (newToken.name.length < 5) {
    errors.name = 'Имя токена должно быть не короче 5 символов'
    isValid = false
  }

  if (!newToken.value.trim()) {
    errors.value = 'Токен обязателен'
    isValid = false
  } else if (newToken.value.length !== 88) {
    errors.value = 'Длина токена должна быть 88 символов'
    isValid = false
  } else if (!newToken.value.startsWith('t.')) {
    errors.value = 'Неверный формат токена. Токен должен начинаться с "t."'
    isValid = false
  }

  return isValid
}

const addToken = async () => {
  if (!validateToken()) return

  try {
    await api.post('/api/profile/tokens', {
      token: newToken.value,
      name: newToken.name,
    })
    await loadTokens()
    alert('Токен добавлен')
    closeModals()
  } catch (error) {
    console.error('Ошибка добавления токена:', error)
    alert('Ошибка при добавлении токена')
  }
}

const activateToken = async () => {
  try {
    await api.post('/api/profile/tokens/activate', {
      name: selectedToken.value.name,
    })
    await loadTokens()
    alert(`Токен "${selectedToken.value.name}" активирован`)
    closeModals()
  } catch (error) {
    console.error('Ошибка активации токена:', error)
    alert('Ошибка при активации токена')
  }
}

const deleteToken = async () => {
  try {
    await api.delete('/api/profile/tokens', {
      data: { token: selectedToken.value.name },
    })
    await loadTokens()
    alert(`Токен "${selectedToken.value.name}" удален`)
    closeModals()
  } catch (error) {
    console.error('Ошибка удаления токена:', error)
    alert('Ошибка при удалении токена')
  }
}

onMounted(() => {
  loadProfile()
  loadTariff()
  loadTokens()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5e6 0%, #ffedd5 100%);
  padding: 2rem;
}

.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

.info-card,
.tariff-card,
.tokens-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.info-card h2,
.tariff-card h2,
.tokens-card h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.view-mode {
  text-align: center;
  padding: 1rem;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.user-email {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.user-phone {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.user-birthdate {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.edit-btn {
  padding: 0.6rem 1.5rem;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #ff8c00;
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.4rem;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.7rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #ffa500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.save-btn {
  padding: 0.6rem 1.5rem;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover {
  background: #ff8c00;
}

.cancel-btn {
  padding: 0.6rem 1.5rem;
  background: #9e9e9e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #757575;
}

.delete-btn {
  padding: 0.6rem 1.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: #da190b;
}

.tariff-title {
  font-size: 1.8rem;
  color: #ffa500;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.tax-section,
.commission-section {
  margin-bottom: 1.5rem;
}

.tax-section h2,
.commission-section h2 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.tax-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.tax-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.tax-item span:first-child {
  color: #555;
}

.tax-item span:last-child {
  color: #ffa500;
  font-weight: 600;
}

.commission-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.commission-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.commission-item span:first-child {
  color: #555;
}

.commission-item span:last-child {
  color: #ffa500;
  font-weight: 600;
}

.tokens-card h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.tokens-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.token-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.token-item:hover {
  background: #f5f5f5;
}

.token-name {
  font-size: 1rem;
  color: #333;
}

.token-check {
  font-size: 1.2rem;
  font-weight: bold;
  width: 24px;
  text-align: center;
}

.token-check.empty {
  color: #ddd;
}

.token-check:not(.empty) {
  color: #ffa500;
}

.add-token {
  border: 1px dashed #ccc;
  margin-top: 0.5rem;
}

.add-text {
  color: #999;
}

.add-icon {
  color: #ffa500;
  font-size: 1.3rem;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.error-text {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.token-info {
  margin-bottom: 1rem;
}

.token-info label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.token-name-display {
  font-size: 1rem;
  color: #333;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  word-break: break-all;
}

.profit-green {
  color: #4caf50 !important;
  font-weight: 600;
}

.loss-red {
  color: #f44336 !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .user-name {
    font-size: 1.3rem;
  }

  .tariff-title {
    font-size: 1.4rem;
  }
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #fff9f0 0%, #fff4e6 100%);
  border: 1px solid #ffd699;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.08);
}

.warning-icon {
  width: 24px;
  height: 24px;
  min-width: 24px;
  color: #ffa500;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-text {
  flex: 1;
}

.warning-text strong {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #cc8b00;
  margin-bottom: 0.5rem;
}

.warning-text p {
  font-size: 0.9rem;
  color: #8b6b3d;
  line-height: 1.4;
  margin: 0;
}

.warning-link {
  color: #ffa500;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.warning-link:hover {
  color: #cc7b00;
  text-decoration: underline;
}
</style>