# Drive RAW & Multiformat Catalog 📸

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Drive API](https://img.shields.io/badge/Google_Drive-API_v3-4285F4?style=for-the-badge&logo=googledrive)](https://developers.google.com/drive)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![RAW & Multiformat](https://img.shields.io/badge/Multiformat-RAW_•_JPG_•_PNG-FFE600?style=for-the-badge&logo=nikon&logoColor=black&labelColor=1a1a1a)](https://www.nikon.com/)

> Aplicación web profesional de alto rendimiento diseñada para fotógrafos y creadores que gestionan archivos pesados en **Google Drive**. Permite explorar el árbol de directorios de Drive, seleccionar múltiples carpetas, catalogar y previsualizar todo tipo de archivos (RAW `.NEF`, `.CR2`, `.ARW`, `.DNG`, más `.JPG`, `.PNG`, `.WEBP`, videos y documentos) sin cortes de paginación, y descargarlos por lote o individualmente a Windows en archivos `.zip`.

---

## 🌟 Características Principales

### 1. Árbol de Carpetas y Selección Múltiple en Lote
* **Pantalla de Inicio Inteligente:** Al iniciar sesión se presenta el explorador de carpetas (`FolderExplorer`) con navegación por migas de pan (*breadcrumbs*).
* **Selección Múltiple de Carpetas:** Casillas de selección (*checkboxes*) independientes por carpeta y botón global de *"Seleccionar Todo"*.
* **Barra Flotante de Acciones en Lote:**
  * **📷 Catalogar Juntas:** Combina y cataloga los archivos de todas las carpetas seleccionadas en una **única galería unificada**.
  * **📦 Descargar Lote (ZIP):** Extrae automáticamente todos los archivos de las carpetas marcadas y los comprime en el navegador en un archivo `.zip` directo con barra de progreso en vivo (`Descargando 3/15...`).

### 2. Soporte Multiformato & Insignias Dinámicas
* **Compatibilidad Universal:**
  * **Negativos RAW:** Nikon (`.NEF`, `.NRW`), Canon (`.CR2`, `.CR3`), Sony (`.ARW`), Adobe (`.DNG`), Fujifilm (`.RAF`), Olympus (`.ORF`), Panasonic (`.RW2`).
  * **Imágenes Estándar:** `.JPG`, `.JPEG`, `.PNG`, `.WEBP`, `.HEIC`, `.TIFF`, `.AVIF`, `.GIF`.
  * **Videos & Documentos:** `.MP4`, `.MOV`, `.AVI`, `.PDF`, `.XMP` (sidecars de Lightroom).
* **Insignias por Extensión:** Distintivo de color para cada formato (Amarillo Nikon para `.NEF`, Esmeralda para `.JPG`, Azul para `.PNG`, Púrpura para otros RAWs, etc.).
* **Pestañas de Filtrado Rápido:** Alterna con un solo clic entre filtros `Todos`, `RAW`, `JPG / PNG` y `Otros` con conteo en tiempo real.

### 3. Paginación Exhaustiva (Sin límite de 100 archivos)
* **Bucle Paginado Dinámico:** Utiliza el token `nextPageToken` de la Google Drive API v3 para indexar sesiones completas (hasta 5.000 archivos por escaneo), eliminando la limitación histórica de 100 archivos por petición.

### 4. Autenticación Real Google OAuth 2.0 & Hardening OWASP
* **Acceso 100% Real en Vivo:** Sin datos mock ni de demostración. Conexión directa a la API de Google Drive de tu cuenta.
* **Permisos de Solo Lectura:** Utiliza el scope estricto `https://www.googleapis.com/auth/drive.readonly` para garantizar que tus archivos nunca sean alterados ni borrados.
* **Seguridad y Hardening:**
  * Sanitización de `folderId` contra inyecciones de consulta en Google Drive.
  * Sanitización de nombres de archivo en cabeceras HTTP contra CRLF / Header Injection en descargas.
  * Cabeceras de seguridad OWASP configuradas (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).

### 5. Interfaz Dark Room para Fotografía Profesional
* **Paleta Minimalista:** Fondos en grises y negros profundos (`#07080a`, `#0d0f14`) con acentos en amarillo y ámbar Nikon (`#FFE600`), diseñados para evitar la fatiga visual y mantener la fidelidad cromática.
* **Cuadrícula Adaptativa (CSS Grid):** Visualización responsiva de 1 a 6 columnas con carga perezosa (*lazy loading*), skeletons de carga y animación de enfoque de lente.
* **Inspector de Metadatos y Zoom EXIF:** Modal ampliado para inspeccionar detalles técnicos (ISO, Velocidad, Apertura, Cámara, Peso y Fecha de Modificación).

---

## 📁 Estructura del Proyecto

```text
driveline/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # Endpoint NextAuth con Google OAuth 2.0
│   │   │   ├── drive/files/route.ts        # Indexación paginada multiformato y multi-carpeta
│   │   │   ├── drive/folders/route.ts      # Explorador de carpetas y subdirectorios de Drive
│   │   │   └── drive/download/route.ts     # Stream sanitizado de descargas
│   │   ├── login/
│   │   │   └── page.tsx                    # Pantalla de Login con diagnóstico de OAuth
│   │   ├── globals.css                     # Estilos Dark Mode y scrollbar profesional
│   │   ├── layout.tsx                      # Layout raíz con SessionProvider y metadatos
│   │   └── page.tsx                        # Controlador de vistas (Árbol vs Galería)
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleSignInButton.tsx      # Botón de inicio de sesión Google Identity
│   │   ├── folders/
│   │   │   └── FolderExplorer.tsx          # Explorador de árbol, selección múltiple y ZIP en lote
│   │   ├── gallery/
│   │   │   ├── DriveFolderModal.tsx        # Selector modal de ID de carpeta manual
│   │   │   ├── PhotoCard.tsx               # Tarjeta con badge dinámico, lazy loading y EXIF
│   │   │   ├── PhotoDetailModal.tsx        # Inspector EXIF y visor ampliado de alta resolución
│   │   │   ├── PhotoGrid.tsx               # Cuadrícula adaptativa, ordenamiento y filtros por formato
│   │   │   └── SelectionActionBar.tsx      # Barra flotante de descarga individual y ZIP
│   │   ├── layout/
│   │   │   └── Navbar.tsx                  # Barra superior con buscador, estado y switcher
│   │   └── providers/
│   │       └── AuthProvider.tsx            # Envoltorio NextAuth SessionProvider
│   ├── lib/
│   │   ├── auth.ts                         # Configuración y callbacks de NextAuth
│   │   ├── drive.ts                        # Cliente Google Drive v3 con paginación exhaustiva
│   │   └── utils.ts                        # Formateador de bytes (MB/GB) y fechas
│   └── types/
│       ├── index.ts                        # Definiciones TypeScript de archivos, formatos y categorías
│       └── next-auth.d.ts                  # Extensión de tipos de sesión (accessToken)
├── .env.example                            # Plantilla de variables de entorno
├── next.config.mjs                         # Cabeceras de seguridad OWASP y dominios de imágenes
├── tailwind.config.ts                      # Paleta Dark (#07080a) y acentos Nikon Yellow (#FFE600)
├── tsconfig.json                           # Alias @/* y TypeScript estricto
└── package.json                            # Dependencias y scripts
```

---

## ⚙️ Configuración de Google Cloud Console (OAuth 2.0)

Para conectar tu cuenta de Google y explorar tus archivos de Drive en vivo:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (ej. `drive-raw-catalog`).
3. Ve a **APIs & Services > Library**, busca **Google Drive API** y haz clic en **Enable**.
4. Ve a **APIs & Services > OAuth consent screen**:
   - Escoge tipo de usuario: **External** (Externo).
   - Completa el nombre de la app y correo de soporte.
   - En **Scopes** (Permisos), añade `https://www.googleapis.com/auth/drive.readonly`.
   - En **Test users** (Usuarios de prueba), añade tu correo de Google con el que iniciarás sesión.
5. Ve a **APIs & Services > Credentials > Create Credentials > OAuth client ID**:
   - Tipo de aplicación: **Web application**.
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - Tu URL de producción en Vercel (ej. `https://driveline-mu.vercel.app`)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://driveline-mu.vercel.app/api/auth/callback/google`
6. Copia tu **Client ID** y **Client Secret**.

---

## 🚀 Despliegue en Vercel

1. Importa tu repositorio de GitHub en [Vercel](https://vercel.com/new).
2. Configura las siguientes **Environment Variables**:
   * `NEXTAUTH_SECRET`: Clave aleatoria segura (puedes generarla con `openssl rand -base64 32`).
   * `NEXTAUTH_URL`: La URL pública de tu app en Vercel (ej: `https://driveline-mu.vercel.app`).
   * `GOOGLE_CLIENT_ID`: El Client ID generado en Google Cloud.
   * `GOOGLE_CLIENT_SECRET`: El Client Secret generado en Google Cloud.
3. Haz clic en **Deploy**.

---

## 💻 Ejecución Local

1. Clona el repositorio e instala dependencias:
   ```bash
   git clone https://github.com/rapabru/drive-raw-catalog.git
   cd drive-raw-catalog
   npm install
   ```

2. Configura tus variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
   *(Pega tus credenciales de Google OAuth en `.env.local`)*

3. Inicia el entorno de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta `LICENSE` para más información.
