#!/usr/bin/env node

'use strict'

const fse = require('fs-extra');
const pc = require('picocolors');
const path = require('path');

/*
replaceXmlOptions = {
	"xmlFile": abs Pfad zu Datei mit Platzhaltern drinnen,
	"zipFilename": ,
	"checksum": Der Checksum-Tag,
	"dirname": __dirname, also abs Pfad des aufrufenden Repos.
};
*/

module.exports.main = async (replaceXmlOptions) =>
{
  try
  {
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
		} = require(path.join(replaceXmlOptions.dirname, "package.json"));

		let xmlFile = replaceXmlOptions.xmlFile;
		let zipFilename = replaceXmlOptions.zipFilename;
		let checksum = replaceXmlOptions.checksum;
		let thisPackages = replaceXmlOptions.thisPackages;

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
		let addfieldprefix = update.namespace ?
			` addfieldprefix="${update.namespace}\\Field"` : "";

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
			element: filename,
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
			uses: uses.join("<br>"),
			version: version,
			versionCompare: versionCompare,
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
			`Replaced entries in "${xmlFile}".`)))
		);
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
