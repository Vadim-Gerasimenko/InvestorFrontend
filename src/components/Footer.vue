<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© 2026 Веб-сервис для финансового анализа результатов биржевого инвестора</p>
      <p>
        Автор: Вадим Герасименко |
        <a href="mailto:v.gerasimenko.2022@stud.nstu.ru" class="email-link"
          >v.gerasimenko.2022@stud.nstu.ru</a
        >
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #ffa500;
  padding: 1.5rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.footer-content p {
  margin: 0.5rem 0;
}

.email-link {
  color: white;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.email-link:hover {
  border-bottom-color: white;
}
</style>
