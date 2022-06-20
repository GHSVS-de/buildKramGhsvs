#!/usr/bin/env node

'use strict'

const fse = require('fs-extra');
const util = require("util");
const rimRaf = util.promisify(require("rimraf"));
const pc = require('picocolors');
const crypto = require('crypto');
const lineReader = util.promisify(require('line-reader').eachLine);

module.exports.cleanOut = async (cleanOuts) =>
{
	for (const file of cleanOuts)
	{
		await rimRaf(file).then(
			answer => console.log(pc.red(pc.bold(`rimRafed "${file}".`)))
		).catch(error => console.error('Error ' + error));
	}
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

// Find version string in JSON file. E.g. for packageName 'scssphp/scssphp'
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
