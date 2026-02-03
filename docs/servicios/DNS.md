# Servicio DNS - Explicacion de Scripts de Configuracion

## Que es DNS?

**DNS (Domain Name System)** es el sistema que traduce nombres de dominio legibles (como `www.ejemplo.com`) a direcciones IP numericas (como `192.168.1.10`) y viceversa. Funciona como la "guia telefonica" de Internet y las redes locales.

### Tipos de registros DNS principales

| Registro | Funcion |
|----------|---------|
| **A** | Asocia un nombre de dominio a una direccion IPv4 |
| **AAAA** | Asocia un nombre de dominio a una direccion IPv6 |
| **CNAME** | Crea un alias que apunta a otro nombre de dominio |
| **MX** | Define el servidor de correo del dominio |
| **NS** | Indica los servidores de nombres autoritativos |
| **PTR** | Resolucion inversa: de IP a nombre (zona inversa) |
| **SOA** | Registro de autoridad: informacion principal de la zona |

---

## 1. Configuracion en Windows Server

### 1.1 Instalacion del rol DNS mediante PowerShell

```powershell
# Instalar el rol de servidor DNS con herramientas de administracion
Install-WindowsFeature -Name DNS -IncludeManagementTools
```

**Explicacion:**
- `Install-WindowsFeature`: Cmdlet que instala roles del servidor.
- `-Name DNS`: Especifica el rol de servidor DNS.
- `-IncludeManagementTools`: Instala la consola de administracion DNS (`dnsmgmt.msc`) y las herramientas de linea de comandos (`dnscmd`, modulos PowerShell).

### 1.2 Creacion de una zona de busqueda directa (Forward Lookup Zone)

```powershell
# Crear una zona de busqueda directa primaria
Add-DnsServerPrimaryZone -Name "midominio.local" `
    -ZoneFile "midominio.local.dns" `
    -DynamicUpdate None
```

**Explicacion:**
- `Add-DnsServerPrimaryZone`: Crea una nueva zona DNS primaria. Una zona primaria contiene la copia original de lectura/escritura de los registros DNS.
  - `-Name "midominio.local"`: Nombre del dominio que administrara esta zona. Todas las consultas para `*.midominio.local` seran resueltas por esta zona.
  - `-ZoneFile "midominio.local.dns"`: Nombre del archivo donde se almacenaran los registros de la zona en disco (`C:\Windows\System32\dns\`).
  - `-DynamicUpdate None`: Desactiva las actualizaciones dinamicas. Los registros solo pueden ser creados manualmente. Las opciones son:
    - `None`: Sin actualizacion dinamica.
    - `Secure`: Solo actualizaciones autenticadas (requiere Active Directory).
    - `NonsecureAndSecure`: Permite actualizaciones sin autenticacion (menos seguro).

### 1.3 Creacion de una zona de busqueda inversa (Reverse Lookup Zone)

```powershell
# Crear una zona de busqueda inversa para la red 192.168.1.0/24
Add-DnsServerPrimaryZone -NetworkId "192.168.1.0/24" `
    -ZoneFile "1.168.192.in-addr.arpa.dns" `
    -DynamicUpdate None
```

**Explicacion:**
- La zona inversa permite resolver de IP a nombre (registro PTR). Es el proceso contrario a la zona directa.
- `-NetworkId "192.168.1.0/24"`: Define la subred de la zona inversa. El `/24` indica la mascara de 24 bits (255.255.255.0).
- `-ZoneFile "1.168.192.in-addr.arpa.dns"`: Nombre del archivo de zona. La notacion `in-addr.arpa` es el estandar DNS para zonas inversas. Los octetos de la red se escriben en orden inverso (1.168.192 en lugar de 192.168.1).

### 1.4 Agregar registros DNS

```powershell
# Registro A: asocia un nombre a una IPv4
Add-DnsServerResourceRecordA -ZoneName "midominio.local" `
    -Name "servidor" `
    -IPv4Address "192.168.1.10"

# Registro A para el servidor web
Add-DnsServerResourceRecordA -ZoneName "midominio.local" `
    -Name "www" `
    -IPv4Address "192.168.1.20"

# Registro CNAME: crear un alias
Add-DnsServerResourceRecordCName -ZoneName "midominio.local" `
    -Name "ftp" `
    -HostNameAlias "servidor.midominio.local"

# Registro MX: servidor de correo
Add-DnsServerResourceRecordMX -ZoneName "midominio.local" `
    -Name "." `
    -MailExchange "correo.midominio.local" `
    -Preference 10

# Registro PTR: resolucion inversa
Add-DnsServerResourceRecordPtr -ZoneName "1.168.192.in-addr.arpa" `
    -Name "10" `
    -PtrDomainName "servidor.midominio.local"
```

**Explicacion detallada de cada registro:**

- **Registro A** (`Add-DnsServerResourceRecordA`):
  - `-ZoneName`: Zona donde se crea el registro.
  - `-Name "servidor"`: El nombre del host. El FQDN resultante sera `servidor.midominio.local`.
  - `-IPv4Address`: La direccion IP que se devolvera al consultar este nombre.

- **Registro CNAME** (`Add-DnsServerResourceRecordCName`):
  - `-Name "ftp"`: El alias que se esta creando.
  - `-HostNameAlias`: El nombre real (canonico) al que apunta el alias. `ftp.midominio.local` resolvera a la misma IP que `servidor.midominio.local`.

- **Registro MX** (`Add-DnsServerResourceRecordMX`):
  - `-Name "."`: El punto indica la raiz de la zona (el dominio mismo).
  - `-MailExchange`: Servidor que recibira el correo del dominio.
  - `-Preference 10`: Prioridad del servidor de correo. Menor numero = mayor prioridad. Si hay multiples servidores MX, el correo se envia primero al de menor preferencia.

- **Registro PTR** (`Add-DnsServerResourceRecordPtr`):
  - `-Name "10"`: El ultimo octeto de la IP (192.168.1.**10**).
  - `-PtrDomainName`: El nombre de dominio que corresponde a esa IP.

### 1.5 Configurar reenviadores (Forwarders)

```powershell
# Configurar reenviadores DNS para consultas externas
Set-DnsServerForwarder -IPAddress "8.8.8.8", "8.8.4.4"
```

**Explicacion:**
- `Set-DnsServerForwarder`: Configura los servidores DNS a los cuales se reenvian las consultas que el servidor local no puede resolver.
- `-IPAddress "8.8.8.8", "8.8.4.4"`: Servidores DNS publicos de Google. Cuando un cliente consulte un dominio externo (ej. `google.com`), el servidor local reenviara la consulta a estos servidores.
- Sin reenviadores, el servidor tendria que realizar la resolucion recursiva completa desde los servidores raiz.

### 1.6 Verificacion del servicio

```powershell
# Verificar el estado del servicio DNS
Get-Service -Name DNS

# Listar todas las zonas configuradas
Get-DnsServerZone

# Ver los registros de una zona especifica
Get-DnsServerResourceRecord -ZoneName "midominio.local"

# Probar la resolucion de nombres
Resolve-DnsName -Name "servidor.midominio.local" -Server 192.168.1.10

# Probar resolucion inversa
Resolve-DnsName -Name "192.168.1.10" -Type PTR -Server 192.168.1.10
```

**Explicacion:**
- `Get-DnsServerZone`: Muestra todas las zonas (directas e inversas) con su tipo (primaria, secundaria, stub) y estado.
- `Get-DnsServerResourceRecord`: Lista todos los registros de una zona (A, CNAME, MX, NS, SOA, etc.).
- `Resolve-DnsName`: Herramienta de prueba que consulta un servidor DNS especifico. Equivalente a `nslookup` pero mas detallado.
  - `-Type PTR`: Fuerza una consulta de resolucion inversa.

---

## 2. Configuracion en Ubuntu Server

### 2.1 Instalacion del servidor DNS (BIND9)

```bash
# Actualizar repositorios e instalar BIND9
sudo apt update
sudo apt install -y bind9 bind9utils bind9-doc dnsutils
```

**Explicacion:**
- `bind9`: El servidor DNS mas utilizado en Internet, desarrollado por ISC (Internet Systems Consortium).
- `bind9utils`: Utilidades adicionales como `named-checkconf` y `named-checkzone` para verificacion de configuracion.
- `bind9-doc`: Documentacion de BIND9.
- `dnsutils`: Herramientas de consulta DNS como `dig`, `nslookup` y `host`.

### 2.2 Configuracion principal de BIND9

```bash
# Editar el archivo de opciones principales
sudo nano /etc/bind/named.conf.options
```

Contenido:

```conf
options {
    # Directorio de trabajo de BIND
    directory "/var/cache/bind";

    # Reenviadores: servidores DNS a los que se reenvian
    # las consultas que este servidor no puede resolver
    forwarders {
        8.8.8.8;
        8.8.4.4;
    };

    # Permitir consultas desde la red local
    allow-query { localhost; 192.168.1.0/24; };

    # Permitir consultas recursivas
    recursion yes;

    # Escuchar en la direccion IP del servidor
    listen-on { 127.0.0.1; 192.168.1.10; };

    # Desactivar transferencias de zona (seguridad)
    allow-transfer { none; };

    # Validacion DNSSEC
    dnssec-validation auto;
};
```

**Explicacion de cada directiva:**

| Directiva | Descripcion |
|-----------|-------------|
| `directory` | Directorio donde BIND almacena archivos de cache y datos temporales. |
| `forwarders` | Servidores DNS externos a los cuales se reenvian consultas no resolubles localmente. Similar a los reenviadores de Windows DNS. |
| `allow-query` | Lista de control de acceso (ACL) que define quien puede hacer consultas al servidor. `localhost` permite consultas locales, `192.168.1.0/24` permite toda la red local. |
| `recursion yes` | Habilita la resolucion recursiva. El servidor resolverara completamente las consultas en nombre de los clientes, no solo devolvera referencias. |
| `listen-on` | Direcciones IP en las que BIND escucha peticiones. `127.0.0.1` para consultas locales y la IP del servidor para la red. |
| `allow-transfer { none; }` | Desactiva las transferencias de zona. Esto impide que otros servidores copien los registros DNS, lo cual es una medida de seguridad importante. |
| `dnssec-validation auto` | Habilita la validacion DNSSEC automatica para proteger contra envenenamiento de cache DNS. |

### 2.3 Declaracion de zonas

```bash
# Editar el archivo de declaracion de zonas
sudo nano /etc/bind/named.conf.local
```

Contenido:

```conf
// Zona de busqueda directa
zone "midominio.local" {
    type master;
    file "/etc/bind/zones/db.midominio.local";
};

// Zona de busqueda inversa para 192.168.1.0/24
zone "1.168.192.in-addr.arpa" {
    type master;
    file "/etc/bind/zones/db.192.168.1";
};
```

**Explicacion:**
- `zone "midominio.local"`: Declara la zona de busqueda directa (nombre a IP).
  - `type master`: Este servidor es el maestro (primario) de la zona. Contiene la copia original y de lectura/escritura de los registros.
  - `file`: Ruta al archivo que contiene los registros DNS de esta zona.
- `zone "1.168.192.in-addr.arpa"`: Declara la zona de busqueda inversa (IP a nombre).
  - La notacion `in-addr.arpa` invierte los octetos de la red. Para la red `192.168.1.0`, se escribe `1.168.192.in-addr.arpa`.

### 2.4 Archivo de zona directa

```bash
# Crear el directorio de zonas y el archivo de zona directa
sudo mkdir -p /etc/bind/zones
sudo nano /etc/bind/zones/db.midominio.local
```

Contenido:

```conf
;
; Archivo de zona directa para midominio.local
;
$TTL    604800

; Registro SOA (Start of Authority)
; Define la informacion principal de la zona
@   IN  SOA servidor.midominio.local. admin.midominio.local. (
            2024010101  ; Serial (formato: AAAAMMDDnn)
            3600        ; Refresh (1 hora)
            1800        ; Retry (30 minutos)
            604800      ; Expire (7 dias)
            86400 )     ; Negative Cache TTL (1 dia)

; Registros NS (Name Server)
; Definen los servidores de nombres autoritativos
@       IN  NS  servidor.midominio.local.

; Registros A (Address)
; Asocian nombres a direcciones IPv4
servidor    IN  A   192.168.1.10
www         IN  A   192.168.1.20
correo      IN  A   192.168.1.30

; Registros CNAME (Canonical Name / Alias)
ftp         IN  CNAME   servidor.midominio.local.

; Registros MX (Mail Exchange)
@           IN  MX  10  correo.midominio.local.
```

**Explicacion detallada:**

- **`$TTL 604800`**: Time To Live predeterminado (7 dias en segundos). Indica cuanto tiempo otros servidores DNS pueden cachear los registros de esta zona antes de volver a consultarlos.

- **Registro SOA** (Start of Authority):
  - `@`: Simbolo que representa la raiz de la zona (`midominio.local`).
  - `IN`: Clase Internet (la unica clase utilizada en la practica).
  - `servidor.midominio.local.`: Servidor DNS primario de la zona. El punto final es obligatorio e indica un FQDN absoluto.
  - `admin.midominio.local.`: Correo del administrador. El primer punto reemplaza la `@` (equivale a `admin@midominio.local`).
  - `Serial (2024010101)`: Numero de serie de la zona. Formato recomendado: `AAAAMMDDnn`. Debe incrementarse con CADA cambio para que los servidores secundarios detecten actualizaciones.
  - `Refresh (3600)`: Cada cuanto tiempo un servidor secundario verifica si hay actualizaciones (1 hora).
  - `Retry (1800)`: Si el refresh falla, cuanto tiempo espera antes de reintentar (30 minutos).
  - `Expire (604800)`: Si un secundario no puede contactar al primario durante este tiempo, deja de responder consultas (7 dias).
  - `Negative Cache TTL (86400)`: Tiempo que se cachean las respuestas negativas (NXDOMAIN - dominio no existe) (1 dia).

- **Registro NS**: Define que `servidor.midominio.local` es el servidor de nombres autoritativo para esta zona.

- **Registros A**: Cada linea asocia un nombre de host con una IP. El nombre es relativo a la zona (ej. `www` se convierte en `www.midominio.local`).

- **Registro CNAME**: `ftp.midominio.local` es un alias que apunta a `servidor.midominio.local`. El destino DEBE ser un FQDN terminado en punto.

- **Registro MX**: `10` es la prioridad. El correo para `midominio.local` se enviara a `correo.midominio.local`.

### 2.5 Archivo de zona inversa

```bash
sudo nano /etc/bind/zones/db.192.168.1
```

Contenido:

```conf
;
; Archivo de zona inversa para la red 192.168.1.0/24
;
$TTL    604800

@   IN  SOA servidor.midominio.local. admin.midominio.local. (
            2024010101  ; Serial
            3600        ; Refresh
            1800        ; Retry
            604800      ; Expire
            86400 )     ; Negative Cache TTL

; Servidor de nombres
@       IN  NS  servidor.midominio.local.

; Registros PTR (Pointer) - Resolucion inversa
10      IN  PTR servidor.midominio.local.
20      IN  PTR www.midominio.local.
30      IN  PTR correo.midominio.local.
```

**Explicacion:**
- Los **registros PTR** hacen el mapeo inverso: de IP a nombre.
- `10 IN PTR servidor.midominio.local.`: El numero `10` es el ultimo octeto de la IP (192.168.1.**10**). Cuando alguien consulte la IP 192.168.1.10, obtendra el nombre `servidor.midominio.local`.
- Cada registro PTR debe tener un registro A correspondiente en la zona directa para mantener consistencia.

### 2.6 Verificacion y reinicio del servicio

```bash
# Verificar la sintaxis de la configuracion principal
sudo named-checkconf

# Verificar la sintaxis del archivo de zona directa
sudo named-checkzone midominio.local /etc/bind/zones/db.midominio.local

# Verificar la sintaxis del archivo de zona inversa
sudo named-checkzone 1.168.192.in-addr.arpa /etc/bind/zones/db.192.168.1

# Reiniciar el servicio BIND9
sudo systemctl restart bind9

# Habilitar el servicio para inicio automatico
sudo systemctl enable bind9

# Verificar el estado del servicio
sudo systemctl status bind9

# Probar la resolucion directa
dig @192.168.1.10 servidor.midominio.local

# Probar la resolucion inversa
dig @192.168.1.10 -x 192.168.1.10

# Prueba con nslookup
nslookup servidor.midominio.local 192.168.1.10
```

**Explicacion:**
- `named-checkconf`: Verifica la sintaxis de `named.conf` y sus archivos incluidos. Si no muestra salida, la configuracion es correcta.
- `named-checkzone`: Verifica la sintaxis y consistencia de un archivo de zona. Reporta errores como registros mal formados o seriales incorrectos.
- `dig @192.168.1.10`: Herramienta de consulta DNS. El `@` especifica que servidor DNS usar.
  - `-x`: Indica una consulta de resolucion inversa (PTR).
- `nslookup`: Herramienta alternativa de consulta DNS, mas simple que `dig`.

---

## 3. Flujo de resolucion DNS

```
Cliente solicita: www.midominio.local
         |
         v
Servidor DNS Local (192.168.1.10)
         |
    Tiene la zona "midominio.local"?
         |
    SI ---> Busca registro A para "www"
         |      -> Responde: 192.168.1.20
         |
    NO ---> Reenvia a forwarders (8.8.8.8)
               -> Google DNS resuelve y responde
```

## 4. Puertos utilizados

- **TCP/UDP 53**: Puerto estandar del servicio DNS.
  - **UDP 53**: Consultas normales (la mayoria del trafico DNS).
  - **TCP 53**: Transferencias de zona y respuestas mayores a 512 bytes.
