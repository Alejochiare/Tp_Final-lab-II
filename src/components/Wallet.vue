<template>
  <div v-if="prices" class="wallet-container">
    <h2>Billetera Virtual</h2>
    <p class="balance">Dinero disponible: {{ balance.toFixed(2) }} USD</p>

    <div class="crypto-grid">
      <div v-for="(price, coin) in prices" :key="coin" class="crypto-card">
        <h3>{{ coin }}</h3>
        <p class="crypto-quantity">Posees: {{ holdings[coin].toFixed(4) }} {{ coin }}</p>
        <p>Precio actual: {{ price.usd }} USD</p>

        <div class="purchase-container">
          <input
            type="number"
            v-model.number="quantities[coin]"
            min="0"
          />
          <button @click="buyCrypto(coin)">Comprar</button>
        </div>

        <div class="sell-container" v-if="holdings[coin] > 0">
          <input
            type="number"
            v-model.number="sellQuantities[coin]"
            min="0"
            :max="holdings[coin]"
          />
          <button @click="sellCrypto(coin)">Vender</button>
        </div>
      </div>
    </div>

    <div v-if="message" class="message">{{ message }}</div>

    <button @click="toggleHistory" class="history-button">
      {{ showHistory ? 'Ocultar' : 'Ver' }} Historial de Transacciones
    </button>

    <div v-if="showHistory" class="transaction-history">
      <h2>Historial de Transacciones</h2>
      <ul>
        <li v-for="(transaction, index) in transactions" :key="index">
          {{ transaction }}
        </li>
      </ul>
    </div>

    <button @click="navigateToAnalysis" class="analysis-button">
      Ir a Análisis
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';  
import { useRouter } from 'vue-router';  // Importa la función 'useRouter' para manejar la navegación entre rutas en la aplicación.
import axios from 'axios';  // Importa 'axios' para realizar solicitudes HTTP a APIs externas.

const router = useRouter();  // Crea una instancia del enrutador para manejar la navegación entre páginas.
const prices = ref(null);  // Declara una variable reactiva 'prices' para almacenar los precios de las criptomonedas.
const balance = ref(100000);  // Declara una variable reactiva 'balance' para almacenar el saldo del usuario, inicializado a 100,000 USD.
const quantities = reactive({  // Declara un objeto reactivo 'quantities' que contiene la cantidad de criptomonedas que el usuario desea comprar.
  bitcoin: 0,
  ethereum: 0,
  litecoin: 0,
  dogecoin: 0,
});
const sellQuantities = reactive({  // cantidad de criptomonedas que el usuario desea vender.
  bitcoin: 0,
  ethereum: 0,
  litecoin: 0,
  dogecoin: 0,
});
const holdings = reactive({  // cantidad de criptomonedas que el usuario posee.
  bitcoin: 0,
  ethereum: 0,
  litecoin: 0,
  dogecoin: 0,
});
const transactions = ref([]);  // almacenar las transacciones del usuario.
const message = ref('');  // mostrar mensajes de error o éxito al usuario.
const currentUser = ref(localStorage.getItem('currentUser') || 'Guest');  //obtiene el usuario actual desde 'localStorage' o usa 'Guest' como valor predeterminado.
const showHistory = ref(false);  // controlar si se muestra el historial de transacciones.

function toggleHistory() {  // Función para alternar la visibilidad del historial de transacciones.
  showHistory.value = !showHistory.value;  // Cambia el valor de 'showHistory' entre true y false.
}

function loadTransactions() {  // Función para cargar las transacciones del usuario desde 'localStorage'.
  if (!currentUser.value || currentUser.value === 'Guest') return;  // Si el usuario es 'Guest', no se cargan las transacciones.

  const userTransactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.value}`)) || [];  

  balance.value = 100000;  // Resetea el saldo del usuario a 100,000 USD al cargar las transacciones.
  holdings.bitcoin = 0;  // Resetea la cantidad de Bitcoin a 0.
  holdings.ethereum = 0;  
  holdings.litecoin = 0;  
  holdings.dogecoin = 0;  

  // actualiza el saldo y las cantidades de las criptomonedas.
  userTransactions.forEach(transaction => {
    const [action, amount, coin, , value] = transaction.split(' ');  // Separa cada transacción en sus partes: acción, cantidad, moneda, etc.

    if (action === 'Compraste') {  // Si la acción fue una compra:
      balance.value -= parseFloat(value);  // Resta el valor de la compra del saldo.
      holdings[coin.toLowerCase()] += parseFloat(amount);  // Añade la cantidad comprada a las tenencias del usuario.
    } else if (action === 'Vendiste') {  // Si la acción fue una venta:
      balance.value += parseFloat(value);  // Suma el valor de la venta al saldo.
      holdings[coin.toLowerCase()] -= parseFloat(amount);  // Resta la cantidad vendida de las tenencias del usuario.
    }
  });
  transactions.value = userTransactions;  // Almacena las transacciones cargadas en la variable 'transactions'.
}

function saveTransactions() {  // Función para guardar las transacciones del usuario en 'localStorage'.
  if (currentUser.value && currentUser.value !== 'Guest') {  // Si el usuario no es 'Guest':
    localStorage.setItem(`transactions_${currentUser.value}`, JSON.stringify(transactions.value));  // Guarda las transacciones del usuario en 'localStorage'.
  }
}

async function fetchPrices() {  // Función obtener los precios de las criptomonedas desde una API externa.
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,dogecoin&vs_currencies=usd');  // Realiza una solicitud HTTP GET a la API de CoinGecko.
    prices.value = response.data;  // Almacena los precios obtenidos en la variable 'prices'.
  } catch (error) {
    console.error('Error fetching prices:', error);  // Si ocurre un error en la solicitud, lo imprime en la consola.
  }
}

function buyCrypto(coin) {  // Función para comprar una criptomoneda.
  const price = prices.value[coin].usd;  // Obtiene el precio de la criptomoneda seleccionada.
  const quantity = quantities[coin];  // Obtiene la cantidad que el usuario desea comprar.
  const cost = price * quantity;  // Calcula el costo total de la compra.

  if (cost > balance.value) {  // Si el usuario no tiene suficiente saldo:
    message.value = `No tienes suficiente usd para comprar ${quantity} de ${coin}.`;  // Muestra un mensaje de error.
    return;
  }

  const now = new Date();  // Obtiene la fecha y hora actuales.
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;  // Formatea la fecha y hora en un formato legible.

  balance.value -= cost;  // Resta el costo de la compra del saldo.
  holdings[coin] += quantity;  // Añade la cantidad comprada a las tenencias de la criptomoneda.
  transactions.value.push(`Compraste ${quantity} de ${coin} por ${cost.toFixed(2)} USD el ${timestamp}.`);  // Agrega la transacción al historial.
  saveTransactions();  // Guarda las transacciones en 'localStorage'.
  message.value = `Has comprado ${quantity} de ${coin} por ${cost.toFixed(2)} USD.`;  // Muestra un mensaje de éxito.
  quantities[coin] = 0;  // Resetea la cantidad a comprar para esa criptomoneda.
}

function sellCrypto(coin) {  // Función para vender una criptomoneda.
  const price = prices.value[coin].usd;  // Obtiene el precio de la criptomoneda seleccionada.
  const quantity = sellQuantities[coin];  // Obtiene la cantidad que el usuario desea vender.

  if (quantity > holdings[coin]) {  // Si el usuario no tiene suficientes criptomonedas para vender:
    message.value = `No tienes suficientes ${coin} para vender.`;  // Muestra un mensaje de error.
    return;
  }

  const revenue = price * quantity;  // Calcula los ingresos por la venta.
  const now = new Date();  // Obtiene la fecha y hora actuales.
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;  // Formatea la fecha y hora en un formato legible.

  balance.value += revenue;  // Añade los ingresos por la venta al saldo del usuario.
  holdings[coin] -= quantity;  // Resta la cantidad vendida de las tenencias del usuario.
  transactions.value.push(`Vendiste ${quantity} de ${coin} por ${revenue.toFixed(2)} USD el ${timestamp}.`);  // Agrega la transacción al historial.
  saveTransactions();  // Guarda las transacciones en 'localStorage'.
  message.value = `Has vendido ${quantity} de ${coin} por ${revenue.toFixed(2)} USD.`;  // Muestra un mensaje de éxito.
  sellQuantities[coin] = 0;  // Resetea la cantidad a vender para esa criptomoneda.
}

function navigateToAnalysis() {  // Función para navegar a la página de análisis.
  router.push('/analysis');  // Navega a la ruta '/analysis' usando el enrutador de Vue.
}

onMounted(() => {  // Función que se ejecuta cuando el componente es montado.
  fetchPrices();  // Llama a la función para obtener los precios de las criptomonedas.
  loadTransactions();  // Llama a la función para cargar las transacciones del usuario.
});
</script>


<style scoped>
.wallet-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.balance {
  font-size: 1.2em;
}

.crypto-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.crypto-card {
  background-color: #000000;
  color: #ffffff;
  padding: 15px;
  border-radius: 10px;
  width: 200px;
  text-align: center;
}

.purchase-container,
.sell-container {
  margin-top: 10px;
}

.purchase-container input,
.sell-container input {
  width: 80px;
  margin-right: 10px;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.history-button,
.analysis-button {
  margin-top: 20px;
}

.transaction-history {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
