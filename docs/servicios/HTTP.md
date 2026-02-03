# Servicio HTTP - Explicacion de Scripts de Configuracion

## Que es HTTP?

**HTTP (HyperText Transfer Protocol)** es el protocolo de comunicacion utilizado para la transferencia de paginas web y contenido en Internet. Un **servidor HTTP** (tambien llamado servidor web) recibe solicitudes de los clientes (navegadores) y responde con el contenido solicitado (HTML, imagenes, CSS, JavaScript, etc.).

### Servidores web mas comunes

| Servidor | Plataforma | Descripcion |
|----------|------------|-------------|
| **IIS** | Windows Server | Internet Information Services, integrado en Windows Server |
| **Apache** | Linux/Windows | El servidor web mas utilizado historicamente, de codigo abierto |
| **Nginx** | Linux/Windows | Alto rendimiento, usado como servidor web y proxy inverso |

---

## 1. Configuracion en Windows Server (IIS)

### 1.1 Instalacion del rol IIS mediante PowerShell

```powershell
# Instalar el rol de servidor web IIS con caracteristicas comunes
Install-WindowsFeature -Name Web-Server `
    -IncludeManagementTools `
    -IncludeAllSubFeature
```

**Explicacion:**
- `Install-WindowsFeature`: Cmdlet que instala roles y caracteristicas del servidor.
- `-Name Web-Server`: Instala el rol de Internet Information Services (IIS).
- `-IncludeManagementTools`: Incluye la consola de administracion de IIS (`inetmgr`), que permite gestionar sitios web, grupos de aplicaciones y configuraciones de forma grafica.
- `-IncludeAllSubFeature`: Instala todas las sub-caracteristicas del rol, incluyendo:
  - Contenido estatico y documentos predeterminados.
  - Compresion de contenido.
  - Filtrado de solicitudes.
  - Autenticacion basica y de Windows.
  - Soporte para ASP.NET y CGI.
  - Registro y diagnostico.

### 1.2 Instalacion selectiva de caracteristicas

```powershell
# Instalacion minima con solo las caracteristicas necesarias
Install-WindowsFeature Web-Server, `
    Web-Common-Http, `
    Web-Default-Doc, `
    Web-Dir-Browsing, `
    Web-Http-Errors, `
    Web-Static-Content, `
    Web-Http-Logging, `
    Web-Stat-Compression, `
    Web-Filtering, `
    Web-Mgmt-Console
```

**Explicacion de cada caracteristica:**

| Caracteristica | Descripcion |
|----------------|-------------|
| `Web-Server` | Rol principal del servidor web IIS. |
| `Web-Common-Http` | Funcionalidades HTTP comunes (grupo). |
| `Web-Default-Doc` | Documento predeterminado. Cuando un usuario accede a un directorio, IIS busca `index.html`, `Default.htm`, etc. |
| `Web-Dir-Browsing` | Permite listar el contenido de directorios cuando no hay documento predeterminado. Generalmente se desactiva en produccion. |
| `Web-Http-Errors` | Paginas de error HTTP personalizadas (404, 500, etc.). |
| `Web-Static-Content` | Sirve archivos estaticos: HTML, CSS, JavaScript, imagenes, etc. |
| `Web-Http-Logging` | Registra todas las solicitudes HTTP en archivos de log para analisis y auditoria. |
| `Web-Stat-Compression` | Comprime contenido estatico (gzip) para reducir el ancho de banda y acelerar la carga. |
| `Web-Filtering` | Filtra solicitudes HTTP maliciosas o no deseadas (seguridad). |
| `Web-Mgmt-Console` | Consola grafica de administracion de IIS. |

### 1.3 Creacion de un sitio web

```powershell
# Importar el modulo de administracion web
Import-Module WebAdministration

# Crear el directorio fisico para el sitio web
New-Item -Path "C:\inetpub\MiSitioWeb" -ItemType Directory -Force

# Crear una pagina HTML de prueba
Set-Content -Path "C:\inetpub\MiSitioWeb\index.html" -Value @"
<!DOCTYPE html>
<html>
<head>
    <title>Mi Sitio Web</title>
</head>
<body>
    <h1>Servidor Web IIS funcionando correctamente</h1>
    <p>Este sitio esta alojado en Windows Server con IIS.</p>
</body>
</html>
"@

# Crear un nuevo sitio web en IIS
New-Website -Name "MiSitioWeb" `
    -Port 80 `
    -PhysicalPath "C:\inetpub\MiSitioWeb" `
    -HostHeader "www.midominio.local" `
    -Force
```

**Explicacion:**
- `New-Item`: Crea el directorio que contendra los archivos del sitio web.
- `Set-Content`: Crea un archivo `index.html` basico de prueba para verificar que el servidor funciona.
- `New-Website`: Crea un nuevo sitio web en IIS.
  - `-Name "MiSitioWeb"`: Nombre identificador del sitio en IIS.
  - `-Port 80`: Puerto HTTP estandar donde escucha el sitio.
  - `-PhysicalPath`: Ruta fisica del directorio raiz del sitio web.
  - `-HostHeader "www.midominio.local"`: Encabezado de host. Permite alojar multiples sitios web en la misma IP y puerto. IIS diferencia los sitios por el nombre de dominio de la solicitud. Si un cliente solicita `www.midominio.local`, IIS dirige la solicitud a este sitio.

### 1.4 Configuracion del grupo de aplicaciones (Application Pool)

```powershell
# Crear un grupo de aplicaciones dedicado
New-WebAppPool -Name "MiSitioWebPool"

# Configurar la version de .NET del pool
Set-ItemProperty "IIS:\AppPools\MiSitioWebPool" `
    -Name managedRuntimeVersion `
    -Value ""

# Configurar el modo de canalizacion (pipeline)
Set-ItemProperty "IIS:\AppPools\MiSitioWebPool" `
    -Name managedPipelineMode `
    -Value "Integrated"

# Asignar el pool al sitio web
Set-ItemProperty "IIS:\Sites\MiSitioWeb" `
    -Name applicationPool `
    -Value "MiSitioWebPool"

# Configurar el reciclaje automatico del pool
Set-ItemProperty "IIS:\AppPools\MiSitioWebPool" `
    -Name recycling.periodicRestart.time `
    -Value "00:00:00"
```

**Explicacion:**
- **Application Pool (Grupo de aplicaciones)**: Es un contenedor aislado de procesos en IIS. Cada pool ejecuta su propio proceso de trabajo (`w3wp.exe`). Si un sitio falla, no afecta a otros sitios en pools diferentes.
- `New-WebAppPool`: Crea un nuevo pool.
- `managedRuntimeVersion = ""`: Sin version de .NET (para sitios con contenido estatico puro). Para ASP.NET se usaria `"v4.0"`.
- `managedPipelineMode = "Integrated"`: Modo de canalizacion integrado. Las solicitudes pasan por el pipeline unificado de IIS y .NET. El modo alternativo `"Classic"` es para compatibilidad con aplicaciones antiguas.
- `applicationPool = "MiSitioWebPool"`: Asocia el sitio web al pool creado.
- `recycling.periodicRestart.time = "00:00:00"`: Desactiva el reciclaje periodico (reinicio automatico del proceso). En produccion se configura segun las necesidades.

### 1.5 Configuracion de bindings (enlaces) - Multiples sitios

```powershell
# Agregar un binding HTTPS al sitio
New-WebBinding -Name "MiSitioWeb" `
    -Protocol "https" `
    -Port 443 `
    -HostHeader "www.midominio.local" `
    -SslFlags 1

# Agregar un segundo sitio web en el mismo servidor
New-Website -Name "SegundoSitio" `
    -Port 80 `
    -PhysicalPath "C:\inetpub\SegundoSitio" `
    -HostHeader "otro.midominio.local"
```

**Explicacion:**
- **Binding**: Define como un sitio web recibe solicitudes (protocolo, IP, puerto, hostname).
- `New-WebBinding`: Agrega un enlace adicional al sitio existente.
  - `-Protocol "https"`: Protocolo HTTPS (cifrado con SSL/TLS).
  - `-Port 443`: Puerto estandar de HTTPS.
  - `-SslFlags 1`: Indica que se usara SNI (Server Name Indication), lo que permite multiples certificados SSL en la misma IP.
- **Host Headers**: Permiten alojar multiples sitios web en la misma IP y puerto. IIS examina el encabezado `Host` de la solicitud HTTP para determinar a que sitio dirigirla.

### 1.6 Configuracion de documentos predeterminados

```powershell
# Agregar documentos predeterminados
Add-WebConfigurationProperty -Filter "/system.webServer/defaultDocument/files" `
    -PSPath "IIS:\Sites\MiSitioWeb" `
    -Name "." `
    -Value @{ value = "index.html" }

Add-WebConfigurationProperty -Filter "/system.webServer/defaultDocument/files" `
    -PSPath "IIS:\Sites\MiSitioWeb" `
    -Name "." `
    -Value @{ value = "index.htm" }

Add-WebConfigurationProperty -Filter "/system.webServer/defaultDocument/files" `
    -PSPath "IIS:\Sites\MiSitioWeb" `
    -Name "." `
    -Value @{ value = "default.html" }
```

**Explicacion:**
- `defaultDocument/files`: Lista de archivos que IIS buscara cuando un usuario acceda a un directorio sin especificar un archivo. IIS busca en orden de la lista hasta encontrar uno que exista.
- Ejemplo: Si un usuario accede a `http://www.midominio.local/`, IIS buscara primero `index.html`, luego `index.htm`, luego `default.html`.

### 1.7 Configuracion del firewall y verificacion

```powershell
# Abrir puertos HTTP y HTTPS en el firewall
New-NetFirewallRule -DisplayName "HTTP" `
    -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

New-NetFirewallRule -DisplayName "HTTPS" `
    -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Verificar que el sitio esta en ejecucion
Get-Website -Name "MiSitioWeb"

# Iniciar el sitio si esta detenido
Start-Website -Name "MiSitioWeb"

# Verificar todos los bindings
Get-WebBinding -Name "MiSitioWeb"

# Probar el sitio localmente
Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
```

**Explicacion:**
- `New-NetFirewallRule`: Abre los puertos 80 (HTTP) y 443 (HTTPS) en el Firewall de Windows.
- `Get-Website`: Muestra informacion del sitio (estado, bindings, ruta fisica).
- `Get-WebBinding`: Lista todos los enlaces del sitio (protocolos, puertos, hostnames).
- `Invoke-WebRequest`: Realiza una solicitud HTTP desde PowerShell para verificar que el sitio responde. `-UseBasicParsing` evita la necesidad del motor de Internet Explorer.

---

## 2. Configuracion en Ubuntu Server (Apache2)

### 2.1 Instalacion de Apache2

```bash
# Actualizar repositorios e instalar Apache2
sudo apt update
sudo apt install -y apache2
```

**Explicacion:**
- `apache2`: El servidor web HTTP Apache, el mas utilizado en servidores Linux. Es de codigo abierto, modular y altamente configurable.
- Despues de la instalacion, Apache ya esta activo y sirviendo una pagina predeterminada en el puerto 80.

### 2.2 Estructura de directorios de Apache

```
/etc/apache2/                  # Directorio principal de configuracion
    apache2.conf               # Configuracion global principal
    ports.conf                 # Puertos en los que Apache escucha
    sites-available/           # Archivos de configuracion de sitios disponibles
    sites-enabled/             # Enlaces simbolicos a sitios activos
    mods-available/            # Modulos disponibles
    mods-enabled/              # Modulos activos (enlaces simbolicos)
    conf-available/            # Configuraciones adicionales disponibles
    conf-enabled/              # Configuraciones adicionales activas

/var/www/                      # Directorio raiz de los sitios web
    html/                      # Sitio predeterminado
```

**Explicacion de la estructura:**
- Apache usa un sistema de **available/enabled** para gestionar sitios y modulos.
- Los archivos en `sites-available/` contienen las definiciones de los sitios web.
- Solo los sitios con un enlace simbolico en `sites-enabled/` estan activos.
- Esto permite tener configuraciones preparadas pero no activas.

### 2.3 Configuracion del archivo de puertos

```bash
# Ver y editar los puertos de escucha
sudo nano /etc/apache2/ports.conf
```

Contenido:

```conf
# Escuchar en el puerto 80 (HTTP)
Listen 80

# Escuchar en el puerto 443 si el modulo SSL esta habilitado
<IfModule ssl_module>
    Listen 443
</IfModule>

<IfModule mod_gnutls.c>
    Listen 443
</IfModule>
```

**Explicacion:**
- `Listen 80`: Apache escucha solicitudes HTTP en el puerto 80 en todas las interfaces de red.
- `<IfModule ssl_module>`: Bloque condicional. Solo escucha en el puerto 443 si el modulo SSL esta cargado. Esto evita errores si SSL no esta instalado.
- Se puede cambiar a `Listen 192.168.1.10:80` para escuchar solo en una interfaz especifica.

### 2.4 Creacion de un Virtual Host (Sitio web)

```bash
# Crear el directorio del sitio web
sudo mkdir -p /var/www/midominio

# Asignar permisos al usuario de Apache
sudo chown -R www-data:www-data /var/www/midominio
sudo chmod -R 755 /var/www/midominio

# Crear una pagina HTML de prueba
sudo nano /var/www/midominio/index.html
```

Contenido de `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Sitio Web</title>
</head>
<body>
    <h1>Servidor Apache funcionando correctamente</h1>
    <p>Este sitio esta alojado en Ubuntu Server con Apache2.</p>
</body>
</html>
```

**Explicacion:**
- `mkdir -p /var/www/midominio`: Crea el directorio raiz del sitio web. `-p` crea directorios padres si no existen.
- `chown -R www-data:www-data`: Cambia el propietario recursivamente al usuario de Apache (`www-data`). Este es el usuario con el que se ejecuta el proceso de Apache.
- `chmod -R 755`: Establece permisos:
  - Propietario (www-data): lectura + escritura + ejecucion (7).
  - Grupo: lectura + ejecucion (5).
  - Otros: lectura + ejecucion (5).

### 2.5 Archivo de configuracion del Virtual Host

```bash
# Crear el archivo de configuracion del sitio
sudo nano /etc/apache2/sites-available/midominio.conf
```

Contenido:

```conf
<VirtualHost *:80>
    # Nombre del servidor (dominio principal)
    ServerName www.midominio.local

    # Alias del dominio (nombres alternativos)
    ServerAlias midominio.local

    # Correo del administrador del sitio
    ServerAdmin admin@midominio.local

    # Directorio raiz del sitio web
    DocumentRoot /var/www/midominio

    # Configuracion del directorio raiz
    <Directory /var/www/midominio>
        # Permitir acceso a este directorio
        Options Indexes FollowSymLinks

        # Permitir que los archivos .htaccess sobreescriban configuraciones
        AllowOverride All

        # Permitir acceso a todos
        Require all granted
    </Directory>

    # Configuracion de logs
    # Log de errores
    ErrorLog ${APACHE_LOG_DIR}/midominio_error.log

    # Log de acceso con formato combinado
    CustomLog ${APACHE_LOG_DIR}/midominio_access.log combined

    # Nivel de detalle del log de errores
    LogLevel warn
</VirtualHost>
```

**Explicacion detallada de cada directiva:**

| Directiva | Descripcion |
|-----------|-------------|
| `<VirtualHost *:80>` | Define un host virtual que responde en cualquier IP (`*`) en el puerto 80. Permite alojar multiples sitios en un solo servidor. |
| `ServerName` | Nombre de dominio principal del sitio. Apache compara este nombre con el encabezado `Host` de la solicitud HTTP para determinar que sitio servir. |
| `ServerAlias` | Nombres de dominio adicionales que tambien apuntan a este sitio. Permite que tanto `www.midominio.local` como `midominio.local` sirvan el mismo contenido. |
| `ServerAdmin` | Correo del administrador. Aparece en paginas de error y logs. |
| `DocumentRoot` | Directorio raiz del sitio. Apache sirve archivos desde esta ubicacion. |
| `Options Indexes` | Si no hay archivo `index.html`, muestra un listado del directorio. En produccion se recomienda desactivar (`-Indexes`). |
| `Options FollowSymLinks` | Permite que Apache siga enlaces simbolicos. Necesario para muchas aplicaciones. |
| `AllowOverride All` | Permite que archivos `.htaccess` en el directorio sobreescriban cualquier directiva. Util para reescritura de URLs y configuraciones por directorio. |
| `Require all granted` | Permite el acceso a todos los usuarios. Sin esta directiva, Apache deniega el acceso por defecto. |
| `ErrorLog` | Ruta del archivo de registro de errores. `${APACHE_LOG_DIR}` es una variable que apunta a `/var/log/apache2/`. |
| `CustomLog` | Ruta del archivo de registro de acceso. `combined` es un formato de log que incluye IP, fecha, solicitud, codigo de respuesta, tamano, referrer y user-agent. |
| `LogLevel warn` | Nivel de detalle del log. Opciones: `emerg`, `alert`, `crit`, `error`, `warn`, `notice`, `info`, `debug`. |

### 2.6 Habilitar el sitio y modulos necesarios

```bash
# Habilitar el sitio web (crea enlace simbolico en sites-enabled)
sudo a2ensite midominio.conf

# Deshabilitar el sitio predeterminado de Apache (opcional)
sudo a2dissite 000-default.conf

# Habilitar el modulo de reescritura de URLs
sudo a2enmod rewrite

# Habilitar el modulo de cabeceras HTTP
sudo a2enmod headers

# Habilitar el modulo SSL para HTTPS
sudo a2enmod ssl

# Verificar la sintaxis de la configuracion
sudo apache2ctl configtest
```

**Explicacion:**
- `a2ensite` (Apache2 Enable Site): Crea un enlace simbolico del archivo en `sites-available/` hacia `sites-enabled/`, activando el sitio.
- `a2dissite` (Apache2 Disable Site): Elimina el enlace simbolico, desactivando el sitio.
- `a2enmod` (Apache2 Enable Module): Activa un modulo de Apache.
  - `rewrite`: Permite reescritura de URLs (necesario para URLs amigables, redirecciones, etc.).
  - `headers`: Permite agregar/modificar cabeceras HTTP (seguridad, cache, CORS).
  - `ssl`: Habilita el soporte para HTTPS (cifrado TLS/SSL).
- `apache2ctl configtest`: Verifica que la configuracion de Apache no tenga errores de sintaxis. Debe mostrar `Syntax OK`.

### 2.7 Configuracion de un segundo Virtual Host

```bash
# Crear directorio para el segundo sitio
sudo mkdir -p /var/www/segundositio
sudo chown -R www-data:www-data /var/www/segundositio

# Crear configuracion del segundo sitio
sudo nano /etc/apache2/sites-available/segundositio.conf
```

Contenido:

```conf
<VirtualHost *:80>
    ServerName otro.midominio.local
    DocumentRoot /var/www/segundositio

    <Directory /var/www/segundositio>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/segundositio_error.log
    CustomLog ${APACHE_LOG_DIR}/segundositio_access.log combined
</VirtualHost>
```

```bash
# Habilitar el segundo sitio
sudo a2ensite segundositio.conf
```

**Explicacion:**
- Se pueden tener multiples Virtual Hosts en el mismo servidor Apache.
- Apache usa el `ServerName` para dirigir cada solicitud al sitio correcto.
- `Options -Indexes`: El signo `-` DESACTIVA el listado de directorios (mas seguro para produccion).
- Cada sitio tiene sus propios archivos de log para facilitar el diagnostico.

### 2.8 Configuracion del firewall y reinicio

```bash
# Permitir trafico HTTP y HTTPS en el firewall
sudo ufw allow 'Apache Full'

# Esto equivale a:
# sudo ufw allow 80/tcp
# sudo ufw allow 443/tcp

# Reiniciar Apache para aplicar todos los cambios
sudo systemctl restart apache2

# Habilitar inicio automatico
sudo systemctl enable apache2

# Verificar el estado del servicio
sudo systemctl status apache2
```

**Explicacion:**
- `ufw allow 'Apache Full'`: UFW tiene perfiles de aplicaciones predefinidos. `Apache Full` abre los puertos 80 y 443 de una sola vez.
- `systemctl restart apache2`: Reinicia el servicio aplicando todos los cambios.
- `systemctl enable apache2`: Garantiza que Apache inicie automaticamente al arrancar el sistema.

### 2.9 Verificacion del servicio

```bash
# Verificar que Apache esta escuchando en los puertos correctos
sudo ss -tlnp | grep apache

# Probar el sitio localmente con curl
curl -H "Host: www.midominio.local" http://localhost

# Ver los logs en tiempo real
sudo tail -f /var/log/apache2/midominio_access.log
sudo tail -f /var/log/apache2/midominio_error.log

# Ver los modulos cargados
apache2ctl -M

# Ver la configuracion completa de Virtual Hosts
apache2ctl -S
```

**Explicacion:**
- `ss -tlnp | grep apache`: Verifica que Apache esta escuchando en los puertos 80 y/o 443.
- `curl -H "Host: www.midominio.local" http://localhost`: Envia una solicitud HTTP con el encabezado `Host` especifico para probar el Virtual Host correcto.
- `apache2ctl -M`: Lista todos los modulos cargados (estaticos y dinamicos).
- `apache2ctl -S`: Muestra un resumen de todos los Virtual Hosts configurados, sus puertos y dominios asociados. Muy util para diagnostico.

---

## 3. Comparacion IIS vs Apache

| Caracteristica | IIS (Windows) | Apache (Ubuntu) |
|----------------|---------------|-----------------|
| Configuracion | PowerShell / GUI (inetmgr) | Archivos de texto (.conf) |
| Sitios multiples | Bindings (HostHeader) | Virtual Hosts (ServerName) |
| Modulos | Roles/Features de Windows | a2enmod / a2dismod |
| Aislamiento | Application Pools | Proceso unico (prefork/worker) |
| Logs | `C:\inetpub\logs` | `/var/log/apache2/` |
| Directorio web | `C:\inetpub\wwwroot` | `/var/www/html` |
| Servicio | W3SVC (World Wide Web) | apache2 |
| Activar/Desactivar | Start-Website / Stop-Website | a2ensite / a2dissite |

## 4. Puertos utilizados

- **TCP 80**: Puerto estandar HTTP (sin cifrar).
- **TCP 443**: Puerto estandar HTTPS (cifrado con SSL/TLS).
- **TCP 8080**: Puerto alternativo comun para HTTP (desarrollo/proxy).
