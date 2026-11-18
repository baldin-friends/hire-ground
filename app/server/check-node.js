// Runs before the server: Hire Ground keeps its data in SQLite through node:sqlite, which needs Node.js 22.13 or later.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
    console.error(`\nHire Ground needs Node.js 22.13 or later. This is ${process.versions.node}.\nIts database uses node:sqlite, which older versions do not have. Update Node.js: https://nodejs.org\n`);
    process.exit(1);
}
