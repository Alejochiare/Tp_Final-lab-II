<template>
  <div class="analysis-container">
    <h2>Análisis de Transacciones</h2>
    <div v-if="prices">
      <p>Valor actual de Bitcoin: {{ prices.bitcoin }} USD</p>
      <p>Valor actual de Ethereum: {{ prices.ethereum }} USD</p>
      <p>Valor actual de Litecoin: {{ prices.litecoin }} USD</p>
      <p>Valor actual de Dogecoin: {{ prices.dogecoin }} USD</p>
    </div>
    <div v-if="transactions.length">
      <ul>
        <li v-for="(transaction, index) in transactions" :key="index">
          {{ transaction }}
        </li>
      </ul>
      <p>Total invertido en criptomonedas (dólares actuales): {{ totalInUSD }} USD</p>
      <p v-if="totalFromSales > 0">
        Total obtenido por ventas (dólares actuales): {{ totalFromSales }} USD
      </p>
    </div>
    <!-- Mensaje si no hay transacciones -->
    <div v-else>
      <p>No hay compras registradas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// Variables reactivas
const transactions = ref([]);
const prices = ref({
  bitcoin: null,
  ethereum: null,
  litecoin: null,
  dogecoin: null,
});
const loadingPrices = ref(true);
const errorLoadingPrices = ref(false);

// Función para obtener precios de criptomonedas
async function fetchPrices() {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,dogecoin&vs_currencies=usd'
    );
    prices.value = {
      bitcoin: response.data.bitcoin.usd,
      ethereum: response.data.ethereum.usd,
      litecoin: response.data.litecoin.usd,
      dogecoin: response.data.dogecoin.usd,
    };
    errorLoadingPrices.value = false; // Reinicia el error si la carga tuvo éxito
  } catch (error) {
    console.error('Error fetching prices:', error);
    errorLoadingPrices.value = true;
  } finally {
    loadingPrices.value = false;
  }
}

// Función para cargar transacciones del usuario actual
function loadTransactions() {
  const currentUser = localStorage.getItem('currentUser') || 'Guest';
  if (currentUser !== 'Guest') {
    transactions.value = JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];
  }
}

// Propiedad computada para calcular el total en dólares actuales (solo compras)
const totalInUSD = computed(() => {
  let total = 0;
  transactions.value.forEach((transaction) => {
    const { amount, coin, action } = extractTransactionData(transaction);
    if (action === 'Compraste' && amount && prices.value[coin]) {
      total += amount * prices.value[coin]; // Solo sumar si la acción es 'Compraste'
    }
  });
  return total.toFixed(2); // Retorna un total con dos decimales
});

// Cálculo del total obtenido por ventas
const totalFromSales = computed(() => {
  let total = 0;
  transactions.value.forEach((transaction) => {
    const { amount, coin, action } = extractTransactionData(transaction);
    if (action === 'Vendiste' && amount && prices.value[coin]) {
      total += amount * prices.value[coin]; // Sumar solo si es 'Vendiste'
    }
  });
  return total.toFixed(2);
});

// Función para extraer datos relevantes de cada transacción
function extractTransactionData(transaction) {
  const regex = /(Compraste|Vendiste) (\d+(\.\d+)?) de (\w+) por (\d+(\.\d+)?)/;
  const match = transaction.match(regex);
  if (match) {
    return {
      action: match[1], // 'Compraste' o 'Vendiste'
      amount: parseFloat(match[2]),
      coin: match[4].toLowerCase(),
      price: parseFloat(match[5]),
    };
  }
  return {};
}

// Carga de datos al montar el componente
onMounted(() => {
  fetchPrices();
  loadTransactions();
  setInterval(fetchPrices, 60000); // Actualiza los precios cada minuto
});
</script>

<style scoped>
.analysis-container {
  padding: 20px;
  color: #ff6700;
  background-color: #1a1a1a;
  border-radius: 8px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #333;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
  color: #ff6700;
}

p {
  margin: 10px 0;
}
</style>
