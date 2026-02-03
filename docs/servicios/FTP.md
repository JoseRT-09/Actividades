# Servicio FTP - Explicacion de Scripts de Configuracion

## Que es FTP?

**FTP (File Transfer Protocol)** es un protocolo de red para la transferencia de archivos entre un cliente y un servidor. Permite subir, descargar, renombrar y eliminar archivos de forma remota. Opera en el modelo cliente-servidor utilizando dos conexiones:

- **Canal de control (puerto 21)**: Transmite los comandos FTP (login, listar, descargar, etc.).
- **Canal de datos (puerto 20 o dinamico)**: Transmite los archivos y listados de directorios.

### Modos de conexion

| Modo | Descripcion |
|------|-------------|
| **Activo** | El servidor inicia la conexion de datos desde el puerto 20 hacia el cliente. Problemas con firewalls. |
| **Pasivo** | El cliente inicia ambas conexiones. El servidor indica un puerto aleatorio para datos. Mas compatible con firewalls. |

---

## 1. Configuracion en Windows Server

### 1.1 Instalacion del rol FTP mediante PowerShell

```powershell
# Instalar el rol de servidor web IIS con el servicio FTP
Install-WindowsFeature Web-Server, Web-Ftp-Server -IncludeManagementTools

# Instalar el servicio FTP especifico
Install-WindowsFeature Web-Ftp-Service, Web-Ftp-Ext
```

**Explicacion:**
- `Web-Server`: Instala el rol de IIS (Internet Information Services), que es prerequisito para FTP en Windows Server.
- `Web-Ftp-Server`: Instala el componente del servidor FTP dentro de IIS.
- `-IncludeManagementTools`: Incluye la consola de administracion de IIS (inetmgr) donde se gestiona FTP graficamente.
- `Web-Ftp-Service`: Servicio FTP principal.
- `Web-Ftp-Ext`: Extensiones de FTP que habilitan funcionalidades adicionales como autenticacion personalizada.

### 1.2 Creacion de un sitio FTP

```powershell
# Importar el modulo de administracion web de IIS
Import-Module WebAdministration

# Crear el directorio raiz para el sitio FTP
New-Item -Path "C:\FTP\SitioFTP" -ItemType Directory -Force

# Crear un nuevo sitio FTP
New-WebFtpSite -Name "SitioFTP" `
    -Port 21 `
    -PhysicalPath "C:\FTP\SitioFTP" `
    -IPAddress "*" `
    -Force
```

**Explicacion:**
- `Import-Module WebAdministration`: Carga el modulo de PowerShell que contiene los cmdlets para administrar IIS y FTP.
- `New-Item -Path "C:\FTP\SitioFTP"`: Crea el directorio fisico donde se almacenaran los archivos compartidos por FTP.
  - `-ItemType Directory`: Indica que se esta creando un directorio.
  - `-Force`: Crea la ruta completa incluso si los directorios padres no existen.
- `New-WebFtpSite`: Crea un nuevo sitio FTP en IIS.
  - `-Name "SitioFTP"`: Nombre identificador del sitio en IIS.
  - `-Port 21`: Puerto TCP donde escucha el servicio FTP (21 es el estandar).
  - `-PhysicalPath`: Ruta del directorio raiz del sitio FTP.
  - `-IPAddress "*"`: Escucha en todas las interfaces de red disponibles.

### 1.3 Configuracion de autenticacion

```powershell
# Habilitar autenticacion basica (usuario y contrasena)
Set-ItemProperty "IIS:\Sites\SitioFTP" `
    -Name ftpServer.security.authentication.basicAuthentication.enabled `
    -Value $true

# Deshabilitar autenticacion anonima
Set-ItemProperty "IIS:\Sites\SitioFTP" `
    -Name ftpServer.security.authentication.anonymousAuthentication.enabled `
    -Value $false
```

**Explicacion:**
- `Set-ItemProperty "IIS:\Sites\SitioFTP"`: Modifica propiedades del sitio FTP a traves del proveedor de IIS en PowerShell.
- **Autenticacion basica** (`basicAuthentication.enabled = $true`): Los usuarios deben autenticarse con credenciales de Windows (usuario/contrasena). Las credenciales se envian en texto plano (se recomienda usar FTPS para cifrarlas).
- **Autenticacion anonima** (`anonymousAuthentication.enabled = $false`): Se desactiva para evitar que usuarios sin credenciales accedan al servidor. Si estuviera habilitada, cualquiera podria conectarse como usuario "anonymous".

### 1.4 Configuracion de autorizacion

```powershell
# Agregar regla de autorizacion para permitir lectura y escritura a usuarios especificos
Add-WebConfiguration "/system.ftpServer/security/authorization" `
    -Value @{
        accessType = "Allow"
        users = "ftpuser"
        permissions = "Read, Write"
    } `
    -PSPath "IIS:\" `
    -Location "SitioFTP"
```

**Explicacion:**
- `Add-WebConfiguration`: Agrega configuracion al archivo applicationHost.config de IIS.
- `/system.ftpServer/security/authorization`: Ruta de configuracion de las reglas de autorizacion FTP.
- `accessType = "Allow"`: Define una regla de permiso (tambien puede ser "Deny" para denegar).
- `users = "ftpuser"`: Usuario de Windows al que se aplica la regla. Debe existir como usuario local o de dominio.
- `permissions = "Read, Write"`: Permisos concedidos:
  - `Read`: Descargar archivos y listar directorios.
  - `Write`: Subir archivos, crear directorios, renombrar y eliminar.

### 1.5 Configuracion del modo pasivo y firewall

```powershell
# Configurar el rango de puertos para el modo pasivo
Set-WebConfigurationProperty "/system.ftpServer/firewallSupport" `
    -PSPath "IIS:\" `
    -Name "lowDataChannelPort" `
    -Value 50000

Set-WebConfigurationProperty "/system.ftpServer/firewallSupport" `
    -PSPath "IIS:\" `
    -Name "highDataChannelPort" `
    -Value 50100

# Configurar la IP externa para modo pasivo (si esta detras de NAT)
Set-ItemProperty "IIS:\Sites\SitioFTP" `
    -Name ftpServer.firewallSupport.externalIp4Address `
    -Value "192.168.1.10"

# Abrir los puertos en el Firewall de Windows
New-NetFirewallRule -DisplayName "FTP Control" `
    -Direction Inbound -Protocol TCP -LocalPort 21 -Action Allow

New-NetFirewallRule -DisplayName "FTP Pasivo" `
    -Direction Inbound -Protocol TCP -LocalPort 50000-50100 -Action Allow
```

**Explicacion:**
- **Modo pasivo**: El servidor le dice al cliente que se conecte a un puerto dentro de un rango definido para transferir datos.
  - `lowDataChannelPort` y `highDataChannelPort`: Definen el rango de puertos (50000-50100 = 101 conexiones simultaneas posibles).
- `externalIp4Address`: Si el servidor esta detras de un NAT/router, se configura la IP publica para que los clientes puedan conectarse correctamente en modo pasivo.
- `New-NetFirewallRule`: Crea reglas en el Firewall de Windows:
  - Puerto 21: Canal de control FTP.
  - Puertos 50000-50100: Rango del canal de datos pasivo.
  - `-Direction Inbound`: Trafico entrante.
  - `-Action Allow`: Permitir el trafico.

### 1.6 Configuracion de aislamiento de usuarios

```powershell
# Habilitar aislamiento de usuarios (cada usuario ve solo su carpeta)
Set-ItemProperty "IIS:\Sites\SitioFTP" `
    -Name ftpServer.userIsolation.mode `
    -Value 3
```

**Explicacion:**
- `userIsolation.mode`: Controla como se aislan los usuarios:
  - `0 (None)`: Sin aislamiento. Todos los usuarios ven el mismo directorio raiz.
  - `1 (StartInUsersDirectory)`: Los usuarios inician en su carpeta pero pueden navegar fuera.
  - `3 (IsolateAllDirectories)`: Aislamiento completo. Cada usuario esta confinado a su propio directorio (`C:\FTP\SitioFTP\LocalUser\nombre_usuario`). No pueden navegar fuera de su carpeta.

### 1.7 Crear usuario FTP y asignar permisos

```powershell
# Crear un usuario local para FTP
New-LocalUser -Name "ftpuser" `
    -Password (ConvertTo-SecureString "Contrasena123!" -AsPlainText -Force) `
    -FullName "Usuario FTP" `
    -Description "Cuenta para acceso FTP" `
    -PasswordNeverExpires

# Crear la carpeta del usuario
New-Item -Path "C:\FTP\SitioFTP\LocalUser\ftpuser" -ItemType Directory -Force

# Asignar permisos NTFS a la carpeta del usuario
$acl = Get-Acl "C:\FTP\SitioFTP\LocalUser\ftpuser"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "ftpuser", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\FTP\SitioFTP\LocalUser\ftpuser" $acl
```

**Explicacion:**
- `New-LocalUser`: Crea una cuenta de usuario local de Windows.
  - `ConvertTo-SecureString`: Convierte la contrasena en texto plano a un objeto SecureString requerido por el cmdlet.
  - `-PasswordNeverExpires`: La contrasena no expirara (conveniente para cuentas de servicio, aunque en produccion se recomienda politica de rotacion).
- **Permisos NTFS**: Ademas de la autorizacion FTP, se deben configurar los permisos del sistema de archivos:
  - `Get-Acl`: Obtiene la lista de control de acceso actual del directorio.
  - `FileSystemAccessRule`: Crea una nueva regla de acceso.
  - `"Modify"`: Permiso de modificacion (leer, escribir, eliminar, crear).
  - `"ContainerInherit,ObjectInherit"`: Los permisos se heredan a subcarpetas y archivos.
  - `Set-Acl`: Aplica la lista de control de acceso modificada.

### 1.8 Verificacion del servicio

```powershell
# Verificar que el sitio FTP esta en ejecucion
Get-Website -Name "SitioFTP"

# Iniciar el sitio si esta detenido
Start-Website -Name "SitioFTP"

# Probar la conexion FTP localmente
# Desde cmd o PowerShell:
ftp localhost
```

---

## 2. Configuracion en Ubuntu Server

### 2.1 Instalacion del servidor FTP (vsftpd)

```bash
# Actualizar repositorios e instalar vsftpd
sudo apt update
sudo apt install -y vsftpd
```

**Explicacion:**
- `vsftpd` (**Very Secure FTP Daemon**): Es el servidor FTP mas utilizado en Linux. Su nombre enfatiza la seguridad como prioridad de diseno. Es el servidor FTP predeterminado en muchas distribuciones Linux.
- `-y`: Confirma la instalacion automaticamente.

### 2.2 Copia de seguridad y configuracion principal

```bash
# Crear copia de seguridad del archivo original
sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.backup

# Editar el archivo de configuracion
sudo nano /etc/vsftpd.conf
```

Contenido del archivo de configuracion:

```conf
# ============================================
# CONFIGURACION GENERAL
# ============================================

# Escuchar en modo standalone (no usar inetd/xinetd)
listen=YES

# Desactivar IPv6 (si no se necesita)
listen_ipv6=NO

# ============================================
# CONTROL DE ACCESO
# ============================================

# Deshabilitar acceso anonimo
anonymous_enable=NO

# Permitir acceso a usuarios locales del sistema
local_enable=YES

# Permitir que los usuarios suban archivos (escritura)
write_enable=YES

# Mascara de permisos para archivos subidos
# 022 = archivos creados con permisos 755 (directorios) y 644 (archivos)
local_umask=022

# ============================================
# SEGURIDAD - CHROOT (Enjaulado)
# ============================================

# Enjaular a los usuarios en su directorio home
# Los usuarios NO podran navegar fuera de su home
chroot_local_user=YES

# Permitir escritura en el directorio raiz del chroot
allow_writeable_chroot=YES

# ============================================
# DIRECTORIO Y ARCHIVOS
# ============================================

# Usar hora local en lugar de UTC para los listados
use_localtime=YES

# Habilitar el log de transferencias
xferlog_enable=YES

# Ruta del archivo de log
xferlog_file=/var/log/vsftpd.log

# Formato detallado de log
log_ftp_protocol=YES

# ============================================
# MODO PASIVO
# ============================================

# Habilitar modo pasivo
pasv_enable=YES

# Rango de puertos para conexiones pasivas
pasv_min_port=40000
pasv_max_port=40100

# ============================================
# CONEXION
# ============================================

# Puerto de control FTP
listen_port=21

# Habilitar conexion de datos en puerto 20
connect_from_port_20=YES

# Tiempo de espera para sesiones inactivas (segundos)
idle_session_timeout=300

# Tiempo de espera para transferencias de datos (segundos)
data_connection_timeout=120

# Numero maximo de clientes simultaneos
max_clients=50

# Maximo conexiones por IP
max_per_ip=5

# ============================================
# LISTA DE USUARIOS
# ============================================

# Activar lista de usuarios permitidos
userlist_enable=YES

# Denegar usuarios que NO estan en la lista
# (solo los listados pueden conectarse)
userlist_deny=NO

# Archivo con la lista de usuarios permitidos
userlist_file=/etc/vsftpd.userlist

# ============================================
# BANNER Y MENSAJES
# ============================================

# Mensaje de bienvenida al conectarse
ftpd_banner=Bienvenido al servidor FTP.

# Habilitar mensajes de directorio (.message)
dirmessage_enable=YES
```

**Explicacion detallada de cada seccion:**

#### Control de acceso
| Directiva | Valor | Descripcion |
|-----------|-------|-------------|
| `anonymous_enable` | NO | Desactiva el acceso sin credenciales. Los usuarios deben autenticarse. |
| `local_enable` | YES | Permite que los usuarios del sistema Linux inicien sesion por FTP. |
| `write_enable` | YES | Permite operaciones de escritura: subir archivos, crear directorios, eliminar. |
| `local_umask` | 022 | Mascara que se resta de los permisos maximos. 777-022=755 para directorios, 666-022=644 para archivos. |

#### Seguridad - Chroot
| Directiva | Valor | Descripcion |
|-----------|-------|-------------|
| `chroot_local_user` | YES | Enjaula a cada usuario en su directorio home. No pueden acceder a `/etc`, `/var`, etc. Es una medida de seguridad critica. |
| `allow_writeable_chroot` | YES | Permite que el directorio raiz del chroot tenga permisos de escritura. Sin esto, vsftpd rechazaria la conexion si el home es escribible. |

#### Modo pasivo
| Directiva | Valor | Descripcion |
|-----------|-------|-------------|
| `pasv_enable` | YES | Activa el modo pasivo. Necesario para clientes detras de firewalls/NAT. |
| `pasv_min_port` | 40000 | Puerto minimo del rango pasivo. |
| `pasv_max_port` | 40100 | Puerto maximo del rango pasivo. 101 puertos = 101 transferencias simultaneas posibles. |

#### Conexion
| Directiva | Valor | Descripcion |
|-----------|-------|-------------|
| `idle_session_timeout` | 300 | Desconecta sesiones inactivas despues de 5 minutos. |
| `data_connection_timeout` | 120 | Desconecta transferencias paradas despues de 2 minutos. |
| `max_clients` | 50 | Limite total de conexiones simultaneas al servidor. |
| `max_per_ip` | 5 | Maximo 5 conexiones desde una misma IP. Previene abuso de recursos. |

#### Lista de usuarios
| Directiva | Valor | Descripcion |
|-----------|-------|-------------|
| `userlist_enable` | YES | Activa el filtrado de usuarios mediante un archivo de lista. |
| `userlist_deny` | NO | Invierte la logica: solo los usuarios EN la lista pueden conectarse (whitelist). Si fuera YES, los usuarios en la lista serian bloqueados (blacklist). |
| `userlist_file` | /etc/vsftpd.userlist | Ruta al archivo que contiene los nombres de usuario permitidos, uno por linea. |

### 2.3 Crear usuario FTP y su directorio

```bash
# Crear un usuario para FTP con directorio home personalizado
sudo adduser --home /home/ftpuser --shell /usr/sbin/nologin ftpuser

# Agregar el usuario a la lista de usuarios permitidos
echo "ftpuser" | sudo tee -a /etc/vsftpd.userlist

# Crear un directorio para subir archivos dentro del home
sudo mkdir -p /home/ftpuser/archivos

# Establecer permisos correctos
# El directorio home NO debe tener permisos de escritura para "otros"
sudo chown nobody:nogroup /home/ftpuser
sudo chmod 555 /home/ftpuser

# El subdirectorio de archivos SI tiene permisos de escritura
sudo chown ftpuser:ftpuser /home/ftpuser/archivos
sudo chmod 755 /home/ftpuser/archivos

# Agregar /usr/sbin/nologin a las shells validas para FTP
echo "/usr/sbin/nologin" | sudo tee -a /etc/shells
```

**Explicacion:**
- `adduser --home /home/ftpuser`: Crea un usuario con un directorio home especifico.
- `--shell /usr/sbin/nologin`: Asigna un shell que impide el inicio de sesion SSH/terminal. El usuario solo puede usar FTP.
- `tee -a /etc/vsftpd.userlist`: Agrega el nombre del usuario al archivo de lista blanca (`-a` = append).
- **Estructura de permisos**:
  - `/home/ftpuser` con `555` y propietario `nobody:nogroup`: El directorio raiz del chroot NO puede ser escribible por el usuario (requisito de seguridad de vsftpd).
  - `/home/ftpuser/archivos` con `755` y propietario `ftpuser:ftpuser`: Subdirectorio donde el usuario puede subir y descargar archivos.
- `/etc/shells`: vsftpd verifica que el shell del usuario este en este archivo. Al agregar `/usr/sbin/nologin`, se permite FTP sin permitir SSH.

### 2.4 Configurar el firewall (UFW)

```bash
# Permitir el puerto de control FTP
sudo ufw allow 21/tcp

# Permitir el rango de puertos pasivos
sudo ufw allow 40000:40100/tcp

# Verificar las reglas del firewall
sudo ufw status
```

**Explicacion:**
- `ufw allow 21/tcp`: Abre el puerto 21 TCP para el canal de control FTP.
- `ufw allow 40000:40100/tcp`: Abre el rango de puertos para el modo pasivo. Debe coincidir con `pasv_min_port` y `pasv_max_port` del archivo de configuracion.
- `ufw status`: Muestra todas las reglas activas del firewall.

### 2.5 Reinicio y verificacion del servicio

```bash
# Reiniciar el servicio para aplicar cambios
sudo systemctl restart vsftpd

# Habilitar inicio automatico con el sistema
sudo systemctl enable vsftpd

# Verificar el estado del servicio
sudo systemctl status vsftpd

# Verificar que el puerto 21 esta escuchando
sudo ss -tlnp | grep :21

# Probar la conexion localmente
ftp localhost

# Ver los logs de FTP
sudo tail -f /var/log/vsftpd.log
```

**Explicacion:**
- `systemctl restart vsftpd`: Reinicia el servicio aplicando todos los cambios de configuracion.
- `systemctl enable vsftpd`: Configura el inicio automatico al arrancar el sistema.
- `ss -tlnp | grep :21`: Muestra los sockets TCP escuchando (`-t`) en formato numerico (`-n`) con el proceso asociado (`-p`). Filtra por el puerto 21.
- `tail -f /var/log/vsftpd.log`: Muestra en tiempo real las ultimas lineas del log de FTP. El flag `-f` (follow) actualiza la salida conforme se agregan nuevas lineas.

---

## 3. Comandos FTP basicos del cliente

| Comando | Descripcion |
|---------|-------------|
| `ftp servidor` | Conectar al servidor FTP |
| `ls` o `dir` | Listar archivos del directorio remoto |
| `cd directorio` | Cambiar de directorio en el servidor |
| `get archivo` | Descargar un archivo del servidor |
| `put archivo` | Subir un archivo al servidor |
| `mget *.txt` | Descargar multiples archivos |
| `mput *.txt` | Subir multiples archivos |
| `mkdir nombre` | Crear un directorio en el servidor |
| `delete archivo` | Eliminar un archivo del servidor |
| `bye` o `quit` | Cerrar la conexion |

## 4. Puertos utilizados

- **TCP 21**: Canal de control (comandos y respuestas).
- **TCP 20**: Canal de datos en modo activo.
- **TCP 40000-40100** (configurable): Rango del canal de datos en modo pasivo.
