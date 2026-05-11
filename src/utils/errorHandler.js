import router from '@/router/index'

export const handleTokenError = (error, showNotification = null) => {
  const errorMessage = error.response?.data?.message || ''

  if (errorMessage === 'No active token found' ||
    errorMessage.includes('token') ||
    errorMessage.includes('Tariff not found')) {

    if (showNotification) {
      showNotification({
        message: 'Токен отсутствует или некорректен. Пожалуйста, получите новый токен на сайте Т-Инвестиций для всех счетов и/или для конкретного счёта в режиме "Только для чтения" и добавьте новый токен.',
        type: 'warning'
      })
    }

    setTimeout(() => {
      router.push('/profile')
    }, 2000)

    return true
  }
  return false
}