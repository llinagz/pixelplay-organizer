🎯 Contexto de Jazz
Jazz es el motor de persistencia y sincronización en la arquitectura local-first. A diferencia de los modelos tradicionales con APIs REST o GraphQL, Jazz elimina la necesidad de gestionar manualmente la comunicación entre cliente y servidor.

🧠 Principios de Funcionamiento

Persistencia Local Primaria: Los datos residen primero en el navegador del usuario mediante IndexedDB. Esto garantiza latencia cero y funcionamiento offline total.

Sincronización Mágica: Jazz mueve los datos entre dispositivos y la nube de forma automática y transparente, sin intervención manual del desarrollador.

Arquitectura Sin Servidores: No se requieren servidores pesados ni bases de datos SQL externas para el despliegue inicial. La lógica de datos ocurre íntegramente en el cliente.

Definición por Código: La "base de datos" no se configura externamente; simplemente se definen esquemas en TypeScript y Jazz hace que existan.

🛠 Patrones de Implementación
Al trabajar con Jazz, el agente debe seguir estos patrones:

Modelado de Datos: Utilizar clases que extiendan de los tipos de Jazz para definir la estructura de la aplicación directamente en TypeScript.

Sincronización: Confiar en que Jazz gestiona el flujo de datos entre la nube y el cliente.

Despliegue: Aprovechar que Jazz solo requiere servir archivos estáticos, ideal para el tier gratuito de Vercel.