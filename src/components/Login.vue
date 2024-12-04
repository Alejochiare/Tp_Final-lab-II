<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <!-- Inputs para el nombre de usuario y contraseña -->
    <input v-model="username" type="text" placeholder="Nombre de usuario" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    
    <!-- Botón para generar un ID único -->
    <button @click="generateUniqueId">Generar ID único</button>

    <!-- Sección que se muestra cuando se genera un ID único -->
    <div v-if="uniqueId">
      <p>ID único generado: {{ uniqueId }}</p>
      <input v-model="inputUniqueId" type="text" placeholder="Ingrese el ID único" />
      <button @click="validateUniqueId">Validar ID y Continuar</button>
    </div>

    <!-- Sección para validar un ID existente -->
    <div>
      <h3>Ya tienes un ID?</h3>
      <input v-model="existingId" type="text" placeholder="Ingrese el ID único" />
      <button @click="validateExistingId">Ingresar con ID</button>
    </div>

    <!-- Mensaje dinámico para mostrar errores o confirmaciones -->
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'; // Importa la función ref para manejar variables reactivas
import { useRouter } from 'vue-router'; // Importa el router para navegar entre páginas

const router = useRouter(); // Instancia del router
const username = ref(''); // Variable para el nombre de usuario
const password = ref(''); // Variable para la contraseña
const message = ref(''); // Variable para mensajes dinámicos
const uniqueId = ref(''); // Almacena el ID generado
const inputUniqueId = ref(''); // Almacena el ID ingresado por el usuario
const existingId = ref(''); // Almacena el ID existente ingresado

// Función para generar un ID único
function generateUniqueId() {
  if (username.value && password.value) {
    // Genera un ID aleatorio
    uniqueId.value = Math.random().toString(36).substr(2, 9); // mezcla de números y letras
    localStorage.setItem('currentUser', uniqueId.value); // Guarda el ID en localStorage
  }
}

// Valida el ID único ingresado
function validateUniqueId() {
  const storedId = localStorage.getItem('currentUser'); // Obtiene el ID del localStorage
  if (inputUniqueId.value === storedId || inputUniqueId.value === uniqueId.value) {
    saveUserDataToAPI(inputUniqueId.value); // Guarda datos en la API
    router.push('/wallet'); // Navega a la página de la billetera 
  } else {
    message.value = 'El ID único ingresado no es válido. Por favor, inténtalo de nuevo.';
  }
}

// Valida un ID existente
function validateExistingId() {
  const storedId = localStorage.getItem('currentUser');
  if (existingId.value === storedId) {
    router.push('/wallet'); // Navega a la página del monedero
  } else {
    message.value = 'El ID único ingresado no es válido. Por favor, inténtalo de nuevo.';
  }
}

async function saveUserDataToAPI(id) {
  // Crear un objeto con los datos del usuario a enviar a la API
  const userData = {
    username: username.value,  // Nombre de usuario, se asume que es una variable reactiva en Vue
    uniqueId: id, // ID único que se pasa como argumento a la función
  };

  try {
    // Realizar una solicitud HTTP POST para guardar los datos del usuario
    const response = await fetch('https://api.example.com/saveUserData', {
      method: 'POST',  // Método de la solicitud (POST para enviar datos)
      headers: {
        'Content-Type': 'application/json',  // Especifica que el contenido enviado es JSON
      },
      body: JSON.stringify(userData),  // Convierte el objeto userData en una cadena JSON para enviarlo
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error('Error al guardar los datos en la API.');  // Si la respuesta no es exitosa, lanzar un error
    }

    // Si la solicitud fue exitosa, mostrar un mensaje de éxito
    message.value = 'Datos guardados correctamente.';
  } catch (error) {
    // Si ocurre un error durante la solicitud o en el proceso, capturarlo aquí
    console.error(error);  // Mostrar el error en la consola para depuración
    message.value = 'Hubo un error al guardar los datos. Por favor, intenta nuevamente.';  // Mostrar mensaje de error al usuario
  }
}

</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--background-color);
}

.login-container h2 {
  color: var(--text-color);
  margin-bottom: 20px;
}

.login-container input {
  width: 100%;
  max-width: 400px;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--card-background);
  color: var(--text-color);
}

.login-container button {
  width: 100%;
  max-width: 400px;
  padding: 12px;
  background: var(--secondary-color);
  color: var(--text-color);
  font-size: 16px;
  border-radius: 5px;
  transition: background 0.3s;
}

.login-container button:hover {
  background: var(--hover-color);
}

.message {
  color: #ff6666; 
  margin-top: 15px;
}
</style>
