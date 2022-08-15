#!/usr/bin/env node

'use strict'

const fse = require('fs-extra');
const pc = require('picocolors');
const path = require('path');

/*
replaceXmlOptions = {
	"xmlFile": abs Pfad zu Vorlagen-Datei mit Platzhaltern drinnen,
	"zipFilename": ,
	"checksum": Der Checksum-Tag,
	"dirname": __dirname, also abs Pfad des aufrufenden Repos.
	"thisPackages":
	"jsonString": Die Möglichkeit ein "fertiges" JSON zu übergeben. Z.B. gemergtes Ergebnis aus helper.mergeJson().
};
*/

module.exports.main = async (replaceXmlOptions) =>
{
  try
  {
		// Base url to update and changelog.xml of Joomla extensions.
		// Can be overridden by parameter update.xmlserver in package.json.
		const xmlserver = 'https://raw.githubusercontent.com/GHSVS-de/upadateservers/master';

		// Base url to my PHP changelogs viewer. Used in <infourl>.
		// Can be overridden by parameter update.infourl in package.json.
		const infourl = 'https://updates.ghsvs.de/changelog.php';

		let jsonObj = {};

		if (replaceXmlOptions.jsonString)
		{
			jsonObj = JSON.parse(replaceXmlOptions.jsonString);
		}
		else
		{
			jsonObj = require(path.join(replaceXmlOptions.dirname, "package.json"));
		}

		const {
			author,
			update,
			changelog,
			releaseTxt,
			copyright,
			creationDate,
			description,
			name,
			nameReal,
			filename,
			version,
			versionCompare,
			licenseLong,
			minimumPhp,
			maximumPhp,
			minimumJoomla,
			maximumJoomla,
			allowDowngrades,
			bugs
		} = jsonObj;

		let xmlFile = replaceXmlOptions.xmlFile;
		let zipFilename = replaceXmlOptions.zipFilename;
		let checksum = replaceXmlOptions.checksum;
		let thisPackages = replaceXmlOptions.thisPackages;
		const xmlFileRel = path.relative(replaceXmlOptions.dirname, xmlFile)
		let versionSub = replaceXmlOptions.versionSub ? replaceXmlOptions.versionSub : "";

		let checksumEntity = '';

		if (checksum)
		{
			checksumEntity = checksum.replace(/</g, '&lt;');
			checksumEntity = checksumEntity.replace(/>/g, '&gt;');
		}

		let targetPlatforms = update.targetplatform;

		// B\C
		if (! Array.isArray(targetPlatforms))
		{
			targetPlatforms = [targetPlatforms];
		}

		let requires = [];

		if (releaseTxt.requires && releaseTxt.requires.length)
		{
			requires = releaseTxt.requires;
		}

		// Force 1 loop if not update.xml.
		if (path.win32.basename(xmlFile) !== 'update.xml')
		{
			targetPlatforms = [targetPlatforms.join(", ")];
		}

		let namespace = update.namespace ?
			`<namespace path="src">${update.namespace}</namespace>` : "";

		let addfieldprefix = "";

		if (namespace)
		{
			let tmp = "";

			if (update.type === 'module')
			{
				// client = site|administrator
				tmp = update.client;
				tmp = `\\${tmp.charAt(0).toUpperCase()}${tmp.slice(1)}`;
			}

			addfieldprefix = ` addfieldprefix="${update.namespace}${tmp}\\Field"`;
		}

		let thisPackagesHtml = '';

		if (thisPackages && thisPackages.length)
		{
			thisPackages = thisPackages.join("\n");
			thisPackagesHtml = thisPackages.replace(/</g, '&lt;');
			thisPackagesHtml = thisPackagesHtml.replace(/>/g, '&gt;');
			thisPackagesHtml = `<pre>\n${thisPackagesHtml}\n</pre>`;
		}
		else
		{
			thisPackages = '';
		}

		let uses = releaseTxt.uses ? releaseTxt.uses : [];
		let language = releaseTxt.language ? releaseTxt.language : [];

		let replacer = {
			addfieldprefix: addfieldprefix,
			allowDowngrades: allowDowngrades,
			authorName: author.name,
			authorUrl: author.url,
			bugs: bugs,
			checksum: checksum,
			checksumEntity: checksumEntity,
			client: update.client,
			copyright: copyright,
			creationDate: creationDate,
			description: description,
			docsDE: changelog.docsDE,
			docsEN: changelog.docsEN,
			element: update.element ? update.element : filename,
			filename: filename,
			folder: update.folder,
			infosDE: changelog.infosDE,
			infosEN: changelog.infosEN,
			language: language.join("<br>"),
			lastTests: changelog.lastTests.join('<br>'),
			licenseLong: licenseLong,
			maintainer: author.name,
			maintainerurl: author.url,
			maximumJoomla: maximumJoomla,
			maximumPhp: maximumPhp,
			method: update.method ? update.method : 'upgrade',
			minimumJoomla: minimumJoomla,
			minimumPhp: minimumPhp,
			name: name,
			nameReal: nameReal,
			nameRealUpper: nameReal.toUpperCase(),
			namespace: namespace,
			nameUpper: name.toUpperCase(),
			php_minimum: minimumPhp,
			projecturl: changelog.projecturl,
			"releaseTxt.title": releaseTxt.title,
			requires: requires.join("<br>"),
			tag: update.tag,
			thisPackages: thisPackages,
			thisPackagesHtml: thisPackagesHtml,
			type: update.type,
			// Abweichender Dateiname auf Upadate-Repo?
			updateFilePrefix: update.updateFilePrefix ? update.updateFilePrefix : name,
			uses: uses.join("<br>"),
			version: version,
			versionCompare: versionCompare,
			versionSub: versionSub,
			xmlserver: update.xmlserver ? update.xmlserver : xmlserver,
			infourl: update.infourl ? update.infourl : infourl,
			zipFilename: zipFilename
		};

		let fileContent = '';

		for (const targetplatform of targetPlatforms)
		{
			replacer.targetplatform = targetplatform;
			replacer.targetplatformHtml = targetplatform.replace(/\*/g, '&ast;');

			let xml = await fse.readFile(xmlFile, { encoding: "utf8" });

			Object.keys(replacer).forEach(key =>
			{
				let regex = new RegExp(`{{${key}}}`, "g");
				xml = xml.replace(regex, replacer[key]);
			});

			fileContent = fileContent + xml;
		}

		await fse.writeFile(xmlFile, fileContent, { encoding: "utf8" }
		).then(
		answer => console.log(pc.green(pc.bold(
			`Replaced placeholders in "${xmlFileRel}".`)))
		);
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
