const semver = require('semver');
const requiredNode = ">=16.0.0 <=20.x";

if (!semver.satisfies(process.version, requiredNode)) {
  console.error(`❌ Requires Node.js ${requiredNode}. Current: ${process.version}`);
  process.exit(1);
}