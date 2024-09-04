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
Before getting too far into app development, it's good to make sure publishing works and is configured in the app. We will get a little bit into code signing, but just enough to be able to do testing. This would involve configuring temporary certificates for Mac, since MacOS won't let you run your installed app without it. The documentation for publishing with Electron Forge is not the most descriptive, but can be found [here](https://www.electronforge.io/config/publishers).

To see everything that was changed in this project to get it to publish, you can check out the [associated commit](https://github.com/sethbr11/ElectronApp/commit/764155c61a8464a21b0b33ab57a0ea047e3a98b2), but we will also talk about it in this document. 

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

### Custom Publishers
Electron Forge also has a way for you to [write your own publisher](https://www.electronforge.io/advanced/extending-electron-forge/writing-publishers) if none of the preset publishers meet your needs. This involves creating your own class that inherits from their *PublisherBase* class. This is beyond the scope of this walkthrough, though may be covered in another document at a later date. If such a document is created, it will be linked here.

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
At present, this tells Electron Forge to make a [Squirrel installer](https://www.electronforge.io/config/makers/squirrel.windows) for Windows, a [.zip](https://www.electronforge.io/config/makers/zip) file for Mac (which can be adjusted for other operating systems by adding platforms in the associated config section), a [.deb](https://www.electronforge.io/config/makers/deb) package for Debian-based Linux distributions (like Ubuntu), and a [.rpm](https://www.electronforge.io/config/makers/rpm) file for Red Hat-based Linux distributions (like Fedora and RHEL). We'll change this around a little bit, but first it is important to note that **you can only make installers for the operating system that you are running**, e.g., if you don't have a Linux computer, you can't make installers for Linux. There are [some options](https://www.electronforge.io/core-concepts/build-lifecycle#cross-platform-build-systems) for you if you don't have these other operating systems, but generally, it is better if you able to acquire them for testing and development.

#### Windows Installers
Windows has a number of options for makers you can use: [Squirrel.Windows](https://www.electronforge.io/config/makers/squirrel.windows), [AppX](https://www.electronforge.io/config/makers/appx), [WiX MSI](https://www.electronforge.io/config/makers/wix-msi), and [ZIP](https://www.electronforge.io/config/makers/zip). WiX MSI is generally discouraged from use as it tends to be a poorer user experience, but may be required for your use case. AppX is catered more towards apps that are distributed in the Microsoft Store and requires [Microsoft SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/) for its use. The most common and straight-forward installer is **Squirrel Windows**, so that is what we will set up here. There are many configurable parameters for the Squirrel.Windows maker which can be found [here](https://js.electronforge.io/interfaces/_electron_forge_maker_squirrel.InternalOptions.SquirrelWindowsOptions.html), though it should be mentioned that the MakerSquirrelConfig [omits appDirectory and outputDirectory](https://js.electronforge.io/modules/_electron_forge_maker_squirrel.html#MakerSquirrelConfig). Each maker will have its own config options, which can be found here: [AppX](https://js.electronforge.io/interfaces/_electron_forge_maker_appx.MakerAppXConfig.html), [WiX MSI](https://js.electronforge.io/interfaces/_electron_forge_maker_wix.MakerWixConfig.html), and [ZIP](https://js.electronforge.io/interfaces/_electron_forge_maker_zip.MakerZIPConfig.html).

#### Mac Installers
Mac also has a few options for makers, including [DMG](https://www.electronforge.io/config/makers/dmg), [PKG](https://www.electronforge.io/config/makers/pkg), and [ZIP](https://www.electronforge.io/config/makers/zip) (ZIP is common among all operating systems). DMG is most commonly used for applications and quick installations to the Applications folder. The [config](https://js.electronforge.io/interfaces/_electron_forge_maker_dmg.MakerDMGConfig.html) for the maker is also quite simple. The PKG format is also widely used as that is the format accepted by the App Store. PKG installers guide the user through an installation process that is a bit more customizable, which can be set up through its [config](https://js.electronforge.io/interfaces/_electron_forge_maker_pkg.MakerPKGConfig.html). ZIP is the same for all operating systems and has a very simple [config](https://js.electronforge.io/interfaces/_electron_forge_maker_zip.MakerZIPConfig.html).

#### Linux Installers
Linux probably has the most options for installers, including [DEB](https://www.electronforge.io/config/makers/deb) files for Debian-based Linux distributions (like Ubuntu), [Flatpak](https://www.electronforge.io/config/makers/flatpak) which allows for Linux sandbox installations, [RPM](https://www.electronforge.io/config/makers/rpm) for RedHat-based Linux distributions like Fedora or Red Hat Enterprise Linux (RHEL), [Snapcraft](https://www.electronforge.io/config/makers/snapcraft) for sandbox installations on a variety of Linux platforms, and [ZIP](https://www.electronforge.io/config/makers/zip). Which installer you use here is completely up to your preference and use-case. Associated configs can be found here: [DEB](https://js.electronforge.io/interfaces/_electron_forge_maker_deb.InternalOptions.MakerDebConfigOptions.html), [Flatpak](https://js.electronforge.io/interfaces/_electron_forge_maker_flatpak.InternalOptions.MakerFlatpakOptionsConfig.html), [RPM](https://js.electronforge.io/interfaces/_electron_forge_maker_rpm.MakerRpmConfig.html), [Snapcraft](https://js.electronforge.io/interfaces/_electron_forge_maker_snap.InternalOptions.Options.html), [ZIP](https://js.electronforge.io/interfaces/_electron_forge_maker_zip.MakerZIPConfig.html). All of the Linux installers (besides ZIP) have these config options listed under ```config { options { ... } }``` instead of the normal ```config { ... }```.

#### Custom Makers/Installers
If you want something that gives you more flexibility in customization, you have a good amount of options. Some companies have gone so far as to clone the [Squirrel.Windows repository](https://github.com/Squirrel/Squirrel.Windows) for Windows installers and adjust the already existing framework. Then there are companies that have created application to create your own installers, which include [Inno Setup](https://jrsoftware.org/isinfo.php), [InstallForge](https://docs.installforge.net), [WiX Toolset](https://wixtoolset.org), and [Advanced Installer](https://www.advancedinstaller.com) for Windows. On Mac, you can actually build a DMG file with the Disk Utility app Mac provides with the system by creating a new image from your app's folder. There are many options, though it may take some digging to find out which option is best for your intended use case. 

When it comes to Linux, [GNU's](https://www.gnu.org) autotools [autoconf](https://www.gnu.org/software/autoconf/) with [automake](https://www.gnu.org/software/automake/) (see an attached walkthrough on how to use them [here](https://www.baeldung.com/linux/create-application-installer)) tend to be the go-to, though you can also use a program like [CMake](https://cmake.org/cmake/help/latest/guide/tutorial/Packaging%20an%20Installer.html) if that fits better.

Similar to if you were creating custom publishers, you can also [create custom makers](https://www.electronforge.io/advanced/extending-electron-forge/writing-makers) in Electron Forge, inheriting from their *MakerBase* class.

In addition, it's important to note that Electron Forge is not your only option. Other services like [Electron Builder](https://www.electron.build) should also be considered, especially if you are looking to develop in other formats like [NSIS](https://www.electron.build/configuration/nsis) for Windows, [MAS](https://www.electron.build/configuration/mas) for Mac, or [AppImage](https://www.electron.build/configuration/appimage) for Linux.

#### Maker Examples
To view some example configurations/setups of Electron Forge makers, view the [forge.config.js](https://github.com/sethbr11/ElectronApp/blob/main/forge.config.js) file in the associated repository.

### Temporary Fixes for Code Signing on MacOS
Code signing is an important part of distribution and allows for operating systems to recognize your application as legitimate. Depending on how far along you are in application development, you may or may not already be enrolled in the [Apple Developer Program](https://www.electronjs.org/docs/latest/tutorial/code-signing#signing--notarizing-macos-builds) or have been approved for something like [Microsoft's Trusted Signing](https://learn.microsoft.com/en-us/azure/trusted-signing/overview), thought there are also many [other options](https://www.electronjs.org/docs/latest/tutorial/code-signing#signing-windows-builds). We'll talk about these processes in another document, but we'll go over a temporary solution for MacOS systems during development, since you are still able to run your packaged app from installers on Windows.

To get around the MacOS protections, you will have to create your own certificate. The steps for creating your own are as follows:

1. Open the *Keychain Access* app.
2. Click on the app name in the top menu and go to *Certificate Assistant*. From there, click *Create a Certificate...*
3. Name the certificate something like **ElectronTestAppCertificate** and change the certificate type to **Code Signing**. Press *Create* to finish.
4. To make sure it saved, you should see it in *Keychain Access* under the *login* section of *Default Keychains* after navigating to *My Certificates*.
5. Download the dmg file for the testapp from the releases section. Run the dmg to install the app.
6. Open the terminal and navigate to the Application folder where the downloaded app is saved. This should be in the very base directory and not the Application folder under your user directory.
7. Run the following commands in the terminal:
    - xattr -cr packagedemo.app (removes all extended attributes, including metadata and Finder information, from the specified file or directory and its contents).
    - codesign --deep --force --sign "ElectronTestAppCertificate" packagedemo.app (applies the certificate).
8. Run the app as normal!