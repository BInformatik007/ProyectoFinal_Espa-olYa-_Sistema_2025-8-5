# LP_Esp = Last Project Español

    *** PASOS PARA CLONAR EL REPOSITORIO CON SSH (RECOMENDADO) ***
    *** LO QUE ESTÉ DENTRO DE COMILLAS Y CON ESPACIOS (" ejemplo ") ES LO QUE DEBEN ESCRIBIR, SIN LAS COMILLAS NI LOS ESPACIOS OBVIAMENTE ***

1. Primero verifica si tienes instalado el Git. Esto lo haces en la terminal con:
    " git --version "

Si no lo tienes descargado, descárgalo en " https://git-scm.com/ ".

2. Abre el Git Bash dentro de la carpeta donde tendrás el poryecto guardado:
    Ve a la carpeta y dale click derecho (si estás en w11 dale a "Mostrar más opciones") y haz click donde diga Git Bash. Y dentro de la terminal debería aparecer la dirección de la carpeta que es donde ejecutarás todos los comandos.

    *** A PARTIR DE AQUÍ TODO SE HARÁ DENTRO DE LA TERMINAL DE GIT BASH HASTA NUEVO AVISO ***

3. Genera uan clave SSH con tu computadora:
    Puedes comprobar si ya tienes una con: " ls ~/.ssh "
    Si ves archivos como id_ed25519 y id_ed25519.pub, quiere decir que ya tienes una clave.
    
Si no cuentas con una clave, créala con:
    "ssh-keygen -t ed25519 -C " tu_correo@ejemplo.com" "
    Presiona "ENTER" en todas las preguntas para dejar los valores por defecto.

4. Agrega la clave al agente SSH para que el sistema recuerde la clave y no te la pida siempre que quieras hacer una acción.
    " eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_ed25519 "

5. Agrega la clave pública a tu cuenta de GitHub:
    " clip < ~/.ssh/id_ed25519.pub " (Al ejecutar este comando en el bash de git se copiará en el portapapeles automáticamente la clave que generó la computadora).

Luego ve a: " https://github.com/settings/keys ", haz clic en "New SSH key", en el título le pones el nombre que quieras a la llave y debajo donde dice "Key" pegan la clave que se copió con el comando anterior y por último la agregas.

6. Probar la conexión SSH con GitHub:
    " ssh -T git@github.com "
    Si funcionó se verá algo como "Hi user! You've successfully authenticated..."

7. Clonar el repositorio:
    En el link del repositorio " https://github.com/BInformatik007/LP_Esp " en GitHub, haz clic donde dice "Code", "Local", "SSH" y copia el link SSH que aparece. Una vez copiado vuelve al bash de Git y escribe:
    " git clone (El link que copiaste) "

    *** CÓMO HACER "PUSH" O SUBIR CAMBIOS AL REPOSITORIO DE GITHUB ***
    *** A PARTIR DE AHORA LOS COMANDOS SE HARÁN EN LA TERMINAL DE VSC ***

1. Luego de hacer algún cambio en la carpeta o archivo escribir:
    " git add . " (el punto se refiere a que hará el push con la carpeta completa y no con un archivo en específico. En el caso que quieras agregar uno en específico sería " git add archivo.txt ").

2. Luego haz un commit (OBLIGATORIO):
    " git commit -m "Ejemplo: Agregué la sección de login con validación" "
    
3. Haz el push al repositorio:
    " git push origin main "