🎯 Objetivo
Asegurar que cada funcionalidad nueva mantenga la integridad del sistema mediante pruebas automatizadas antes de realizar cualquier commit.

🛡 Protocolo de Pruebas
Tests Unitarios (Vitest): Obligatorios para probar funciones lógicas aisladas, especialmente en los esquemas de datos y lógica de filtrado.

Tests E2E (Playwright): Obligatorios para flujos de usuario completos, como el proceso de registro o la creación de una nueva etiqueta de ocio.

Integración Jazz: Verificar siempre que los datos se sincronizan correctamente entre el estado local (IndexedDB) y los esquemas definidos.

🚦 Regla de Commit
Si un solo test falla, la IA tiene terminantemente prohibido realizar el commit. Debe corregir el error y re-ejecutar la suite de pruebas.