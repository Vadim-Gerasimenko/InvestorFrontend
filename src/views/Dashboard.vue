<template>
  <div class="dashboard-container">
    <NotificationBanner
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
    />
    <div class="tabs-wrapper">
      <div class="account-card">
        <h2>Счёт</h2>
        <div class="account-list">
          <div
            v-for="account in accounts"
            :key="account.id"
            class="account-item"
            @click="selectAccount(account.id)"
          >
            <div class="account-info">
              <span class="account-name">{{ account.name }}</span>
              <div class="account-badges">
          <span class="badge badge-status" :class="getStatusClass(account.status)">
            {{ account.status }}
          </span>
                <span class="badge badge-access" :class="getAccessClass(account.accessLevel)">
            {{ account.accessLevel }}
          </span>
              </div>
            </div>
            <span class="account-check" v-if="selectedAccount === account.id">✓</span>
          </div>
        </div>
      </div>

      <div class="tabs-header">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :class="[
            'tab-btn',
            { active: activeTab === tab.id, first: index === 0, last: index === tabs.length - 1 },
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
      <div class="tabs-content">
        <div v-if="activeTab === 'financial'" class="tab-pane">
          <div class="info-block">
            <h3>Состояние портфеля</h3>
            <div class="info-row">
              <span>Баланс, руб</span>
              <span>{{ formatNumber(report?.financialSummary?.currentCashBalance) }}</span>
            </div>
            <div class="info-row">
              <span>Рыночная стоимость портфеля, руб</span>
              <span>{{ formatNumber(report?.financialSummary?.portfolioAmount) }}</span>
            </div>
            <div class="info-row">
              <span>Потенциальная прибыль за всё время, руб</span>
              <span :class="getProfitClass(report?.financialSummary?.potentialTotalProfit)">
                {{ formatNumber(report?.financialSummary?.potentialTotalProfit) }}
              </span>
            </div>
          </div>

          <div class="info-block">
            <h3>Закрытые сделки</h3>
            <div class="info-row">
              <span>Сумма удержанных комиссий, руб</span>
              <span :class="getFeeClass(report?.financialSummary?.closedTradesFees)">
                {{ formatFeeValue(report?.financialSummary?.closedTradesFees) }}
              </span>
            </div>
            <div class="info-row">
              <span>Доход от трейдов (до НДФЛ), руб</span>
              <span
                :class="
                  getTradingProfitClass(report?.financialSummary?.closedTradesProfitBeforeTax)
                "
              >
                {{ formatNumber(report?.financialSummary?.closedTradesProfitBeforeTax) }}
              </span>
            </div>
            <div class="info-row">
              <span>НДФЛ на доход от трейдов, руб</span>
              <span :class="getTaxClass(report?.financialSummary?.closedTradesTax)">
                {{ formatTaxValue(report?.financialSummary?.closedTradesTax) }}
              </span>
            </div>
            <div class="info-row">
              <span>Прибыль от трейдов, руб</span>
              <span :class="getProfitClass(report?.financialSummary?.closedTradesProfit)">
                {{ formatNumber(report?.financialSummary?.closedTradesProfit) }}
              </span>
            </div>
            <div class="info-row">
              <span>Прибыль от дивидендов/купонов, руб</span>
              <span
                :class="getPassiveIncomeClass(report?.financialSummary?.closedTradesPassiveIncome)"
              >
                {{ formatPassiveIncomeValue(report?.financialSummary?.closedTradesPassiveIncome) }}
              </span>
            </div>
            <div class="info-row total">
              <span>Итоговая прибыль, руб</span>
              <span
                :class="getProfitClass(report?.financialSummary?.closedTradesTotalProfit)"
                class="bold-number"
              >
                {{ formatNumber(report?.financialSummary?.closedTradesTotalProfit) }}
              </span>
            </div>
          </div>

          <div class="info-block">
            <h3>Открытые позиции</h3>
            <div class="info-row">
              <span>Потенциальные комиссии, руб</span>
              <span :class="getFeeClass(report?.financialSummary?.openTradesFees)">
                {{ formatFeeValue(report?.financialSummary?.openTradesFees) }}
              </span>
            </div>
            <div class="info-row">
              <span>Потенциальный доход от трейдов (до НДФЛ), руб</span>
              <span
                :class="getTradingProfitClass(report?.financialSummary?.openTradesProfitBeforeTax)"
              >
                {{ formatNumber(report?.financialSummary?.openTradesProfitBeforeTax) }}
              </span>
            </div>
            <div class="info-row">
              <span>Потенциальная налогооблагаемая база, руб</span>
              <span class="black-number">
                {{ formatNumber(report?.financialSummary?.openTradesPotentialTaxableBase) }}
              </span>
            </div>
            <div class="info-row">
              <span>Потенциальный НДФЛ на доход от трейдов, руб</span>
              <span :class="getTaxClass(report?.financialSummary?.openTradesPotentialTax)">
                {{ formatTaxValue(report?.financialSummary?.openTradesPotentialTax) }}
              </span>
            </div>
            <div class="info-row">
              <span>Потенциальная прибыль от трейдов, руб</span>
              <span :class="getProfitClass(report?.financialSummary?.openTradesPotentialProfit)">
                {{ formatNumber(report?.financialSummary?.openTradesPotentialProfit) }}
              </span>
            </div>
            <div class="info-row">
              <span>Прибыль от дивидендов/купонов, руб</span>
              <span
                :class="getPassiveIncomeClass(report?.financialSummary?.openTradesPassiveIncome)"
              >
                {{ formatPassiveIncomeValue(report?.financialSummary?.openTradesPassiveIncome) }}
              </span>
            </div>
            <div class="info-row total">
              <span>Потенциальная прибыль, руб</span>
              <span
                :class="getProfitClass(report?.financialSummary?.openTradesTotalPotentialProfit)"
                class="bold-number"
              >
                {{ formatNumber(report?.financialSummary?.openTradesTotalPotentialProfit) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'closed'" class="tab-pane">
          <h2>Закрытые сделки</h2>
          <div
            v-for="(trades, instrumentType) in groupedClosedTrades"
            :key="instrumentType"
            class="type-group"
          >
            <div class="type-header" @click="toggleTypeExpand(instrumentType)">
              <h3 class="type-title">{{ getInstrumentTypeName(instrumentType) }}</h3>
              <span class="expand-icon">{{ expandedTypes[instrumentType] ? '▲' : '▼' }}</span>
            </div>
            <div v-if="expandedTypes[instrumentType]" class="type-content">
              <div v-for="trade in trades" :key="trade.uniqueId" class="trade-card">
                <div class="trade-header" @click="toggleTradeExpand(trade.uniqueId)">
                  <div class="trade-info">
                    <span class="trade-name"
                      >{{ trade.instrument?.name }} ({{ trade.instrument?.ticker }})</span
                    >
                    <span class="trade-date">открытие: {{ formatDate(trade.openedAt) }}</span>
                    <span class="trade-date">закрытие: {{ formatDate(trade.closedAt) }}</span>
                    <span class="trade-label">прибыль:</span>
                    <span
                      :class="getProfitClass(trade.profitFromSpeculation + trade.passiveIncome)"
                    >
                      {{ formatNumber(trade.profitFromSpeculationBeforeTax + trade.passiveIncome) }}
                    </span>
                  </div>
                  <div class="trade-controls">
                    <span class="details-link">Подробнее</span>
                    <span class="expand-icon">{{
                      expandedTrades[trade.uniqueId] ? '▲' : '▼'
                    }}</span>
                  </div>
                </div>

                <div v-if="expandedTrades[trade.uniqueId]" class="trade-details">
                  <div class="details-columns">
                    <div class="detail-column">
                      <div class="detail-row">
                        <span>Оборот по инструменту в рамках трейда, шт</span>
                        <span>{{ trade.totalBuyQuantity }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Объём покупок, руб</span>
                        <span>{{ formatNumber(trade.totalBuyValue) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Объём продаж, руб</span>
                        <span>{{
                          trade.totalSellValue > 0
                            ? formatNumber(trade.totalSellValue)
                            : 'Не продавалась'
                        }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Средняя цена покупки, руб/шт</span>
                        <span>{{ formatNumber(trade.avgBuyPrice) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Средняя цена продажи, руб/шт</span>
                        <span>{{
                          trade.avgSellPrice > 0
                            ? formatNumber(trade.avgSellPrice)
                            : 'Не продавалась'
                        }}</span>
                      </div>
                    </div>

                    <div class="detail-column">
                      <div class="detail-row">
                        <span>Комиссия, удержанная брокером, руб</span>
                        <span :class="getFeeClass(trade.accruedFees)">
                          {{ formatFeeValue(trade.accruedFees) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Налог, удержанный брокером, руб</span>
                        <span :class="getTaxClass(trade.accruedTaxes)">
                          {{ formatTaxValue(trade.accruedTaxes) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Выплаты дивидендов/купонов, руб</span>
                        <span :class="getPassiveIncomeClass(trade.passiveIncomeBeforeTax)">
                          {{ formatPassiveIncomeValue(trade.passiveIncomeBeforeTax) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Прибыль от дивидендов/купонов, руб</span>
                        <span :class="getPassiveIncomeClass(trade.passiveIncome)">
                          {{ formatPassiveProfitValue(trade.passiveIncome) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Доход от трейдинга (до НДФЛ), руб</span>
                        <span :class="getTradingProfitClass(trade.profitFromSpeculationBeforeTax)">
                          {{ formatNumber(trade.profitFromSpeculationBeforeTax) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="operations-section">
                    <div
                      class="operations-header"
                      @click="toggleOperationsExpand(trade.uniqueId)"
                    >
                      <span class="operations-link">Операции по инструменту</span>
                      <span class="expand-icon">{{
                        expandedOperations[trade.uniqueId] ? '▲' : '▼'
                      }}</span>
                    </div>

                    <div
                      v-if="expandedOperations[trade.uniqueId]"
                      class="operations-table-wrapper"
                    >
                      <table class="operations-table">
                        <thead>
                          <tr>
                            <th>Дата</th>
                            <th>Тип операции</th>
                            <th>Количество</th>
                            <th>Цена, руб</th>
                            <th>Сумма, руб</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="op in trade.operations" :key="op.id">
                            <td>{{ formatDateTime(op.date) }}</td>
                            <td>{{ getOperationTypeName(op.operationType) }}</td>
                            <td>{{ op.quantity > 0 ? op.quantity : '—' }}</td>
                            <td>
                              {{
                                op.trades?.length
                                  ? formatNumber(op.trades[0]?.price / 1000000000)
                                  : '—'
                              }}
                            </td>
                            <td>{{ formatNumber(op.payment / 1000000000) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'open'" class="tab-pane">
          <h2>Открытые позиции</h2>
          <div
            v-for="(trades, instrumentType) in groupedOpenTrades"
            :key="instrumentType"
            class="type-group"
          >
            <div class="type-header" @click="toggleOpenTypeExpand(instrumentType)">
              <h3 class="type-title">{{ getInstrumentTypeName(instrumentType) }}</h3>
              <span class="expand-icon">{{ expandedOpenTypes[instrumentType] ? '▲' : '▼' }}</span>
            </div>
            <div v-if="expandedOpenTypes[instrumentType]" class="type-content">
              <div v-for="trade in trades" :key="trade.uniqueId" class="trade-card">
                <div class="trade-header" @click="toggleOpenTradeExpand(trade.uniqueId)">
                  <div class="trade-info">
                    <span class="trade-name"
                      >{{ trade.instrument?.name }} ({{ trade.instrument?.ticker }})</span
                    >
                    <span class="trade-date">количество: {{ trade.remainingQuantity }}</span>
                    <span class="trade-date"
                      >стоимость: {{ formatNumber(trade.currentAmount) }}</span
                    >
                    <span class="trade-label">прогнозируемая прибыль:</span>
                    <span
                      :class="
                        getProfitClass(trade.passiveIncome + trade.profitFromSpeculationBeforeTax)
                      "
                    >
                      {{ formatNumber(trade.passiveIncome + trade.profitFromSpeculationBeforeTax) }}
                    </span>
                  </div>
                  <div class="trade-controls">
                    <span class="details-link">Подробнее</span>
                    <span class="expand-icon">{{
                      expandedOpenTrades[trade.uniqueId] ? '▲' : '▼'
                    }}</span>
                  </div>
                </div>

                <div v-if="expandedOpenTrades[trade.uniqueId]" class="trade-details">
                  <div class="details-columns">
                    <div class="detail-column">
                      <div class="detail-row">
                        <span>Дата открытия</span>
                        <span>{{ formatDate(trade.openedAt) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Текущая цена, руб/шт</span>
                        <span>{{ formatNumber(trade.currentPrice) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Куплено в рамках трейда, шт</span>
                        <span>{{ trade.totalBuyQuantity }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Продано в рамках трейда, шт</span>
                        <span>{{
                          trade.totalSellQuantity > 0 ? trade.totalSellQuantity : '—'
                        }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Средняя цена покупки, руб/шт</span>
                        <span>{{ formatNumber(trade.avgBuyPrice) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Средняя цена продажи, руб/шт</span>
                        <span>{{
                          trade.avgSellPrice > 0 ? formatNumber(trade.avgSellPrice) : '—'
                        }}</span>
                      </div>
                    </div>

                    <div class="detail-column">
                      <div class="detail-row">
                        <span>Комиссия, удержанная брокером, руб</span>
                        <span :class="getFeeClass(trade.accruedFees)">
                          {{ formatFeeValue(trade.accruedFees) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Налог, удержанный брокером, руб</span>
                        <span :class="getTaxClass(trade.accruedTaxes)">
                          {{ formatTaxValue(trade.accruedTaxes) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Прогнозируемая комиссия брокера, руб</span>
                        <span class="loss-red">{{ formatNumber(trade.potentialFees) }}</span>
                      </div>
                      <div class="detail-row">
                        <span>Выплаты дивидендов/купонов, руб</span>
                        <span :class="getPassiveIncomeClass(trade.passiveIncomeBeforeTax)">
                          {{ formatPassiveIncomeValue(trade.passiveIncomeBeforeTax) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Прибыль от дивидендов/купонов, руб</span>
                        <span
                          :class="getPassiveProfitClass(trade.passiveIncome, trade.passiveIncome)"
                        >
                          {{ formatPassiveProfitValue(trade.passiveIncome) }}
                        </span>
                      </div>
                      <div class="detail-row">
                        <span>Прогнозируемый доход от трейдинга (до НДФЛ), руб</span>
                        <span :class="getTradingProfitClass(trade.profitFromSpeculationBeforeTax)">
                          {{ formatNumber(trade.profitFromSpeculationBeforeTax) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="operations-section">
                    <div
                      class="operations-header"
                      @click="toggleOpenOperationsExpand(trade.uniqueId)"
                    >
                      <span class="operations-link">Операции по инструменту</span>
                      <span class="expand-icon">{{
                        expandedOpenOperations[trade.uniqueId] ? '▲' : '▼'
                      }}</span>
                    </div>

                    <div
                      v-if="expandedOpenOperations[trade.uniqueId]"
                      class="operations-table-wrapper"
                    >
                      <table class="operations-table">
                        <thead>
                          <tr>
                            <th>Дата</th>
                            <th>Тип операции</th>
                            <th>Количество</th>
                            <th>Цена, руб</th>
                            <th>Сумма, руб</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="op in trade.operations" :key="op.id">
                            <td>{{ formatDateTime(op.date) }}</td>
                            <td>{{ getOperationTypeName(op.operationType) }}</td>
                            <td>{{ op.quantity > 0 ? op.quantity : '—' }}</td>
                            <td>
                              {{
                                op.trades?.length
                                  ? formatNumber(op.trades[0]?.price / 1000000000)
                                  : '—'
                              }}
                            </td>
                            <td>{{ formatNumber(op.payment / 1000000000) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'balance'" class="tab-pane">
          <h2>Операции с балансом</h2>

          <div class="balance-group">
            <div class="balance-header" @click="toggleBalanceExpand('deposit')">
              <h3 class="balance-title">Пополнение счёта</h3>
              <span class="expand-icon">{{ expandedBalance.deposit ? '▲' : '▼' }}</span>
            </div>

            <div v-if="expandedBalance.deposit" class="balance-content">
              <div class="balance-table-wrapper">
                <table class="balance-table">
                  <thead>
                    <tr>
                      <th class="text-left">Дата</th>
                      <th class="text-right">Сумма, руб</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="op in report?.financialSummary?.inputOperations" :key="op.id">
                      <td class="text-left">{{ formatDateTime(op.date) }}</td>
                      <td class="text-right">{{ formatNumber(op.payment / 1000000000) }}</td>
                    </tr>
                    <tr v-if="!report?.financialSummary?.inputOperations?.length">
                      <td colspan="2" class="text-center">Нет операций</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="balance-group">
            <div class="balance-header" @click="toggleBalanceExpand('withdraw')">
              <h3 class="balance-title">Вывод денежных средств</h3>
              <span class="expand-icon">{{ expandedBalance.withdraw ? '▲' : '▼' }}</span>
            </div>
            <div v-if="expandedBalance.withdraw" class="balance-content">
              <div class="balance-table-wrapper">
                <table class="balance-table">
                  <thead>
                    <tr>
                      <th class="text-left">Дата</th>
                      <th class="text-right">Сумма, руб</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="op in report?.financialSummary?.outputOperations" :key="op.id">
                      <td class="text-left">{{ formatDateTime(op.date) }}</td>
                      <td class="text-right">{{ formatNumber(op.payment / 1000000000) }}</td>
                    </tr>
                    <tr v-if="!report?.financialSummary?.outputOperations?.length">
                      <td colspan="2" class="text-center">Нет операций</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="export-bar">
        <button @click="exportToExcel" class="export-btn" :disabled="isExporting">
          <svg class="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 10V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 15V3M9 6L12 3L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ isExporting ? 'Выгрузка...' : 'Выгрузить отчёт' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/utils/axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router/index'
import { accountService } from '@/services/accountService'
import { handleTokenError } from '@/utils/errorHandler'
import NotificationBanner from '@/components/NotificationBanner.vue'

const notification = ref({
  show: false,
  message: '',
  type: 'warning'
})

const showNotification = ({ message, type }) => {
  notification.value = {
    show: true,
    message,
    type
  }

  setTimeout(() => {
    notification.value.show = false
  }, 30000)
}

const activeTab = ref('financial')
const selectedAccount = ref(null)
const report = ref({})
const errorMessage = ref('')
const expandedTrades = ref({})
const expandedOperations = ref({})
const expandedTypes = ref({})
const expandedOpenTrades = ref({})
const expandedOpenOperations = ref({})
const expandedOpenTypes = ref({})
const accounts = ref([])
const isLoadingAccounts = ref(false)

const authStore = useAuthStore();

const tabs = [
  { id: 'financial', name: 'Финансовые показатели' },
  { id: 'closed', name: 'Закрытые сделки' },
  { id: 'open', name: 'Открытые позиции' },
  { id: 'balance', name: 'Операции с балансом' },
]

const loadAccounts = async () => {
  isLoadingAccounts.value = true;
  try {
    const data = await accountService.getAllAccounts();
    console.log('Accounts loaded:', data);

    accounts.value = data.accounts.map(acc => ({
      id: acc.name,
      name: acc.name,
      type: acc.type,
      status: acc.status,
      accessLevel: acc.accessLevel
    }));

    if (data.activeAccount) {
      selectedAccount.value = data.activeAccount.name;
    } else if (accounts.value.length > 0) {
      selectedAccount.value = accounts.value[0].id;
    }

    if (selectedAccount.value) {
      await loadReport();
    }
  } catch (error) {
    console.error('Error loading accounts:', error);

    if (handleTokenError(error, showNotification)) {
      return
    }

    errorMessage.value = 'Ошибка загрузки счетов';
  } finally {
    isLoadingAccounts.value = false;
  }
}

const selectAccount = async (accountId) => {
  if (selectedAccount.value === accountId) return;

  selectedAccount.value = accountId;

  try {
    await accountService.activateAccount(accountId);
    console.log('Account activated:', accountId);
    await loadReport();
  } catch (error) {
    console.error('Error activating account:', error);
    errorMessage.value = 'Ошибка активации счета';
  }
}

const getStatusClass = (status) => {
  if (status === 'Открытый рабочий счёт') return 'badge-active'
  if (status === 'Новый счёт в процессе открытия') return 'badge-pending'
  if (status === 'Закрытый счёт') return 'badge-closed'
  return 'badge-unknown'
}

const getAccessClass = (accessLevel) => {
  if (accessLevel === 'Полный доступ к счёту') return 'badge-full'
  if (accessLevel === 'Доступ с уровнем прав «только чтение»') return 'badge-readonly'
  if (accessLevel === 'Нет доступа') return 'badge-no-access'
  return 'badge-unknown'
}

const groupedClosedTrades = computed(() => {
  if (!report.value?.closedTrades) return {}
  return report.value.closedTrades.reduce((groups, trade) => {
    const type = trade.instrument?.type || 'other'
    if (!groups[type]) groups[type] = []
    groups[type].push({
      ...trade,
      uniqueId: `${trade.instrument?.uid}_${trade.openedAt}_${trade.closedAt}`
    })
    return groups
  }, {})
})

const groupedOpenTrades = computed(() => {
  if (!report.value?.openTrades) return {}
  return report.value.openTrades.reduce((groups, trade) => {
    const type = trade.instrument?.type || 'other'
    if (!groups[type]) groups[type] = []
    groups[type].push({
      ...trade,
      uniqueId: `${trade.instrument?.uid}_${trade.openedAt}_${trade.remainingQuantity}`
    })
    return groups
  }, {})
})

const getInstrumentTypeName = (type) => {
  const types = {
    stock: 'Акции',
    bond: 'Облигации',
    etf: 'ETF',
    future: 'Фьючерсы',
    option: 'Опционы',
    currency: 'Валюта',
  }
  return types[type] || type
}

const getOperationTypeName = (type) => {
  const types = {
    BUY: 'Покупка',
    SELL: 'Продажа',
    DIVIDEND: 'Дивиденды',
    COUPON: 'Купон',
  }
  return types[type] || type
}

const toggleTypeExpand = (type) => {
  expandedTypes.value[type] = !expandedTypes.value[type]
}

const toggleOpenTypeExpand = (type) => {
  expandedOpenTypes.value[type] = !expandedOpenTypes.value[type]
}

const toggleTradeExpand = (uniqueId) => {
  expandedTrades.value[uniqueId] = !expandedTrades.value[uniqueId]
}

const toggleOpenTradeExpand = (uniqueId) => {
  expandedOpenTrades.value[uniqueId] = !expandedOpenTrades.value[uniqueId]
}

const toggleOperationsExpand = (uniqueId) => {
  expandedOperations.value[uniqueId] = !expandedOperations.value[uniqueId]
}

const toggleOpenOperationsExpand = (uniqueId) => {
  expandedOpenOperations.value[uniqueId] = !expandedOpenOperations.value[uniqueId]
}

const formatNumber = (value) => {
  if (!value && value !== 0) return '0.00'
  return Number(value).toFixed(2)
}

const formatDate = (date) => {
  if (!date) return ''
  if (Array.isArray(date)) {
    const [year, month, day] = date
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`
  }
  return new Date(date).toLocaleDateString('ru-RU')
}

const formatDateTime = (date) => {
  if (!date) return ''
  if (Array.isArray(date)) {
    const [year, month, day, hour, minute, second] = date
    const sec = second !== undefined ? String(second).padStart(2, '0') : '00'
    return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${sec}`
  }
  return new Date(date).toLocaleString('ru-RU')
}

const getProfitClass = (value) => {
  if (value >= 0) return 'profit-green'
  return 'loss-red'
}

const getFeeClass = (value) => {
  if (value && value > 0) return 'loss-red'
  return ''
}

const getTaxClass = (value) => {
  if (value && value > 0) return 'loss-red'
  return ''
}

const getPassiveIncomeClass = (value) => {
  if (value && value > 0) return 'profit-green'
  return ''
}

const getPassiveProfitClass = (value) => {
  if (value && value > 0) return 'profit-green'
  return ''
}

const getTradingProfitClass = (value) => {
  if (value >= 0) return 'profit-green'
  return 'loss-red'
}

const formatFeeValue = (value) => {
  if (!value || value === 0) return '—'
  return formatNumber(value)
}

const formatTaxValue = (value) => {
  if (!value || value === 0) return '—'
  return formatNumber(value)
}

const formatPassiveIncomeValue = (value) => {
  if (!value || value === 0) return '—'
  return formatNumber(value)
}

const formatPassiveProfitValue = (value) => {
  if (!value || value === 0) return '—'
  return formatNumber(value)
}

const loadReport = async () => {
  try {
    console.log('Loading report for account:', selectedAccount.value);
    const response = await api.get('/api/portfolio/report');
    report.value = response.data;
    console.log('Report loaded successfully');
  } catch (error) {
    console.error('Load report error:', error);

    if (handleTokenError(error, showNotification)) {
      return
    }
    errorMessage.value = 'Ошибка загрузки данных';
  }
};

let refreshInterval = null

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    if (authStore.isAuthenticated && selectedAccount.value) {
      loadReport()
    }
  }, 10000)
}

const expandedBalance = ref({
  deposit: true,
  withdraw: true,
})

const toggleBalanceExpand = (type) => {
  expandedBalance.value[type] = !expandedBalance.value[type]
}

const isExporting = ref(false)

const exportToExcel = async () => {
  isExporting.value = true

  try {
    const response = await api.get('/api/portfolio/report/excel', {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let filename = 'report.xlsx'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '')
      }
    }

    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showNotification({
      message: 'Отчет успешно выгружен',
      type: 'success'
    })
  } catch (error) {
    console.error('Export error:', error)

    if (handleTokenError(error, showNotification)) {
      return
    }

    showNotification({
      message: 'Ошибка при выгрузке отчета',
      type: 'error'
    })
  } finally {
    isExporting.value = false
  }
}

onMounted(async () => {
  console.log('Dashboard mounted')
  console.log('Authenticated:', authStore.isAuthenticated)

  if (!authStore.isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    router.push('/login')
    return
  }

  await loadAccounts()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 140px);
  background: linear-gradient(135deg, #fff5e6 0%, #ffedd5 100%);
  padding: 2rem;
}

.tabs-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.account-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.account-card h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.account-item:hover {
  background: #f5f5f5;
}

.account-name {
  font-size: 1rem;
  color: #333;
}

.account-check {
  color: #ffa500;
  font-size: 1.2rem;
  font-weight: bold;
}

.tabs-header {
  display: flex;
  flex-wrap: wrap;
}

.tab-btn {
  background: #e0e0e0;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: -1px;
}

.tab-btn.first {
  border-radius: 12px 0 0 0;
  margin-left: 0;
}

.tab-btn.last {
  border-radius: 0 12px 0 0;
}

.tab-btn.active {
  background: white;
  color: #ffa500;
  position: relative;
  z-index: 1;
}

.tab-btn:hover:not(.active) {
  background: #d0d0d0;
}

.tabs-content {
  background: white;
  border-radius: 0 12px 12px 12px;
  padding: 2rem;
  min-height: 500px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tab-pane h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.info-block {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.total {
  margin-top: 0.5rem;
  padding-top: 0.8rem;
  border-top: 2px solid #ddd;
  font-weight: bold;
}

.type-group {
  margin-bottom: 1.5rem;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.type-header:hover {
  background: #f0f0f0;
}

.type-title {
  color: #ffa500 !important;
  font-size: 1.2rem !important;
  margin: 0 !important;
  padding-left: 0.5rem;
  border-left: 4px solid #ffa500;
}

.type-content {
  margin-top: 0.5rem;
  padding-left: 0.5rem;
}

.trade-card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.trade-header:hover {
  background: #f0f0f0;
}

.trade-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.trade-name {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.trade-date {
  color: #666;
  font-size: 0.85rem;
}

.trade-label {
  color: #666;
  font-size: 0.85rem;
}

.trade-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-link {
  color: #999;
  font-size: 0.85rem;
}

.expand-icon {
  color: #ffa500;
  font-size: 0.9rem;
  cursor: pointer;
}

.trade-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.details-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.detail-column {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span:first-child {
  color: #666;
  font-size: 0.85rem;
}

.detail-row span:last-child {
  color: #333;
  font-weight: 500;
}

.profit-green {
  color: #4caf50 !important;
}

.loss-red {
  color: #f44336 !important;
}

.black-number {
  color: #333 !important;
}

.bold-number {
  font-weight: 600 !important;
}

.operations-section {
  margin-top: 0.5rem;
}

.operations-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.operations-header:hover {
  background: #f0f0f0;
}

.operations-link {
  color: #ffa500;
  font-size: 0.9rem;
}

.operations-table-wrapper {
  margin-top: 1rem;
  overflow-x: auto;
}

.operations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.operations-table th,
.operations-table td {
  padding: 0.6rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.operations-table th {
  background: #f5f5f5;
  color: #555;
  font-weight: 600;
}

.operation-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}

.profit {
  color: #4caf50;
}

.loss {
  color: #f44336;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .tab-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .tabs-content {
    padding: 1rem;
  }

  .trade-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .details-columns {
    grid-template-columns: 1fr;
  }
}

.balance-group {
  margin-bottom: 1.5rem;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.8rem 1rem;
  background: #f9f9f9;
  border-radius: 12px;
  transition: background 0.2s;
}

.balance-header:hover {
  background: #f0f0f0;
}

.balance-title {
  color: #ffa500 !important;
  font-size: 1.1rem !important;
  margin: 0 !important;
}

.balance-content {
  margin-top: 0.5rem;
}

.balance-table-wrapper {
  overflow-x: auto;
}

.balance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.balance-table th,
.balance-table td {
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
}

.balance-table th {
  background: #f5f5f5;
  color: #555;
  font-weight: 600;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.balance-table td.text-right {
  font-weight: 500;
}

.operations-table th,
.operations-table td,
.balance-table th,
.balance-table td {
  text-align: right;
}

.operations-table th:first-child,
.operations-table td:first-child,
.operations-table th:nth-child(2),
.operations-table td:nth-child(2),
.balance-table th:first-child,
.balance-table td:first-child {
  text-align: left;
}

.balance-table td.profit,
.balance-table td.loss {
  color: #333 !important;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.account-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.account-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.badge-status {
  background: #f0f0f0;
  color: #666;
}

.badge-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-closed {
  background: #fde4e4;
  color: #c62828;
}

.badge-blocked {
  background: #fff3e0;
  color: #ef6c00;
}

.badge-access {
  background: #e3f2fd;
  color: #1565c0;
}

.badge-readonly {
  background: #fff8e1;
  color: #f9a825;
}

.badge-full {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-unknown {
  background: #f5f5f5;
  color: #9e9e9e;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.account-item:hover {
  background: #f5f5f5;
}

.account-check {
  color: #ffa500;
  font-size: 1.2rem;
  font-weight: bold;
  margin-left: 0.5rem;
}

.badge-status {
  background: #f0f0f0;
  color: #666;
}

.badge-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-pending {
  background: #fff3e0;
  color: #ef6c00;
}

.badge-closed {
  background: #fde4e4;
  color: #c62828;
}

.badge-access {
  background: #e3f2fd;
  color: #1565c0;
}

.badge-full {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-readonly {
  background: #fff8e1;
  color: #f9a825;
}

.badge-no-access {
  background: #fde4e4;
  color: #c62828;
}

.badge-unknown {
  background: #f5f5f5;
  color: #9e9e9e;
}

 /* серые
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  background: #f5f5f5;
  color: #666;
}

.badge-active {
  background: #e8eef2;
  color: #2c3e50;
}

.badge-closed {
  background: #f5f5f5;
  color: #95a5a6;
}

.badge-readonly {
  background: #eef2f5;
  color: #7f8c8d;
}

.badge-full {
  background: #e8f0e8;
  color: #27ae60;
}*/

.export-bar {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.export-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #a5d6a7 0%, #81c784 100%);
  color: #2e5c2e;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(76, 175, 80, 0.1);
  min-width: 180px;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  color: #1b5e1b;
  border-color: rgba(76, 175, 80, 0.5);
}

.export-btn:active:not(:disabled) {
  transform: translateY(0px);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.export-btn:hover:not(:disabled)::before {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .export-bar {
    justify-content: center;
    margin-top: 1rem;
    padding-top: 0.75rem;
  }

  .export-btn {
    width: 100%;
    max-width: 300px;
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }
}

.export-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.export-btn:hover:not(:disabled) .export-icon {
  transform: translateY(-2px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.export-icon.spinning {
  animation: spin 1s linear infinite;
}
</style>
