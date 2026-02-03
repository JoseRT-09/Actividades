# Servicio DHCP - Explicacion de Scripts de Configuracion

## Que es DHCP?

**DHCP (Dynamic Host Configuration Protocol)** es un protocolo de red que permite a los dispositivos obtener automaticamente una direccion IP y otros parametros de configuracion de red (mascara de subred, puerta de enlace, servidores DNS) sin necesidad de configuracion manual.

---

## 1. Configuracion en Windows Server

### 1.1 Instalacion del rol DHCP mediante PowerShell

```powershell
# Instalar el rol de servidor DHCP
Install-WindowsFeature -Name DHCP -IncludeManagementTools
```

**Explicacion linea por linea:**
- `Install-WindowsFeature`: Cmdlet de PowerShell que instala roles y caracteristicas en Windows Server.
- `-Name DHCP`: Especifica que el rol a instalar es el servicio DHCP.
- `-IncludeManagementTools`: Incluye las herramientas de administracion grafica (consola DHCP) y de linea de comandos.

### 1.2 Configuracion post-instalacion

```powershell
# Autorizar el servidor DHCP en Active Directory
Add-DhcpServerInDC -DnsName "servidor.midominio.local" -IPAddress 192.168.1.1

# Notificar que la configuracion post-instalacion esta completa
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\ServerManager\Roles\12" -Name "ConfigurationState" -Value 2
```

**Explicacion:**
- `Add-DhcpServerInDC`: Registra y autoriza el servidor DHCP en Active Directory. Esto es obligatorio en entornos de dominio para evitar servidores DHCP no autorizados (rogue DHCP).
  - `-DnsName`: Nombre FQDN del servidor DHCP.
  - `-IPAddress`: Direccion IP del servidor DHCP.
- `Set-ItemProperty`: Modifica el registro de Windows para indicar al Server Manager que la configuracion post-instalacion ha finalizado. El valor `2` significa "configuracion completa".

### 1.3 Creacion de un ambito (scope) DHCP

```powershell
# Crear un nuevo ambito DHCP
Add-DhcpServerv4Scope -Name "Red Local" `
    -StartRange 192.168.1.100 `
    -EndRange 192.168.1.200 `
    -SubnetMask 255.255.255.0 `
    -State Active `
    -LeaseDuration 8.00:00:00
```

**Explicacion:**
- `Add-DhcpServerv4Scope`: Crea un nuevo ambito (rango de direcciones IP) para IPv4.
  - `-Name "Red Local"`: Nombre descriptivo del ambito.
  - `-StartRange 192.168.1.100`: Primera direccion IP disponible del rango.
  - `-EndRange 192.168.1.200`: Ultima direccion IP disponible del rango. En total se tendran 101 direcciones disponibles (de .100 a .200).
  - `-SubnetMask 255.255.255.0`: Mascara de subred /24, define que los primeros 3 octetos son la parte de red.
  - `-State Active`: Activa el ambito inmediatamente para comenzar a asignar direcciones.
  - `-LeaseDuration 8.00:00:00`: Tiempo de concesion de 8 dias. Despues de este tiempo, el cliente debe renovar su direccion IP.

### 1.4 Configuracion de opciones del ambito

```powershell
# Configurar la puerta de enlace predeterminada (opcion 003)
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -Router 192.168.1.1

# Configurar los servidores DNS (opcion 006)
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -DnsServer 192.168.1.1, 8.8.8.8

# Configurar el nombre de dominio DNS (opcion 015)
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -DnsDomain "midominio.local"
```

**Explicacion:**
- `Set-DhcpServerv4OptionValue`: Configura las opciones DHCP que se envian a los clientes junto con la IP.
  - `-ScopeId 192.168.1.0`: Identifica el ambito al que se aplican las opciones (la direccion de red).
  - `-Router 192.168.1.1`: **Opcion 003** - Puerta de enlace predeterminada. Los clientes usaran esta IP como gateway para salir a otras redes.
  - `-DnsServer 192.168.1.1, 8.8.8.8`: **Opcion 006** - Servidores DNS que usaran los clientes. Se definen dos: el local y el de Google como respaldo.
  - `-DnsDomain "midominio.local"`: **Opcion 015** - Sufijo DNS que se agrega automaticamente a las consultas de nombre.

### 1.5 Exclusiones y reservaciones

```powershell
# Excluir un rango de direcciones (para servidores, impresoras, etc.)
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.1.0 `
    -StartRange 192.168.1.100 `
    -EndRange 192.168.1.110

# Crear una reservacion para un dispositivo especifico
Add-DhcpServerv4Reservation -ScopeId 192.168.1.0 `
    -IPAddress 192.168.1.150 `
    -ClientId "AA-BB-CC-DD-EE-FF" `
    -Name "Impresora-Oficina" `
    -Description "Impresora HP del area de oficina"
```

**Explicacion:**
- `Add-DhcpServerv4ExclusionRange`: Excluye un subrango de IPs del ambito. Estas direcciones NO seran asignadas automaticamente. Util para reservar IPs para equipos con IP estatica.
- `Add-DhcpServerv4Reservation`: Crea una reservacion que garantiza que un dispositivo especifico siempre reciba la misma IP.
  - `-ClientId "AA-BB-CC-DD-EE-FF"`: Direccion MAC del dispositivo. El servidor identifica al cliente por su MAC.
  - `-Name`: Nombre descriptivo de la reservacion.

### 1.6 Verificacion del servicio

```powershell
# Verificar el estado del servicio DHCP
Get-Service -Name DHCPServer

# Ver los ambitos configurados
Get-DhcpServerv4Scope

# Ver las concesiones activas
Get-DhcpServerv4Lease -ScopeId 192.168.1.0

# Ver estadisticas del ambito
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.1.0
```

**Explicacion:**
- `Get-Service -Name DHCPServer`: Muestra si el servicio DHCP esta en ejecucion (Running), detenido (Stopped) o deshabilitado.
- `Get-DhcpServerv4Scope`: Lista todos los ambitos configurados con su estado, rango y mascara.
- `Get-DhcpServerv4Lease`: Muestra las direcciones IP actualmente asignadas a clientes, incluyendo MAC, nombre de host y tiempo de concesion restante.
- `Get-DhcpServerv4ScopeStatistics`: Muestra estadisticas como IPs en uso, IPs disponibles y porcentaje de utilizacion.

---

## 2. Configuracion en Ubuntu Server

### 2.1 Instalacion del servidor DHCP

```bash
# Actualizar repositorios e instalar el servidor DHCP (ISC DHCP)
sudo apt update
sudo apt install -y isc-dhcp-server
```

**Explicacion:**
- `sudo apt update`: Actualiza la lista de paquetes disponibles desde los repositorios configurados.
- `sudo apt install -y isc-dhcp-server`: Instala el paquete ISC DHCP Server. El flag `-y` confirma automaticamente la instalacion sin pedir interaccion del usuario.
  - **ISC DHCP** es la implementacion mas utilizada de servidor DHCP en Linux, mantenida por el Internet Systems Consortium.

### 2.2 Configuracion de la interfaz de red

```bash
# Editar el archivo de configuracion de la interfaz del servidor DHCP
sudo nano /etc/default/isc-dhcp-server
```

Contenido del archivo:

```
# Especificar la interfaz de red donde el servidor DHCP escuchara peticiones
INTERFACESv4="enp0s3"
INTERFACESv6=""
```

**Explicacion:**
- `INTERFACESv4="enp0s3"`: Define en que interfaz de red el servidor DHCP escuchara solicitudes. `enp0s3` es el nombre tipico de la primera interfaz Ethernet en sistemas con nomenclatura predecible.
- `INTERFACESv6=""`: Se deja vacio porque no se configura DHCPv6 en este caso.
- Es fundamental que la interfaz especificada tenga una **IP estatica** configurada dentro de la misma subred que el ambito DHCP.

### 2.3 Configuracion principal del servidor DHCP

```bash
# Editar el archivo principal de configuracion
sudo nano /etc/dhcp/dhcpd.conf
```

Contenido del archivo:

```conf
# Configuracion global del servidor DHCP

# Tiempo de concesion predeterminado (en segundos) = 600s = 10 minutos
default-lease-time 600;

# Tiempo maximo de concesion (en segundos) = 7200s = 2 horas
max-lease-time 7200;

# El servidor DHCP es autoritativo para esta subred
# Esto significa que si un cliente solicita una IP que no pertenece
# a esta red, el servidor le enviara un DHCPNAK
authoritative;

# Definicion de la subred y el rango de direcciones
subnet 192.168.1.0 netmask 255.255.255.0 {

    # Rango de direcciones IP a asignar
    range 192.168.1.100 192.168.1.200;

    # Puerta de enlace predeterminada (opcion routers)
    option routers 192.168.1.1;

    # Servidores DNS
    option domain-name-servers 192.168.1.1, 8.8.8.8;

    # Nombre de dominio
    option domain-name "midominio.local";

    # Mascara de subred
    option subnet-mask 255.255.255.0;

    # Direccion de broadcast
    option broadcast-address 192.168.1.255;
}

# Reservacion de IP para un dispositivo especifico
host impresora-oficina {
    hardware ethernet AA:BB:CC:DD:EE:FF;
    fixed-address 192.168.1.150;
}
```

**Explicacion detallada de cada directiva:**

| Directiva | Descripcion |
|-----------|-------------|
| `default-lease-time 600` | Tiempo por defecto que un cliente puede mantener la IP asignada (10 minutos). Si el cliente no solicita un tiempo especifico, se usa este valor. |
| `max-lease-time 7200` | Tiempo maximo que se permite una concesion (2 horas). Aunque el cliente solicite mas tiempo, no se le concedera mas de este valor. |
| `authoritative` | Declara que este servidor es la autoridad DHCP de la red. Rechazara solicitudes de IPs que no pertenezcan a los rangos configurados. |
| `subnet ... netmask` | Define la subred para la cual se asignaran IPs. Debe coincidir con la configuracion de red de la interfaz. |
| `range` | Rango de IPs disponibles para asignacion dinamica (101 direcciones). |
| `option routers` | Gateway predeterminado que recibiran los clientes. |
| `option domain-name-servers` | Servidores DNS separados por coma. |
| `option domain-name` | Sufijo de dominio DNS para los clientes. |
| `option subnet-mask` | Mascara de subred para los clientes. |
| `option broadcast-address` | Direccion de difusion de la red. |
| `host impresora-oficina` | Bloque de reservacion: asigna siempre la misma IP a un dispositivo identificado por su MAC (`hardware ethernet`). |

### 2.4 Reinicio y verificacion del servicio

```bash
# Reiniciar el servicio DHCP para aplicar cambios
sudo systemctl restart isc-dhcp-server

# Habilitar el servicio para que inicie con el sistema
sudo systemctl enable isc-dhcp-server

# Verificar el estado del servicio
sudo systemctl status isc-dhcp-server

# Ver las concesiones activas
cat /var/lib/dhcp/dhcpd.leases

# Verificar la configuracion en busca de errores de sintaxis
sudo dhcpd -t -cf /etc/dhcp/dhcpd.conf
```

**Explicacion:**
- `systemctl restart isc-dhcp-server`: Detiene y reinicia el servicio DHCP, aplicando todos los cambios del archivo de configuracion.
- `systemctl enable isc-dhcp-server`: Configura el servicio para arranque automatico al iniciar el sistema.
- `systemctl status isc-dhcp-server`: Muestra el estado actual: activo/inactivo, PID del proceso, ultimos mensajes del log.
- `/var/lib/dhcp/dhcpd.leases`: Archivo donde se almacenan todas las concesiones activas. Muestra IP asignada, MAC del cliente, tiempo de inicio y fin de la concesion.
- `dhcpd -t -cf`: Verifica la sintaxis del archivo de configuracion sin iniciar el servicio. El flag `-t` activa el modo de prueba.

---

## 3. Proceso DORA (Funcionamiento del protocolo)

El proceso de asignacion DHCP sigue 4 pasos conocidos como **DORA**:

1. **Discover (Descubrimiento)**: El cliente envia un broadcast buscando servidores DHCP en la red.
2. **Offer (Oferta)**: El servidor DHCP responde ofreciendo una direccion IP disponible.
3. **Request (Solicitud)**: El cliente acepta la oferta y solicita formalmente la IP.
4. **Acknowledge (Confirmacion)**: El servidor confirma la asignacion y envia los parametros de red.

Este proceso ocurre en los puertos **UDP 67** (servidor) y **UDP 68** (cliente).
