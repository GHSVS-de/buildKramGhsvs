# buildKramGhsvs
 Centralized build scripts for my Joomla extensions. Reduce redundancy.

Mein Build-Kram, der von mehren lokalen Repos verwendet wird, damit nicht jedes mal die selben build-Skripte angelegt und geprüft werden müssen.

## Used by
- [hugo_baseghsvs](https://github.com/GHSVS-de/hugo_baseghsvs)
- [mod_contactghsvs](https://github.com/GHSVS-de/mod_contactghsvs)
- [mod_custom_blankghsvs](https://github.com/GHSVS-de/mod_custom_blankghsvs)
- [mod_extensionarticlesghsvs](https://github.com/GHSVS-de/mod_extensionarticlesghsvs)
- [mod_splideghsvs](https://github.com/GHSVS-de/mod_splideghsvs)
- [mod_tocghsvs](https://github.com/GHSVS-de/mod_tocghsvs)
- [pkg_file_iconsghsvs](https://github.com/GHSVS-de/pkg_file_iconsghsvs)
- [pkg_lib_imgresizeghsvs](https://github.com/GHSVS-de/pkg_lib_imgresizeghsvs)
- [pkg_lib_structuredataghsvs](https://github.com/GHSVS-de/pkg_lib_structuredataghsvs)
- [plg_content_prismhighlighterghsvs](https://github.com/GHSVS-de/plg_content_prismhighlighterghsvs)
- [plg_system_bs3ghsvs_bs5](https://github.com/GHSVS-de/plg_system_bs3ghsvs_bs5)
- [plg_system_convertformsghsvs](https://github.com/GHSVS-de/plg_system_convertformsghsvs)
- [plg_system_hyphenateghsvs](https://github.com/GHSVS-de/plg_system_hyphenateghsvs)
- [plg_system_importfontsghsvs](https://github.com/GHSVS-de/plg_system_importfontsghsvs)
- [plg_system_onuserghsvs](https://github.com/GHSVS-de/plg_system_onuserghsvs)
- [plg_system_venoboxghsvs](https://github.com/GHSVS-de/plg_system_venoboxghsvs)
- [tpl_bs4ghsvs](https://github.com/GHSVS-de/tpl_bs4ghsvs)

----------------------

# My personal build procedure (WSL 1, Debian, Win 10)

- `cd /mnt/z/git-kram/buildKramGhsvs`

## node/npm updates/installation
- `npm run updateCheck` or (faster) `npm outdated`
- `npm run update` (if needed) or (faster) `npm update --save-dev`
- `npm install` (if needed)

## Inclusion examples in other repo's build.js

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
```
