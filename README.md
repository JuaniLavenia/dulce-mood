# DulceMood

Catálogo online de DulceMood, pastelería casera en San Miguel de Tucumán. Los productos se cargan en una planilla de Google y se publican con un botón desde la misma planilla.

## Stack

- Astro 5 + Tailwind CSS 3 (sitio estático)
- Google Sheets + Apps Script como fuente de datos y botón de publicar
- Netlify como hosting (`netlify.toml`)
- Vitest para los tests

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm test
npm run build    # genera dist/
```

Sin la variable `SHEET_URL`, el sitio usa los datos de ejemplo de `src/data/catalog.csv` (los precios son inventados).

El número de WhatsApp y los datos del negocio están en `src/config/business.ts`. **Antes de publicar, reemplazá el número de ejemplo.**

## Cómo se cargan los productos

Cada fila de la hoja `Productos` es **una variante**. Las filas con el mismo `producto` y `categoria` se muestran en una sola tarjeta, con botones para elegir la variante.

| Columna | Uso |
| --- | --- |
| `producto` | Nombre. Obligatorio. |
| `categoria` | Cookies, Cuadraditos, Budines, Magdalenas, Trufas, Packs, Tartas... Los filtros aparecen en el orden de la planilla. |
| `variante` | Tamaño o presentación: `10 g`, `25 g`, `x9`. Vacío si hay una sola. |
| `precio` | `1.500` o `1500`. Vacío muestra "A consultar". |
| `disponibilidad` | `Disponible` (o vacío), `Por encargo` o `Agotado`. Las variantes agotadas no se pueden pedir. |
| `imagen` | URL de la foto en Cloudinary (*Media Library → Copy URL*). Opcional. El sitio la achica y la optimiza solo. Los links de Google Drive no sirven. |
| `descripcion` | Texto corto. Se toma de la primera fila del producto que lo tenga. |

Ejemplo:

| producto | categoria | variante | precio | disponibilidad |
| --- | --- | --- | --- | --- |
| Cookie de chocolate | Cookies | 10 g | 700 | Disponible |
| Cookie de chocolate | Cookies | 25 g | 1.500 | Disponible |
| Caja de trufas | Packs | x9 | 5.000 | Por encargo |

## Planilla y botón de publicar (configuración única)

1. **Planilla**: creá una planilla de Google, abrí *Extensiones → Apps Script* y pegá el contenido de `apps-script/Code.js`.
2. En el editor de Apps Script, ejecutá `setupSheet` una vez (pide permisos). Crea la hoja `Productos` con los encabezados y el desplegable de disponibilidad. Para arrancar, podés importar `src/data/catalog.csv`.
3. **URL de datos**: *Implementar → Nueva implementación → Aplicación web*, con "Ejecutar como: yo" y "Quién tiene acceso: cualquier persona". Copiá la URL que termina en `/exec`: esa es `SHEET_URL`.
   - Si cambiás `Code.js`, actualizá la implementación existente (*Administrar implementaciones → Editar → Nueva versión*) para conservar la misma URL.
4. **Netlify**: *Add new site → Import an existing project* y elegí este repo. El build ya está configurado en `netlify.toml` (`npm run build`, carpeta `dist`, Node 22). En *Site configuration → Environment variables* agregá `SHEET_URL` y volvé a deployar.
5. **Build hook**: en *Site configuration → Build & deploy → Build hooks* creá uno para la rama `main` y copiá su URL.
6. En Apps Script, en *Configuración del proyecto → Propiedades de la secuencia de comandos*, agregá `DEPLOY_HOOK_URL` con la URL del hook.
7. Compartí la planilla con la dueña como **editora**. Al abrirla va a ver el menú **DulceMood → Publicar cambios**.

### Cómo funciona

```text
Edita la planilla → DulceMood › Publicar cambios → deploy hook → build lee SHEET_URL → sitio actualizado (~2 min)
```

Si la planilla no responde o queda sin productos, **el build falla a propósito**: el hosting sigue mostrando la versión anterior en lugar de publicar un catálogo vacío o los datos de ejemplo.
