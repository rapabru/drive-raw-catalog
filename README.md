# Drive RAW Catalog & Mapper 📸

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Drive API](https://img.shields.io/badge/Google_Drive-API_v3-4285F4?style=for-the-badge&logo=googledrive)](https://developers.google.com/drive)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Nikon RAW](https://img.shields.io/badge/Specialized-Nikon_.NEF-FFE600?style=for-the-badge&logo=nikon&logoColor=black&labelColor=1a1a1a)](https://www.nikon.com/)

> Aplicación web profesional de alto rendimiento diseñada específicamente para fotógrafos que manejan archivos RAW pesados de Nikon (`.NEF`) alojados en **Google Drive**. Permite catalogar, filtrar por metadatos, previsualizar tomas y realizar descargas masivas o selectivas directamente al disco local de Windows.

---

## 🌟 Características Principales

### 1. Autenticación Oficial Google OAuth 2.0
* **Botón Oficial de Google Identity:** Interfaz con diseño certificado de Google ("Sign in with Google") adaptada al entorno *Dark Room*.
* **Seguridad Estricta de Solo Lectura:** Utiliza el alcance `https://www.googleapis.com/auth/drive.readonly` para garantizar que tus archivos en la nube nunca sean modificados ni eliminados.
* **Persistencia y Sesión:** Autenticación robusta basada en tokens JWT con NextAuth.js.

### 2. Interfaz Dark Room para Fotografía Profesional
* **Paleta Minimalista:** Fondos en grises y negros profundos (`#07080a`, `#0d0f14`) con acentos en amarillo y ámbar Nikon (`#FFE600`), diseñados para evitar la fatiga visual y mantener la fidelidad cromática.
* **Cuadrícula Adaptativa (CSS Grid):** Visualización responsiva de 1 a 6 columnas con carga perezosa (*lazy loading*), skeletons de carga y animación de enfoque de lente perfectamente centrada.
* **Búsqueda Instantánea:** Filtrado en tiempo real por nombre de archivo (ej. `DSC_9410`), rutas de sesión o modelo de cámara.

### 3. Panel de Control y Toggle de Metadatos
* **Toggle de Detalles:** Conmutador rápido para mostrar u ocultar al instante los metadatos técnicos debajo de cada foto:
  * Peso del archivo en **Megabytes (MB)**.
  * Insignia del formato RAW **`.NEF`**.
  * Ruta completa de carpetas dentro de Google Drive.
  * Fecha y hora de modificación.
  * Ajustes de toma si están disponibles (ISO, Velocidad de obturación, Apertura).
* **Alcance Personalizable:** Posibilidad de escanear todo tu Google Drive o limitar el mapeo a un ID de carpeta específico.

### 4. Selección Masiva y Descarga a Disco Local
* **Checkboxes Independientes:** Selección rápida por foto o masiva mediante el botón de *"Seleccionar Todo"*.
* **Barra Flotante de Acción:** Notifica en tiempo real cuántas tomas están seleccionadas y el peso acumulado (en MB o GB).
* **Descarga Directa a Windows:** Botón principal de **"Enviar a Descarga Local"** con opciones de descarga secuencial al navegador o compresión instantánea en paquete comprimido `.zip`.

### 5. Modo Demostración Integrado
* Si abres la aplicación sin haber configurado las credenciales de Google Cloud, se activa automáticamente el **Modo Demo**, que carga un catálogo realista de tomas de cámaras Nikon Z8, D850 y Z9 con tamaños y metadatos reales para probar el flujo sin fricción.

---

## 📁 Estructura del Proyecto

```text
driveline/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # Endpoint NextAuth con Google OAuth
│   │   │   ├── drive/files/route.ts        # Indexación de archivos .NEF y thumbnails
│   │   │   └── drive/download/route.ts     # Stream de descarga de RAW original
│   │   ├── login/
│   │   │   └── page.tsx                    # Pantalla de Login con Google Button oficial
│   │   ├── globals.css                     # Estilos Dark Mode y barra de scroll profesional
│   │   ├── layout.tsx                      # Layout raíz con SessionProvider
│   │   └── page.tsx                        # Catálogo interactivo y estado reactivo
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleSignInButton.tsx      # Botón oficial de Google Identity con spinner
│   │   ├── gallery/
│   │   │   ├── DriveFolderModal.tsx        # Modal selector de alcance/carpeta de Drive
│   │   │   ├── PhotoCard.tsx               # Tarjeta con lazy load, badge .NEF y metadatos
│   │   │   ├── PhotoDetailModal.tsx        # Inspector EXIF y visor ampliado de alta resolución
│   │   │   ├── PhotoGrid.tsx               # Cuadrícula adaptativa CSS Grid y ordenamiento
│   │   │   └── SelectionActionBar.tsx      # Barra flotante ("Enviar a Descarga Local")
│   │   ├── layout/
│   │   │   └── Navbar.tsx                  # Barra superior con búsqueda y Toggle de Detalles
│   │   └── providers/
│   │       └── AuthProvider.tsx            # Envoltorio NextAuth SessionProvider
│   ├── lib/
│   │   ├── auth.ts                         # Configuración y callbacks de NextAuth
│   │   ├── drive.ts                        # Cliente Google Drive v3 y catálogo mock
│   │   └── utils.ts                        # Formateador de bytes (MB/GB) y fechas
│   └── types/
│       ├── index.ts                        # Definiciones TypeScript de archivos y metadatos
│       └── next-auth.d.ts                  # Extensión de tipos de sesión (accessToken)
├── .env.example                            # Plantilla de variables de entorno
├── next.config.mjs                         # Configuración de dominios de imágenes en Next.js
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
     - Tu URL de producción de Vercel (ej. `https://tu-proyecto.vercel.app`)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://tu-proyecto.vercel.app/api/auth/callback/google`
6. Copia tu **Client ID** y **Client Secret**.

---

## 🚀 Despliegue en Vercel

1. Importa tu repositorio de GitHub en [Vercel](https://vercel.com/new).
2. Configura las siguientes **Environment Variables**:
   * `NEXTAUTH_SECRET`: Clave aleatoria segura (puedes generarla con `openssl rand -base64 32`).
   * `NEXTAUTH_URL`: La URL pública de tu app en Vercel (ej: `https://tu-proyecto.vercel.app`).
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
