"use strict";

const fs = require("fs");
const path = require("path");
const GLOBAL_FILE_MATCHER = /[.](android|ios|windows|wp8)[.]\w+$/;
const platformsData = {
	android: {
		nativePath: (projectRoot) => path.join(projectRoot, "platforms", "android", "assets"),
	},
	ios: {
		nativePath: (projectRoot) => path.join(projectRoot, "platforms", "ios"),
	},
	windows: {
		nativePath: (projectRoot) => path.join(projectRoot, "platforms", "windows"),
	},
	wp8: {
		nativePath: (projectRoot) => path.join(projectRoot, "platforms", "wp8"),
	},
};

module.exports = function (context) {
	const projectRoot = context.opts.projectRoot;
	const platforms = context.opts.platforms;

	copyResources(platforms, projectRoot);
}

function copyResources(platforms, projectRoot) {
	const excludePaths = [
		path.join(projectRoot, "platforms"),
		path.join(projectRoot, "node_modules"),
		path.join(projectRoot, "plugins"),
		path.join(projectRoot, "Plugins")
	];

	walkSync(projectRoot, (filePath) => {
		const match = filePath.match(GLOBAL_FILE_MATCHER);
		if (match && match.length > 1) {
			const platform = match[1];
			const relativePath = filePath.substring(projectRoot.length + 1);
			removeFromPlatform(projectRoot, relativePath);
			const dest = path.join(platformsData[platform].nativePath(projectRoot), path.dirname(relativePath), path.basename(filePath).replace(`.${platform}`, ""));
			copyFile(filePath, dest);
		}
	}, (filePath) => {
		return !!excludePaths.find(path => filePath === path);
	});
}

function walkSync(dir, fileHandler, skipHandler) {
	const files = fs.readdirSync(dir);
	files.forEach((file) => {
		const filePath = path.join(dir, file)
		if (fs.statSync(filePath).isDirectory() && !skipHandler(filePath)) {
			walkSync(filePath, fileHandler, skipHandler);
		} else {
			fileHandler(filePath);
		}
	});
};

function copyFile(source, dest) {
	if (fs.existsSync(path.dirname(dest))) {
		const content = fs.readFileSync(source);
		fs.writeFileSync(dest, content);
	}
}

function removeFromPlatform(projectRoot, relativePath) {
	for (const platform in platformsData) {
		if (platformsData.hasOwnProperty(platform)) {
			const filePath = path.join(platformsData[platform].nativePath(projectRoot), relativePath);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
	}
}
