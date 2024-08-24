# Initial Setup
Getting started with an ElectronJS app is simple and easy. To develop the app at its most basic level, you only need a bit of knowledge with JavaScript. You can follow along some steps here, or checkout the official [ElectronJS](https://www.electronjs.org/docs/latest) documentation and quickstart guide, which will be very similar.

## Step 1: Getting Started
To get started with a basic ElectronJS app template, you can type the following into your terminal:

```npx create-electron-app@latest electronexample```

This will get you started with a very basic app to get started. In fact, you can see the code for that [here](https://github.com/sethbr11/ElectronApp/commit/6b7f560e077fd8383007166bb8a6948a1e7d9cb7) in this project, where it was committed, unedited, after its creation. Granted, depending on when you are viewing this, your version may be slightly different with updates. It may also be helpful to look at [Electron Forge's](https://www.electronforge.io) documentation for getting started, since they have a few more options for starter app templates.

After creating the app, poke around and get familiar with its configuration. Change the productName, description, license, or author information in *package.json* if needed. You will notice that Electron Forge comes with the sample app by default. You can edit anything in the *forge.config.js* file if you want to change the way your app is published and distributed.

Also in *package.json* are all of the basic and necessary commands to get started. These include:

```
npm run start
npm run package
npm run make
npm run publish
npm run lint
```

The first four npm commands (start, package, make, and publish) are all Electron Forge commands: ```start``` will run your app locally, ```package``` will create a folder called *out* and load in everything your app needs to run separately (including the executable file itself), ```make``` will create a platform-specific installer based on your forge configuration, and ```publish``` will push your installation information and files to a platform like GitHub for distribution.

The last npm command listed, ```npm run lint```, is there, but is not implemented. You might find it helpful to configure a package like [ESLint](https://www.electronforge.io) while you are creating your app. Other helpful packages for working on ElectronJS include [webpack](https://webpack.js.org) or [nodemon](https://www.npmjs.com/package/nodemon).

## Step 2: Understanding the Code
There's not too much in our code yet, but it's important to understand what is there so we can use it. Most of the files will be packaged in the final app, so take care with what you include as it can be accessed by the end user.

### package.json
The *package.json* file holds all of the essential details for our app that is important for our app to run and be distributed. This includes the app name, version, dependencies, and scripts, and it defines the app's metadata and manages the environment the app operates within.

### package-lock.json
This file is mostly for the computer; you rarely (if ever) need to open it. It locks the versions of your dependencies to ensure that the environment remains consistent across different installations.

### forge.config.js
This file is vital for publishing the ElectronJS app and creating the installers. It defines the configuration for building, packaging, and distributing the app. This file often holds sensitive information like API keys, so it's especially recommended to either leave this out of the final versioin of the app, or hold sensitive information in environmental variables.

### src/index.js
This is the main JavaScript file your Electron app looks at. It contains the code to launch your app, manage windows, and handle the main process logic. If you want the app to look at a different file, you can adjust the entry point in *package.json*.

### src/preload.js
This file has a very specific purpose in Electron apps, mainly enabling secure communication between the main and renderer process. It injects limited functionality into web pages and won't be used in some apps. However, it is essential when security is a concern, since without context isolation, web content in your Electron app can directly access Node.js APIs, which exposes your app to [security risks](https://www.electronjs.org/docs/latest/tutorial/security) like XSS attacks.

### src/index.html with index.css
As with any web app, *index.html* is intended to be the starting point for your program. In this case, it is the main window of your desktop app. The attached default spreadsheet, *index.css*, controls the appearance and layout of your HTML elements.

## Step 3: Publishing
Before getting too far into app development, it's good to make sure publishing works and is configured in the app. We will not get into code signing yet, as that is a whole other process, but we will go over publishing releases and, at the very least, configuring temporary certificates to be able to run your program, especially on operating systems like Mac that make this hard. The documentation for publishing with Electron Forge is not the most descriptive, but can be found [here](https://www.electronforge.io/config/publishers).

To see everything that was changed in this project to get it to publish, you can check out the **associated commit**, but we will also talk about it in this document. 

### Setup
The first step is to add the publisher section to forge.config.js under the module.exports, which for GitHub looks a little like this:
```
publishers: [
	{
		name: '@electron-forge/publisher-github',
		config: {
			repository: {
				owner: 'GitHubUsername',
				name: 'RepoName'
			},
			prerelease: true,   // Can be adjusted
			draft: false        // Can be adjusted
		}
	}
]
```
To successfully publish to GitHub, you will also need to install the npm package for it, which can be done by running the following in the terminal: ```npm install --save-dev @electron-forge/publisher-github```.

### Auto Updates
We will also want to add some code for automatic updates. While not complex, there are two main packages to choose between to accomplish this. One is [electron-updater](https://www.electron.build/auto-update), and the other is [update-electron-app](https://www.electronjs.org/docs/latest/tutorial/updates#reading-release-metadata). You can also electron's native [autoUpdater](https://www.electronjs.org/docs/latest/api/auto-updater) object that emits different events, and of course there are other packages that could be considered made by other third-parties. While **electron-updater** has some good development options like feedback for update progress, we are going to use **update-electron-app**  because of how easy it is to use and how well it integrates with GitHub.

Our first step will be to install the electron-updater package: ```npm install update-electron-app```. After it's installed, we can simply add the following code to the top of our *index.js* file: ```updateElectronApp({ repo: 'GitHubUsername/RepoName' });```. Alternatively, you could add this information in *package.json* under a section called *repository* and only call ```updateElectronApp();``` in your *main.js* file. That could look a little something like this:
```
"repository": {
	"type": "git",
	"url": "https://github.com/GitHubUsername/RepoName.git"
},
```
For GitHub, this process is very straight-forward.

Chances are, you are probably wanting to release your app somewhere other than GitHub. If you are going to use something like Amazon S3 or Cloudflare, the replace the require statement above with the following code:
```
const { updateElectronApp, UpdateSourceType } = require('update-electron-app');

updateElectronApp({
	updateSource: {
		type: UpdateSourceType.StaticStorage,
		baseUrl: `https://your-bucket.s3.amazonaws.com/app-name/${process.platform}/${process.arch}`
	}
})
```
If you are using Cloudflare, your baseUrl might look something like this: ```https://pub-abunchofrandomnumbersandletters.r2.dev/app-name/${process.platform}/${process.arch}```

### Creating Installers
Next is to set up the installers. You'll notice these four sections of the module exports: *packagerConfig*, *rebuildConfig*, *makers*, and *plugins*. The important part here is the *makers* section, which outlines which installers will be created. We will get into the other sections later. If you started with the basic Electron template, your makers section should look like this:
```
makers: [
	{
		name: '@electron-forge/maker-squirrel',
		config: {},
	},
	{
		name: '@electron-forge/maker-zip',
		platforms: ['darwin'],
	},
	{
		name: '@electron-forge/maker-deb',
		config: {},
	},
	{
		name: '@electron-forge/maker-rpm',
		config: {},
	},
],
```
At present, this tells Electron Forge to make a [Squirrel installer](https://www.electronforge.io/config/makers/squirrel.windows) for Windows, a [.zip](https://www.electronforge.io/config/makers/zip) file for Mac, a [.deb](https://www.electronforge.io/config/makers/deb) package for Debian-based Linux distributions (like Ubuntu), and a [.rpm](https://www.electronforge.io/config/makers/rpm) file for Red Hat-based Linux distributions (like Fedora and RHEL). We'll change this around a little bit, but first it is important to note that **you can only make installers for the operating system that you are running**, e.g., if you don't have a Linux computer, you can't make installers for Linux.

#### Windows Installer
Normally, we would have access to quite a few options for a Windows installer, including Squirrel, MSI, NSIS, zip, etc.

#### Mac Installer
Mac is fairly straightforward.

#### Linux Installer
I know nothing of Linux.