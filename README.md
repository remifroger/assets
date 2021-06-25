# assets-dataudiar

Package comportant des modules réutilisables pour les applications web

## Installation

Téléchargez la dernière release disponible, puis placez-la par exemple dans C:/apps/local-modules puis lancez :

```
cd C:/apps/local-modules/assets-dataudiar
npm install
```

## Utilisation du package

Comment utiliser les fonctionnalités du package dans une application

### Pré-requis : dépendance jQuery + plugin bootstrap-select

Plugin bootstrap-select : https://developer.snapappointments.com/bootstrap-select/

jQuery est requis pour certains modules JavaScript (dossier /js) : 
- chart-operations.js : ChartVisualization.filterChartData() (class method) **+ bootstrap-select**
- exports.js : printDomElement()
- map-analysis.js : MapAnalysis.buildStyle() (class method)
- navigation.js : bootstrapToolsActivate()
- user-interaction.js : listeTerritoires() **+ bootstrap-select**

Pour éviter tout problème, importez jQuery et les dépendances de votre côté ; au niveau de votre application dans votre fichier d'entrée JavaScript principal, par exemple `index.js` (C:/apps/my-app/src/client/js/index.js), importez ces modules :

```js
import './wrapper/import-jquery.js'
import 'jquery-ui-dist/jquery-ui.min.js'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'
```

Ensuite vous pouvez utiliser le package à votre guise, par exemple :

```js
import { scrollToTop } from 'assets-dataudiar/js/navigation.js'
scrollToTop("#id")
```

### En local

Au niveau de votre application (dans laquelle vous souhaitez utiliser ce package local), par exemple dans C:/apps/my-app, installez le package :

```
cd C:/apps/my-app
npm install C:/apps/local-modules/assets-dataudiar
```

Puis libre à vous d'utiliser les fonctions (voir le pré-requis jQuery ci-dessus)

### En production

Le package est déjà présent sur srv-gitlab et perceval ici : `/home/app/assets-dataudiar` (même chemin pour les deux)

L'installation est faite automatiquement dans le hook de déploiement, [voir ici](http://srv-gitlab.audiar.net/rfroger/global-documentation/-/blob/master/git_deployment.md#mise-en-place-dun-hook-post-receive)

Si vous lancez l'application manuellement, le principe est le même :

```
cd /home/app/my-app
npm install ../assets-dataudiar
npm install
npm run start
```

## Tests

*En cours d'amélioration*

Les tests sont basés sur Mocha et situés dans `js/tests`

```
cd C:/apps/my-app
npm run test
```

## Documentation

Une documentation est générée automatiquement à partir du package [ESDoc](https://esdoc.org/)

Placez-vous au niveau de la racine du dossier assets-dataudiar, puis lancez :

### Windows

```
npm install
npx esdoc
start docs/index.html
```

### Linux

```
npm install
npx esdoc
open docs/index.html
```