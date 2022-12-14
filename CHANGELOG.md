

## Version 1.7.0

* Add PWA support for local application caching.
* Add support for Launcher for macOS Monterey.
* Add updates to support new launcher release for macOS Ventura.
* Moved sensor blocks into separate modules
* Enable hmc5883l_compass blocks for activity board, per online docs.
* Correct error in the init method.
* Refactor the experimental I2C blocks to a separate module. IC2 blocks are now available
in the [SoloCup](http://solocup.parallax.com) preview site.
* Replace cdn version of the bootstrap css package with server-hosted version.
* Removed the Sentry package.
* Output css bundle where webpack expects to find it.
* Correct text in Launcher installation to include Windows 11 and remove Windows 7.

## Version 1.6.1

* Hot-fix 1.6.1.1 to install the ab_drive_speed block.
* Refactor help URLs to use https.
* Finalize a version 1 project file format. Now includes a UUID.
* Update Blockly Core to v3.20200924.41.6.2.230-b1.
* Created SD File Exists block.
* Convert in-line svg XML into icon files.
* New flag to enable/disable Block comments.
* Add support for Block comments.

## Version 1.5.7.1

* Update package 'urijs' to version 1.19.6 to address CVE [Hostname spoofing via backslashes in URL](https://www.npmjs.com/advisories/1640)
* Update package 'elliptic' to version 6.5.4 to address CVE [Use of a Broken or Risky Cryptographic Algorithm](https://www.npmjs.com/advisories/1648)
* Update package 'selenium-standalone' to 6.23.0.
* Update package 'yargs' to version 16.2.0 to address CVE [Prototype Pollution](https://www.npmjs.com/advisories/1654) in the y18n package dependency. 
* Add Launcher installation links for individual supported macOS versions.

