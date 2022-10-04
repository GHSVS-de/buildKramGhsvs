#!/usr/bin/env node

'use strict'

const fse = require('fs-extra');
const util = require("util");
const rimRaf = util.promisify(require("rimraf"));
const pc = require('picocolors');
const crypto = require('crypto');
const lineReader = util.promisify(require('line-reader').eachLine);
const jsonMerger = require("json-merger");
const recursive = require("recursive-readdir");

const { getFiles } = require('@dgrammatiko/compress/src/getFiles.js');
const { compressFile } = require('@dgrammatiko/compress/src/compressFile.js');

// Possible Digest values (checksum).
const Digests = ['sha256', 'sha384', 'sha512'];
const defaultDigest = 'sha256';

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

module.exports.getChecksum = async (path, Digest) =>
{
	// B\C. See also _getChecksum().
	if (! Digests.includes(Digest))
	{
		Digest = defaultDigest;
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

module.exports._getChecksum = async (filePath, Digest) =>
{
	// B\C. See also getChecksum().
	if (! Digests.includes(Digest))
	{
		Digest = defaultDigest;
	}

	const checksum = await this.getChecksum(filePath, Digest)
  .then(
		hash => {
			const tag = `<${Digest}>${hash}</${Digest}>`;
			console.log(pc.green(pc.bold(`Checksum tag is: ${tag}`)));
			return tag;
		}
	)
	.catch(error => {
		console.log(error);
		console.log(pc.red(pc.bold(
			`Error while checksum creation. I won't set one!`)));
		return '';
	});

	return checksum;
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
//
// const bsBundleRegExp = new RegExp(
//	/\* Bootstrap \(v(\d+\.\d+\.\d+)\): index\.umd\.js/
// );
//
// new RegExp(/\@version (\d+\.\d+\.\d+)/)
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
paths an array of folders.
Creates a *.gz of all .min.css and .min.js.
*/
module.exports.gzip = async (paths) =>
{
	console.log(pc.magenta(pc.bold(`Start helper.gzip: "${paths}".`)));
	const tasks = [];
	const compressTasks = [];
	paths.map((path) => tasks.push(getFiles(`${path}/`)));
	paths.map((path) => tasks.push(getFiles(`${path}/`)));
	const files = await Promise.all(tasks);
	[].concat(...files).map((file) => compressTasks.push(compressFile(file, false)));
	await Promise.all(compressTasks);
	console.log(pc.green(pc.bold(`Ended helper.gzip: "${paths}".`)));
};

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

/*
regex ist verpflichtend im Moment. Zu faul.
Siehe mod_splideghsvs als Beispiel.
folder: abs. Pfad.
regex: Regex für zu suchende Dateien. z.B. '\.css$'.
strip: Regex für zu entfernenden Teil aus Fund. Meist Pfad-Intro wie der folder selbst.
exclude: Regex für zu ignorierende Funde. z.B. '\.min\.css$'.
*/
module.exports.getFilesRecursive = async (folder, regex, strip, exclude) =>
{
	let collector = [];

	if (! strip)
	{
		strip = '';
	}

	let excludeRegex;

	if (exclude)
	{
		excludeRegex = new RegExp(exclude);
	}

	const stripRegex = new RegExp(`^${strip}`, "g");

	console.log(pc.magenta(pc.bold(`Start helper.getFilesRecursive: "${folder}".`)));

	await recursive(folder).then(
		function(files)
		{
			const thisRegex = new RegExp(regex);

			files.forEach((file) =>
			{
				if (exclude && excludeRegex.test(file))
				{
					return;
				}

				if (thisRegex.test(file) && fse.lstatSync(file).isFile())
				{
					collector.push(file.replace(stripRegex, ''));
				}
			});
		},
		function(error) {
			console.error("something exploded", error);
		}
	);

	return collector;
}
