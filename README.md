# buildKramGhsvs
 Centralized build scripts for my Joomla extensions. Reduce redundancy.

Mein Build-Kram, der von mehren lokalen Repos verwendet wird, damit nicht jedes mal die selben build-Skripte angelegt und geprüft werden müssen.

## Used by
- [mod_custom_blankghsvs](https://github.com/GHSVS-de/mod_custom_blankghsvs)
- [mod_splideghsvs](https://github.com/GHSVS-de/mod_splideghsvs)
- [plg_content_prismhighlighterghsvs](https://github.com/GHSVS-de/plg_content_prismhighlighterghsvs)
- [plg_system_onuserghsvs](https://github.com/GHSVS-de/plg_system_onuserghsvs)
- [plg_system_bs3ghsvs_bs5](https://github.com/GHSVS-de/plg_system_bs3ghsvs_bs5)
- [plg_system_convertformsghsvs](https://github.com/GHSVS-de/plg_system_convertformsghsvs)

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
