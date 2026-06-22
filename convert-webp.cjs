const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function convert() {
  const publicDir = "./public";
  
  // Convert token-logo.png to WebP
  const pngPath = path.join(publicDir, "token-logo.png");
  if (fs.existsSync(pngPath)) {
    await sharp(pngPath)
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, "token-logo.webp"));
    console.log("Converted token-logo.png to WebP");
  }
  
  // Convert fire.gif to WebP
  const gifPath = path.join(publicDir, "fire.gif");
  if (fs.existsSync(gifPath)) {
    try {
      await sharp(gifPath)
        .webp({ quality: 80 })
        .toFile(path.join(publicDir, "fire.webp"));
      console.log("Converted fire.gif to WebP");
    } catch (e) {
      console.log("GIF animation not supported by sharp, skipping");
    }
  }
  
  console.log("Done!");
}

convert().catch(console.error);
