import fs from 'fs';
import path from 'path';

const arciumPath = path.resolve('node_modules', '@arcium-hq', 'client', 'build');
const files = ['index.cjs', 'index.mjs'];

for (const file of files) {
  const filePath = path.join(arciumPath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace node createHash('sha3-256') with our js-sha3 polyfill
    if (content.includes("createHash('sha3-256')")) {
      content = "import { sha3_256 } from 'js-sha3';\n" + content;
      content = content.replace(/createHash\('sha3-256'\)/g, "sha3_256.create()");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${file}`);
    } else {
        console.log(`Already patched or not found in ${file}`);
    }
  }
}
