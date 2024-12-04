<template>
  <div class="history-container">
    <h2>Historial de Transacciones</h2>
     <div v-if="transactions.length > 0">
      <ul>
        <li v-for="(transaction, index) in transactions" :key="index">
          {{ transaction }}
        </li>
      </ul>
    </div>
    
    <div v-else>
      <p>No hay transacciones registradas.</p>
    </div>

    <!-- Botón para regresar a la billetera -->
    <button @click="goBack">Regresar a la Billetera</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'; // Importa la función 'ref' para variables reactivas
import { useRouter } from 'vue-router'; // Importa 'useRouter' para manejar navegación

// Obtiene la instancia del enrutador para la navegación
const router = useRouter();
// Define una variable reactiva para almacenar las transacciones del usuario actual
const transactions = ref([]);
// Obtiene el usuario actual desde el localStorage o asigna 'Guest' como predeterminado
const currentUser = ref(localStorage.getItem('currentUser') || 'Guest');

// Función para cargar las transacciones del usuario actual
function loadTransactions() {
  // Si no hay usuario actual o el usuario es 'Guest', no realiza ninguna acción
  if (!currentUser.value || currentUser.value === 'Guest') return;

  // Obtiene las transacciones del usuario desde el localStorage
  const userTransactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.value}`)) || [];
  // Asigna las transacciones recuperadas a la variable reactiva
  transactions.value = userTransactions;
}

// Llama a la función para cargar las transacciones al cargar el componente
loadTransactions();
</script>

<style scoped>

</style>


