# Obsidian Course Tracker Plugin

Este plugin para [Obsidian](https://obsidian.md/) genera automáticamente una estructura de carpetas y archivos markdown para un curso de [Coursera](https://www.coursera.org/) a partir de su URL. Ideal para documentar y llevar el control de tu formación dentro de tu vault.

## Características principales

- **Scraping** de módulos, lecciones y duraciones desde Coursera.  
- **Generación automática** de un archivo `_index.md` con casillas de progreso.  
- Organización en carpetas por módulo y lección bajo `Cursos/Coursera/`.  
- Ajuste del intérprete de Python (p. ej. `python3` o ruta completa) desde el panel de Settings.  
- Compatible con Windows, macOS y Linux (Obsidian Desktop).

## Requisitos previos

1. **Obsidian Desktop** (no funciona en la versión web).  
2. **Python 3** instalado y accesible desde la terminal.  
3. Paquetes Python instalados con:

   ```bash
   pip install -r requirements.txt
   ```

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/matzalazar/obsidian-course-tracker
   ```

2. Ve al directorio y compila:

   ```bash
   cd obsidian-course-tracker/
   npm install  
   npm run build  
   ```

3. Copia **solo** los artefactos al directorio `.obsidian/plugins` de tu vault:

   En Linux/macOS:
   ```bash
   mkdir -p /TuVault/.obsidian/plugins/obsidian-course-tracker/
   cp main.js manifest.json /TuVault/.obsidian/plugins/obsidian-course-tracker/
   ```

   En Windows:
   ```
   C:\Users\TuUsuario\ObsidianVault\.obsidian\plugins\obsidian-course-tracker\
   ```

4. Reinicia Obsidian y activa “Course Tracker” en Community Plugins.

## Configuración

Dentro de Obsidian, ve a **Settings → Plugins → Course Tracker Settings** y define:

- **Python Path**: comando o ruta completa al ejecutable de Python (p. ej. `python3` o `/usr/bin/python3`).
- **Descarga Archivo**: usa el botón “Download” para guardar automáticamente `coursera.py` en la carpeta del plugin si no está presente.

## Estructura de salida

Al invocar Enter Course URL”, el plugin:

1. Crea carpeta:

   ```
   Cursos/<Plataforma>/<Nombre del Curso>/
   ```

2. Genera `_index.md` con:

   ```
   # 📘 Título del Curso

   **Enlace al curso:** [Ver en Coursera](<URL>)

   ---

   ## Módulo 1: Nombre del Módulo

   - [ ] Lección 1 — _Duración_
   - [ ] Lección 2 — _Duración_
   ```

3. Añade un `.md` por cada lección con metadatos y título.

Ejemplo de árbol generado:

```
Cursos/
└── Coursera/
    └── Mathematics for Engineers/
        ├── _index.md
        ├── Módulo 1/
        │   ├── 00_Introducción.md
        │   └── 01_Matrices.md
        └── Módulo 2/
            └── 02_Determinantes.md
```

## Licencia

MIT

## Contribuciones

Pull Requests y issues son bienvenidos.