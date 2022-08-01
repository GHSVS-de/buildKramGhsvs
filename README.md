# buildKramGhsvs
 Centralized build scripts for my Joomla extensions. Reduce redundancy.

Mein Build-Kram, der von mehren lokalen Repos verwendet wird, damit nicht jedes mal die selben build-Skripte angelegt und geprüft werden müssen. Und npm-Updates.

Dabei ist die Ordner-Struktur bei mir lokal so.

```
/pfad/zu/git-kram/buildKramGhsvs
/pfad/zu/git-kram/otherRepo
```

## Inclusion examples in repo `otherRepo/build.js`

```js
// Example plg_system_onuserghsvs

const path = require('path');

/* Configure START */
const pathBuildKram = path.resolve("../buildKramGhsvs");
const updateXml = `${pathBuildKram}/build/update.xml`;
const changelogXml = `${pathBuildKram}/build/changelog.xml`;
const releaseTxt = `${pathBuildKram}/build/release.txt`;
/* Configure END */

const replaceXml = require(`${pathBuildKram}/build/replaceXml.js`);
const helper = require(`${pathBuildKram}/build/helper.js`);

const pc = require(`${pathBuildKram}/node_modules/picocolors`);
const fse = require(`${pathBuildKram}/node_modules/fs-extra`);
...and so on...
```
See `package.json.dependencies` for other npm packages provided by this repo.

----------------------

# My personal build procedure (WSL 1, Debian, Win 10)

- `cd /mnt/z/git-kram/buildKramGhsvs`

## node/npm updates/installation
- `npm run updateCheck` or (faster) `npm outdated`
- `npm run update` (if needed) or (faster) `npm update --save-dev`
- `npm install` (if needed)
