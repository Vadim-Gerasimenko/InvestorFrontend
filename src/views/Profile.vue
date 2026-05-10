<template>
  <div class="profile-container">
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
            <label>Email</label>
            <input v-model="editData.email" type="email" />
            <span v-if="profileErrors.email" class="error-text">{{ profileErrors.email }}</span>
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

      <div class="tariff-card">
        <h1 class="tariff-title">Тариф "Инвестор"</h1>

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
            <div class="commission-item">
              <span>Акции</span>
              <span>0.05%</span>
            </div>
            <div class="commission-item">
              <span>Облигации</span>
              <span>0.05%</span>
            </div>
            <div class="commission-item">
              <span>ETF</span>
              <span>0.05%</span>
            </div>
            <div class="commission-item">
              <span>Фьючерсы</span>
              <span>0.02%</span>
            </div>
            <div class="commission-item">
              <span>Опционы</span>
              <span>0.03%</span>
            </div>
            <div class="commission-item">
              <span>Валюта</span>
              <span>0.1%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tokens-card">
        <h2>Токены Т-Инвестиций</h2>
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

const editing = ref(false)
const showAddModal = ref(false)
const showManageModal = ref(false)
const selectedToken = ref(null)

const user = reactive({
  lastName: 'Иванов',
  firstName: 'Иван',
  middleName: 'Иванович',
  email: 'ivan@example.com',
  phoneNumber: '79123456789',
})

const profileErrors = reactive({
  lastName: '',
  firstName: '',
  email: '',
  phoneNumber: '',
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

  return isValid
}

const editData = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  email: '',
  phoneNumber: '',
})

const tokens = ref([
  { id: 1, name: 'Токен 1', value: 't.xxxx1', isActive: true },
  { id: 2, name: 'Токен 2', value: 't.xxxx2', isActive: false },
])

const newToken = reactive({
  name: '',
  value: '',
})

const errors = reactive({
  name: '',
  value: '',
})

const financialData = reactive({
  currentCashBalance: 100000.00,
  portfolioAmount: 250000.00,
  potentialTotalProfit: 35000.00,
  closedTradesFees: 1500.00,
  closedTradesProfitBeforeTax: 50000.00,
  closedTradesTax: 6500.00,
  closedTradesProfit: 43500.00,
  closedTradesPassiveIncome: 5000.00,
  closedTradesTotalProfit: 48500.00,
  openTradesFees: 2000.00,
  openTradesProfitBeforeTax: 40000.00,
  openTradesPotentialTaxableBase: 40000.00,
  openTradesPotentialTax: 5200.00,
  openTradesPotentialProfit: 34800.00,
  openTradesPassiveIncome: 3000.00,
  openTradesTotalPotentialProfit: 37800.00
})

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

const startEdit = () => {
  Object.assign(editData, {
    lastName: user.lastName,
    firstName: user.firstName,
    middleName: user.middleName,
    email: user.email,
    phoneNumber: formattedPhone.value,
  })
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
}

const saveProfile = () => {
  if (!validateProfile()) return

  const cleanPhone = editData.phoneNumber.replace(/\D/g, '')
  Object.assign(user, {
    lastName: editData.lastName,
    firstName: editData.firstName,
    middleName: editData.middleName,
    email: editData.email,
    phoneNumber: cleanPhone,
  })
  editing.value = false
  console.log('Сохраненные данные:', user)
  alert('Данные сохранены')
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
  } else if (newToken.value.length !== 80) {
    errors.value = 'Длина токена должна быть 80 символов'
    isValid = false
  } else if (!newToken.value.startsWith('t.')) {
    errors.value = 'Неверный формат токена. Токен должен начинаться с "t."'
    isValid = false
  }

  return isValid
}

const addToken = () => {
  if (!validateToken()) return

  const newId = Math.max(...tokens.value.map((t) => t.id), 0) + 1
  tokens.value.push({
    id: newId,
    name: newToken.name,
    value: newToken.value,
    isActive: false,
  })

  console.log('Добавлен токен:', newToken)
  alert('Токен добавлен (тестовый режим)')
  closeModals()
}

const activateToken = () => {
  tokens.value.forEach((t) => {
    t.isActive = t.id === selectedToken.value.id
  })
  console.log('Активирован токен:', selectedToken.value)
  alert(`Токен "${selectedToken.value.name}" активирован`)
  closeModals()
}

const deleteToken = () => {
  const index = tokens.value.findIndex((t) => t.id === selectedToken.value.id)
  if (index !== -1) {
    tokens.value.splice(index, 1)
  }
  console.log('Удален токен:', selectedToken.value)
  alert(`Токен "${selectedToken.value.name}" удален`)
  closeModals()
}

const getValueClass = (value, type) => {
  if (type === 'positive-negative') {
    if (value > 0) return 'profit-green'
    if (value < 0) return 'loss-red'
    return ''
  }
  if (type === 'positive-only') {
    if (value > 0) return 'loss-red'
    return ''
  }
  if (type === 'black-only') {
    return ''
  }
  return ''
}

const formatValue = (value, type) => {
  if (type === 'positive-only' && (!value || value === 0)) return '—'
  if (type === 'positive-negative' && (!value && value !== 0)) return '0.00'
  return Number(value).toFixed(2)
}

onMounted(() => {
  console.log('Profile загружен')
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
</style>