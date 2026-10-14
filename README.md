# Drive RAW Catalog & Mapper 📸

> Aplicación web profesional de alto rendimiento diseñada específicamente para fotógrafos que manejan archivos RAW pesados de Nikon (`.NEF`) almacenados en Google Drive.

Desarrollada con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **NextAuth.js (Google OAuth 2.0)** y lista para despliegue inmediato en **Vercel** o ejecución local.

---

## 🌟 Características Principales

1. **Autenticación Oficial Google OAuth 2.0:**
   - Inicio de sesión con el botón oficial de Google Identity ("Sign in with Google").
   - Permiso exclusivo de solo lectura (`https://www.googleapis.com/auth/drive.readonly`) para máxima seguridad y privacidad.
   - Persistencia de sesión segura y cifrado mediante JWT tokens.

2. **Diseño Visual Profesional (Dark Mode):**
   - Interfaz en tonos oscuros profundos (`#07080a`, `#0d0f14`, acentos en amarillo/dorado Nikon `#FFE600`).
   - Evita la fatiga visual y garantiza una apreciación fiel de los tonos fotográficos.
   - Cuadrícula adaptable (CSS Grid) con carga perezosa (*lazy loading*), skeletons y optimización de miniaturas.

3. **Panel de Control y Toggle de Metadatos:**
   - **Toggle Interactivo ("Mostrar / Ocultar Metadatos"):** Muestra u oculta con un solo clic el peso exacto en MB, la extensión `.NEF`, la ruta de carpetas en Google Drive y la fecha de última modificación debajo de cada toma.
   - **Barra de Búsqueda Instantánea:** Filtrado en tiempo real por nombre de archivo (ej. `DSC_9410`), carpeta o modelo de cámara.
   - **Ordenamiento Flexible:** Por fecha (más recientes / más antiguos), nombre (A-Z) o tamaño en megabytes.

4. **Selección Masiva y Descarga Directa:**
   - Casillas de verificación (*checkboxes*) independientes y botón de "Seleccionar / Deseleccionar Todo".
   - Barra flotante interactiva que calcula en tiempo real la cantidad de tomas marcadas y el peso total acumulado en MB/GB.
   - Botón principal de **"Enviar a Descarga Local"** que envía las tomas originales directamente a tu disco local de Windows (descarga secuencial automática o compresión instantánea en paquete `.zip`).

5. **Modo Demostración Integrado:**
   - Si no has configurado tus credenciales de Google OAuth todavía, la app incluye un catálogo de prueba realista con tomas Nikon Z8/D850/Z9 para que puedas probar toda la experiencia visual y funcional de inmediato.

---

## 📁 Estructura del Proyecto

```text
driveline/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # Endpoint NextAuth con Google Provider
│   │   │   ├── drive/files/route.ts        # Listado y filtrado de .NEF en Google Drive
│   │   │   └── drive/download/route.ts     # Streaming de descarga de RAW original
│   │   ├── login/
│   │   │   └── page.tsx                    # Pantalla de Login con Google Button oficial
│   │   ├── globals.css                     # Estilos Dark Mode y animaciones
│   │   ├── layout.tsx                      # Layout raíz con AuthProvider
│   │   └── page.tsx                        # Catálogo principal y galería interactiva
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleSignInButton.tsx      # Botón oficial Google Sign In
│   │   ├── gallery/
│   │   │   ├── DriveFolderModal.tsx        # Modal selector de alcance/carpeta de Drive
│   │   │   ├── PhotoCard.tsx               # Tarjeta fotográfica con toggle de metadatos
│   │   │   ├── PhotoDetailModal.tsx        # Inspector EXIF y visor ampliado
│   │   │   ├── PhotoGrid.tsx               # Cuadrícula adaptativa con lazy loading
│   │   │   └── SelectionActionBar.tsx      # Barra flotante de descarga a disco local
│   │   ├── layout/
│   │   │   └── Navbar.tsx                  # Barra superior de navegación y controles
│   │   └── providers/
│   │       └── AuthProvider.tsx            # SessionProvider de NextAuth
│   ├── lib/
│   │   ├── auth.ts                         # Configuración de NextAuth
│   │   ├── drive.ts                        # Cliente Google Drive v3 y catálogo mock
│   │   └── utils.ts                        # Formateadores de bytes, fechas y utilidades
│   └── types/
│       ├── index.ts                        # Definiciones TypeScript de archivos y metadatos
│       └── next-auth.d.ts                  # Extensión de tipos de sesión NextAuth
├── .env.example                            # Plantilla de variables de entorno
├── next.config.mjs                         # Configuración de dominios de imágenes en Next.js
├── tailwind.config.ts                      # Paleta Dark y acentos Nikon
├── tsconfig.json                           # Configuración TypeScript con alias @/*
└── package.json                            # Dependencias y scripts
```

---

## ⚙️ Configuración de Google OAuth 2.0 (Google Cloud Console)

Para conectar tu cuenta de Google real y mapear tu Google Drive:

1. Ingresa a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo o selecciona uno existente (ej: `Drive RAW Catalog`).
3. Ve a **APIs & Services > Library** y busca **Google Drive API**. Haz clic en **Enable** (Habilitar).
4. Ve a **APIs & Services > OAuth consent screen**:
   - Tipo de usuario: **External** (Externo).
   - Llena los datos básicos (Nombre de la app, tu correo de soporte).
   - En **Scopes** (Permisos), añade `https://www.googleapis.com/auth/drive.readonly`.
   - En **Test users** (Usuarios de prueba), añade tu dirección de correo de Google con la que iniciarás sesión.
5. Ve a **APIs & Services > Credentials > Create Credentials > OAuth Client ID**:
   - Tipo de aplicación: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - Tu URL de producción en Vercel (ej: `https://tu-proyecto.vercel.app`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://tu-proyecto.vercel.app/api/auth/callback/google`
6. Copia el **Client ID** y el **Client Secret**.

---

## 🚀 Despliegue en Vercel

1. Sube este repositorio a tu cuenta de **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit Drive RAW Catalog"
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

2. Entra a tu panel de [Vercel](https://vercel.com/) y selecciona **Add New > Project**.
3. Importa tu repositorio de GitHub.
4. En la sección **Environment Variables**, añade:
   - `NEXTAUTH_SECRET`: Una clave aleatoria segura de 32 caracteres (la puedes generar con `openssl rand -base64 32`).
   - `NEXTAUTH_URL`: La URL pública de tu proyecto en Vercel (ej: `https://tu-proyecto.vercel.app`).
   - `GOOGLE_CLIENT_ID`: Tu Client ID de Google Cloud.
   - `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google Cloud.
5. Haz clic en **Deploy**. ¡Tu aplicación estará en línea al instante!

---

## 💻 Ejecución Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Crea tu archivo de entorno local:
   ```bash
   cp .env.example .env.local
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
