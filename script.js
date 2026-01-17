// script.js
// Archivo base para el laboratorio.
// NO deben modificar el HTML ni el CSS, solo trabajar aquí.

// API pública: JSONPlaceholder
// Documentación: https://jsonplaceholder.typicode.com/ (solo lectura)
// Ejemplo de endpoint que usaremos:
//  https://jsonplaceholder.typicode.com/posts?userId=1

// Paso 1: Referencias a elementos del DOM (ya tienes los IDs definidos en index.html).
const postForm = document.getElementById("postForm");
const userIdInput = document.getElementById("userIdInput");
const rememberUserCheckbox = document.getElementById("rememberUser");
const statusArea = document.getElementById("statusArea");
const postsList = document.getElementById("postsList");
const clearResultsBtn = document.getElementById("clearResultsBtn");

// Claves para localStorage
const LAST_USER_ID_KEY = "lab_fetch_last_user_id";
const POSTS_DATA_KEY = "lab_fetch_posts_data";


// TODO 4: Crear una función que reciba un arreglo de publicaciones y:
// - Limpie cualquier resultado previo en postsList.
// - Para cada post, cree un <li> con clase "post-item".
// - Dentro agregue un título (h3 o p con clase "post-title") y el cuerpo (p con clase "post-body").
// - Inserte los elementos en el DOM.
// - IMPORTANTE: Después de mostrar los posts, guardarlos en localStorage usando la clave POSTS_DATA_KEY.
//  Recuerda que localStorage solo guarda strings, así que usa JSON.stringify() para convertir el arreglo.
function renderPosts(posts) {
    // 1. Limpiar cualquier resultado previo
    postsList.innerHTML = '';

    if (posts && posts.length > 0) {
        // 2. Crear y anexar los elementos al DOM
        posts.forEach(post => {
            const listItem = document.createElement('li');
            listItem.className = 'post-item';

            const title = document.createElement('p');
            title.className = 'post-title';
            title.textContent = post.title;

            const body = document.createElement('p');
            body.className = 'post-body';
            body.textContent = post.body;

            listItem.appendChild(title);
            listItem.appendChild(body);
            postsList.appendChild(listItem);
        });

        // 3. Guardar en localStorage
        try {
            const postsJSON = JSON.stringify(posts);
            localStorage.setItem(POSTS_DATA_KEY, postsJSON);
        } catch (error) {
            console.error("Error al guardar posts en localStorage:", error);
        }
    } else {
       
        localStorage.removeItem(POSTS_DATA_KEY);
    }
}


// TODO 3: Implementar una función async que reciba el userId y:
// - Arme la URL: https://jsonplaceholder.typicode.com/posts?userId=VALOR
// - Use fetch para hacer la petición GET.
// - Valide que la respuesta sea ok (response.ok).
// - Convierta la respuesta a JSON.
// - Actualice el área de estado a "Éxito" o similar.
// - Muestre los resultados en la lista usando otra función (ver TODO 4).
// - Maneje errores (try/catch) y muestre mensaje de error en statusArea.
async function fetchPostsByUser(userId) {
    let statusMessageElement = statusArea.querySelector(".status-message");

    if (!statusMessageElement) {
        statusArea.innerHTML = '<p class="status-message"></p>';
        statusMessageElement = statusArea.querySelector(".status-message");
    }
    
    const URL = `https://jsonplaceholder.typicode.com/posts?userId=${userId}`;

    try {
        const response = await fetch(URL);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} al cargar las publicaciones.`);
        }

        const posts = await response.json();

        // Lógica de validación de posts vacíos
        if (posts.length === 0) {
            statusMessageElement.textContent = `Éxito: No se encontraron publicaciones para el Usuario ID ${userId}.`;
            statusMessageElement.className = "status-message status-message--warning";
            if (typeof renderPosts === 'function') {
                renderPosts([]); 
            }
            // TODO 5: Si el checkbox "rememberUser" está marcado cuando se hace una consulta
            // exitosa, guardar el userId en localStorage. Si no, limpiar ese valor.
            if (rememberUserCheckbox.checked) {
                localStorage.setItem(LAST_USER_ID_KEY, userId);
            } else {
                localStorage.removeItem(LAST_USER_ID_KEY);
            }
            return;
        }

        // 1. Actualizar el área de estado a "Éxito"
        statusMessageElement.textContent = `Éxito: Se cargaron ${posts.length} publicaciones para el Usuario ID: ${userId}.`;
        statusMessageElement.className = "status-message status-message--success";

        if (typeof renderPosts === 'function') {
            renderPosts(posts);
        }

        // TODO 5: Manejo del checkbox "rememberUser"
        if (rememberUserCheckbox.checked) {
            localStorage.setItem(LAST_USER_ID_KEY, userId);
        } else {
            localStorage.removeItem(LAST_USER_ID_KEY);
        }

    } catch (error) {
        // 3. Manejar errores (try/catch) y muestre mensaje de error en statusArea.
        console.error("Error en la petición fetch:", error);
        
        if (typeof renderPosts === 'function') {
            renderPosts([]); // Limpiar la lista en caso de error
        }

        statusMessageElement.textContent = `Error al cargar publicaciones: ${error.message}`;
        statusMessageElement.className = "status-message status-message--error";
    }
}


// TODO 1:
window.addEventListener("DOMContentLoaded", function () {
 // Al cargar la página:
 //parte 1.a:
 // - Leer de localStorage el último userId usado (si existe) y colocarlo en el input.
 //    Si hay valor, marcar el checkbox "rememberUser".
 const lastUserId = localStorage.getItem(LAST_USER_ID_KEY); 

 // este if es para si existe un valor colocarlo en el input de ID de usuario
 //y marcar el checkbox recordar este ID de usuario
 if (lastUserId) { // Si existe un valor.
  userIdInput.value = lastUserId; 
  rememberUserCheckbox.checked = true;
 }

 //parte 1.b
 // - Leer de localStorage los posts guardados (si existen) y mostrarlos en la lista.
 //    Si hay posts guardados, actualizar el área de estado indicando que se cargaron desde localStorage.

 const storedPostsJSON = localStorage.getItem(POSTS_DATA_KEY); // variable para leer el valor guardado

 // Si localStorage.getItem(POSTS_DATA_KEY) devuelve una cadena (lo que indica que hay publicaciones guardadas),
 //   se ejecuta el bloque try donde se cargan las publicaciones guardadas.
 // si localStorage.getItem(POSTS_DATA_KEY) no devuelve nada entonces no pasa nada para esto es el else
 if (storedPostsJSON) { 
  try {
       // 1. Convertir de JSON string a arreglo usando JSON.parse()
       const storedPosts = JSON.parse(storedPostsJSON);
        if (storedPosts && storedPosts.length > 0) {
           // 2. Mostrar las publicaciones en la lista usando la función renderPosts(). 
           if (typeof renderPosts === 'function') {
           renderPosts(storedPosts); 
           }
           // 3. Actualizar el área de estado indicando que se cargaron desde localStorage.
           statusArea.innerHTML = `
            <p class="status-message status-message--success">
             Publicaciones cargadas automáticamente desde LocalStorage.
            </p>
           `;
       } else {
           localStorage.removeItem(POSTS_DATA_KEY);
       }

  } catch (error) {
       console.error("Error al parsear posts de localStorage:", error);
       // Si hay error al parsear (try/catch), eliminar el dato corrupto del localStorage.
       localStorage.removeItem(POSTS_DATA_KEY);
       statusArea.innerHTML = `
           <p class="status-message status-message--error">
           Error de datos guardados. Se limpiaron los posts corruptos de LocalStorage.
           </p>
       `;
  }
 }
});

// - Leer de localStorage los posts guardados (si existen) y mostrarlos en la lista.
//  Si hay posts guardados, actualizar el área de estado indicando que se cargaron desde localStorage.
// Pista: window.addEventListener("DOMContentLoaded", ...)


// TODO 2: Manejo del envío del formulario
// Manejar el evento "submit" del formulario.
// - Prevenir el comportamiento por defecto.
// - Leer el valor de userId.
// - Validar que esté entre 1 y 10 (o mostrar mensaje de error).
// - Actualizar el área de estado a "Cargando..." con una clase de loading.
// - Llamar a una función que haga la petición fetch a la API.

postForm.addEventListener("submit", function (event) {

 event.preventDefault(); // Prevenir el recargo de la página

 const userId = parseInt(userIdInput.value);

    let statusMessageElement = statusArea.querySelector(".status-message");

    if (!statusMessageElement) {
        statusArea.innerHTML = '<p class="status-message"></p>';
        statusMessageElement = statusArea.querySelector(".status-message");
    }

 // VALIDACIÓN: Chequear que sea un número entre 1 y 10
 if (isNaN(userId) || userId < 1 || userId > 10) {
  
  // Muestra mensaje de error y detiene la ejecución se el id ingresado por el usuario no esta entre 1 y 10
  statusMessageElement.textContent = `Error: El ID de usuario debe ser un número entero entre 1 y 10.`;
  statusMessageElement.className = "status-message status-message--error"; 
  return; 
 }

 // Si es válido: Actualiza el área de estado a "Cargando..."
 statusMessageElement.textContent = `Cargando publicaciones para el Usuario ID: ${userId}...`;
 statusMessageElement.className = "status-message status-message--loading"; 

 // Llamamos a la función del TODO 3
 fetchPostsByUser(userId); 
});

// TODO 6:
// Agregar un evento al botón "Limpiar resultados" que:
// - Vacíe la lista de publicaciones.
// - Restablezca el mensaje de estado a "Aún no se ha hecho ninguna petición."
// - Elimine los posts guardados en localStorage (usando la clave POSTS_DATA_KEY).
clearResultsBtn.addEventListener('click', function() {
    // 1. Vaciar la lista de publicaciones
    postsList.innerHTML = '';
    
    // 2. Eliminar los posts guardados en localStorage
    localStorage.removeItem(POSTS_DATA_KEY);

    // 3. Restablecer el mensaje de estado
    statusArea.innerHTML = `
        <p class="status-message">
            Aún no se ha hecho ninguna petición.
        </p>
    `;

   
});
