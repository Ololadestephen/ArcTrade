const fs = require('fs');
const idl = JSON.parse(fs.readFileSync('./app/utils/idl.json', 'utf8'));

console.log("Looking for CancelOrderArgs...");
const found = idl.types.find(t => t.name === 'CancelOrderArgs');
if (found) {
    console.log("FOUND:", JSON.stringify(found, null, 2));
} else {
    console.log("NOT FOUND in `types` array!");
}
