# buildKramGhsvs
 Centralized build scripts for my Joomla extensions. Reduce redundancy.

Mein Build-Kram, der von mehren lokalen Repos verwendet wird, damit nicht jedes mal die selben build-Skripte angelegt und geprüft werden müssen.

----------------------

# My personal build procedure (WSL 1, Debian, Win 10)

- `cd /mnt/z/git-kram/buildKramGhsvs`

## node/npm updates/installation
- `npm run updateCheck` or (faster) `npm outdated`
- `npm run update` (if needed) or (faster) `npm update --save-dev`
- `npm install` (if needed)

## Inclusion example in other repo's build.js

```js
// Example plg_system_onuserghsvs

const path = require('path');

/* Configure START */
const pathBuildKram = path.resolve("../buildKramGhsvs/build");
const updateXml = `${pathBuildKram}/update.xml`;
const changelogXml = `${pathBuildKram}/changelog.xml`;
const releaseTxt = `${pathBuildKram}/release.txt`;
/* Configure END */

const replaceXml = require(`${pathBuildKram}/replaceXml.js`);
const helper = require(`${pathBuildKram}/helper.js`);
```
