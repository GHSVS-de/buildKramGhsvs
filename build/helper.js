#!/usr/bin/env node

'use strict'

const fse = require('fs-extra');
const util = require("util");
const rimRaf = util.promisify(require("rimraf"));
const pc = require('picocolors');
const crypto = require('crypto');
const lineReader = util.promisify(require('line-reader').eachLine);
const jsonMerger = require("json-merger");

module.exports.cleanOut = async (cleanOuts) =>
{
	for (const file of cleanOuts)
	{
		await rimRaf(file).then(
			answer => console.log(pc.red(pc.bold(`rimRafed "${file}".`)))
		).catch(error => console.error('Error ' + error));
	}
}

module.exports.copy = async (from, to) =>
{
	await fse.copy(from, to
	).then(
		answer => console.log(
			pc.yellow(pc.bold(`Copied "${from}" to "${to}".`))
		)
	).catch(error => console.error('Error ' + error))
}

module.exports.mkdirOld = async (to) =>
{
	if (!(await this.getExists(to)))
	{
		await fse.mkdir(to
		).then(
			answer => console.log(pc.yellow(pc.bold(`Created ${to}.`)))
		).catch(error => console.error('Error ' + error));
  }
}

/*
- Ensures that the directory exists.
- If the directory structure does not exist, it is created.
- options: For example:
const options = {mode: 0o2775}
*/
module.exports.mkdir = async (to, options) =>
{
	if (! options)
	{
		options = {};
	}

	await fse.ensureDir(to, options
	).then(
		answer => console.log(pc.yellow(pc.bold(`Created ${to}.`)))
	).catch(error => console.error('Error ' + error));
}

// Digest sha256, sha384 or sha512.
module.exports.getChecksum = async (path, Digest) =>
{
	if (!Digest)
	{
		Digest = 'sha256';
	}

  return new Promise(function (resolve, reject)
	{
    const hash = crypto.createHash(Digest);
    const input = fse.createReadStream(path);

    input.on('error', reject);
    input.on('data', function (chunk)
		{
      hash.update(chunk);
    });

    input.on('close', function ()
		{
      resolve(hash.digest('hex'));
    });
  });
}

// Find version string in JSON file. E.g. for packageName 'scssphp/scssphp' in composer/installed.json.
module.exports.findVersionSub = async (packagesFile, packageName) =>
{
	console.log(pc.magenta(pc.bold(
	`Search versionSub of package "${packageName}" in "${packagesFile}".`)));

	let foundVersion = '';
	const {packages} = require(packagesFile);

	await packages.forEach((Package) =>
	{
		if (Package.name === packageName)
		{
			foundVersion = Package.version_normalized;
			return false;
		}
	});

	return foundVersion;
}

// Simple. Find version string in file package.json
module.exports.findVersionSubSimple = async (packagesFile, packageName) =>
{
	console.log(pc.magenta(pc.bold(
		`Search versionSub of package "${packageName}" in "${packagesFile}".`)));

	return require(packagesFile).version;
}

// Find version string by RegEx in a file.
// Example:
// The string to search in that file(s).
// const bsBundleRegExp = new RegExp(
//	/\* Bootstrap \(v(\d+\.\d+\.\d+)\): index\.umd\.js/
// );
module.exports.findVersionSubRegex = async (file, thisRegex, limit) =>
{
	if (!limit)
	{
		limit = 20;
	}

	console.log(pc.magenta(pc.bold(
		`Search versionSub. First ${limit} lines of "${file}".`)));

	let foundVersion = '';
	let count = 0;

	await lineReader(file, function(line)
	{
		count++;

		if (count >= limit)
		{
			console.log(pc.red(pc.bold(`No version found in first ${count} lines.`)));
			return false;
		}

		if (thisRegex.test(line))
		{
			foundVersion = line.match(thisRegex)[1];
			return false;
		}
	}).then(function (err) {
		if (err) throw err;
	});

	return foundVersion;
}

module.exports.zip = async (zipOptions) =>
{
	const zip = new (require('adm-zip'))();
	zip.addLocalFolder(zipOptions.source, false);
	await zip.writeZip(zipOptions.target);
	console.log(pc.bgRed(pc.cyan(pc.bold(
		`ZIP file "${zipOptions.target}" written.`))));
}

// Check if file or folder exists/is accessible.
module.exports.getExists = async (path) =>
{
  try {
    await fse.access(path)
    return true
  } catch {
    return false
  }
}

/*
- Auch multidimensionales Mergen.
- Json-Dateien als Array übergeben. ["a.json", "b.json"]
- Absolute Pfade.
*/
module.exports.mergeJson = async (files) =>
{
	console.log(pc.magenta(pc.bold(
		`helper.mergeJson:\n"- ${files[1]}"\nover\n"- ${files[0]}".`)));

	const mergedJson = await jsonMerger.mergeFiles(files);

	// Falls du mal Switch einbauen willst.
	return JSON.stringify(mergedJson, null, '\t');
}

/*
- Da musst aufpassen. Unterarrays werden nicht partiell ersetzt, sondern ausgetauscht. Nur oberste Dimension wird berücksichtigt.
- z.B. 2 package.json mergen. Return JSON as string that can be used then via
const {
	filename,
	name,
	nameReal,
	version,
} = JSON.parse(mergedJson);

- Absolute paths required.
*/
module.exports.mergeJsonSimple = async (file1, file2) =>
{
	console.log(pc.magenta(pc.bold(
		`helper.mergeJsonSimple: "${file2}" over "${file1}".`)));

	const result = require(file1);
	const result2 = require(file2);
	let mergedJson = Object.assign(result, result2);;

	return JSON.stringify(mergedJson, null, '\t');
}
