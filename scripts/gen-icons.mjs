import fs from "node:fs";

// Minimal valid PNG buffer generator with header
// 1x1 transparent PNG expanded to avoid 404
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, "base64");

fs.writeFileSync("public/icon-192.png", buffer);
fs.writeFileSync("public/icon-512.png", buffer);
console.log("PWA icon placeholders generated.");
