<template>
  <div class="history-container">
    <h2>Historial de Transacciones</h2>
    <ul>
      <li v-for="(transaction, index) in transactions" :key="index">
        {{ transaction.action }} - {{ transaction.amount }} {{ transaction.coin }} por {{ transaction.value }}
      </li>
      <li v-if="transactions.length === 0 && !loading">No hay transacciones para mostrar.</li>
      <li v-if="loading">Cargando transacciones...</li>
    </ul>
    <!-- Botón para volver a la página de la billetera -->
    <button @click="goBack">Volver a la Billetera</button>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Importa utilidades de Vue
import { useRouter } from 'vue-router'; // Importa el enrutador para navegar entre páginas

// Instancia del enrutador para navegar
const router = useRouter();
// Variable reactiva para almacenar el ID único del usuario actual (desde localStorage)
const uniqueId = ref(localStorage.getItem('currentUser'));
// Variable reactiva para almacenar la lista de transacciones
const transactions = ref([]);
// Variable para indicar si las transacciones se están cargando
const loading = ref(true);
// Variable para almacenar un mensaje de error, si ocurre
const error = ref('');

// Función asíncrona para cargar las transacciones del usuario
async function loadTransactions() {
  // Verifica si el ID único está disponible; si no, muestra un error
  if (!uniqueId.value) {
    error.value = 'No se encontró el ID único del usuario.';
    loading.value = false;
    return;
  }

  try {
    // Hace una solicitud a la API con el ID único del usuario
    const response = await fetch(`https://api.example.com/getTransactions?uniqueId=${uniqueId.value}`);
    
    // Verifica si la respuesta de la API es válida
    if (!response.ok) {
      throw new Error('Error al obtener las transacciones.');
    }
    
    // Convierte la respuesta de la API a JSON
    const data = await response.json();
    // Asigna las transacciones obtenidas a la variable reactiva
    transactions.value = data;
    console.log('Transacciones recibidas:', data);
  } catch (err) {
    // Maneja errores durante la solicitud y los registra en la consola
    console.error(err);
    error.value = 'Hubo un error al obtener las transacciones.';
  } finally {
    // Finaliza el estado de carga independientemente del resultado
    loading.value = false;
  }
}

// Ejecuta la función de carga de transacciones al montar el componente
onMounted(loadTransactions);

// Función para volver a la página de la billetera
function goBack() {
  router.push('/wallet'); // Navega a la ruta de la billetera
}
</script>

<style scoped>
/* Estilos generales del contenedor */
.history-container {
  display: flex;
  flex-direction: column; /* Organiza los elementos en columna */
  align-items: center; /* Centra los elementos horizontalmente */
  padding: 20px;
  background: var(--background-color); /* Usa una variable de color para el fondo */
}

/* Estilo del título */
.history-container h2 {
  color: var(--text-color); /* Usa una variable de color para el texto */
  margin-bottom: 20px; /* Espaciado debajo del título */
}

/* Estilo de la lista */
.history-container ul {
  list-style-type: none; /* Elimina los puntos de las listas */
  padding: 0;
  margin: 0;
}

/* Estilo de cada elemento de la lista */
.history-container li {
  padding: 10px; /* Espaciado interno */
  border: 1px solid var(--border-color); /* Borde con un color variable */
  margin-bottom: 5px; /* Espaciado entre elementos */
  border-radius: 5px; /* Bordes redondeados */
  background: var(--card-background); /* Fondo con color variable */
  color: var(--text-color); /* Texto con color variable */
}

/* Estilo del botón */
.history-container button {
  margin-top: 20px; /* Espaciado superior */
  padding: 10px 20px; /* Espaciado interno */
  background: var(--secondary-color); /* Fondo con color variable */
  color: var(--text-color); /* Texto con color variable */
  font-size: 16px; /* Tamaño del texto */
  border-radius: 5px; /* Bordes redondeados */
}

/* Cambio de fondo al pasar el cursor sobre el botón */
.history-container button:hover {
  background: var(--hover-color); /* Color de fondo al pasar el cursor */
}

/* Estilo del mensaje de error */
.error-message {
  color: #ff6666; /* Texto en rojo claro */
  margin-top: 15px; /* Espaciado superior */
}
</style>
