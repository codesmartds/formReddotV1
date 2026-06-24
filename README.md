# Form Share — Deploy en Railway

Landing estática de Claro preparada para desplegarse en Railway mediante un servidor HTTP de Node.js sin dependencias externas.

## Estructura

```text
.
├── public/
│   └── index.html
├── server.js
├── package.json
├── railway.toml
├── nixpacks.toml
├── Procfile
└── .env.example
```

## Ejecutar localmente

Requiere Node.js 20.

```bash
npm install
npm start
```

Abrir:

- Landing: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Subir a Railway

### Opción 1: desde GitHub

1. Crear un repositorio y subir el contenido de esta carpeta.
2. En Railway, seleccionar **New Project**.
3. Elegir **Deploy from GitHub repo**.
4. Seleccionar el repositorio.
5. Railway utilizará `railway.toml` y ejecutará `npm start`.
6. En **Settings > Networking**, generar un dominio público.

### Opción 2: Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Variables de entorno

No hay variables obligatorias. Railway proporciona `PORT` automáticamente.

## Formulario

El HTML conserva el webhook de Zapier que ya estaba configurado en el archivo original. Los envíos se realizan directamente desde el navegador.

## Consideraciones

- Las imágenes, Google Fonts, Google Tag Manager y Google Analytics se cargan desde servicios externos.
- Los enlaces `politica-privacidad.html` y `terminos-condiciones.html` existían en el HTML original, pero esos documentos no venían incluidos en el ZIP recibido. Deben agregarse dentro de `public/` si se desean habilitar.
- El endpoint `/health` está configurado como health check de Railway.
