# Tutos

## Comment se connecter avec VSCode en SSH sur la machine AWS

### Prérequis

- Installer VSCode
  - Avoir l'extension Remote-SSH de VSCode  
- Avoir le fichier .pem de la machine AWS

### Comment faire ?

- Se connecter au moins une fois avec votre client SSH pour ajouter l'host au fichier config `~/.ssh/config`
  Commande : `ssh -i "<mon fichier>.pem" ec2-user@<mon ip>`
  le fichier config devrait contenir quelque chose comme ça

```bash
...

Host <mon ip>
  HostName <mon ip>
  User ec2-user

...
```

- Modifier le fichier `~/.ssh/config` pour ajouter l'attribut `IdentiyFile` avec le chemin vers votre fichier .pem

```bash
Host <mon ip>
  HostName <mon ip>
  User ec2-user
  IdentityFile "chemin\vers\<mon fichier>.pem"
```

- Ouvrir VSCode

- Cliquer sur `Explorateur distant` dans la barre de gauche

- Au niveau de `SSH` cliquer sur `+`

- Entrez `ssh ec2-user@<mon ip>`

- Choisissez le premier choix puis `linux`

- Vous êtes connecté !
