const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SVG_PATH = path.join(__dirname, "../public/og-image.svg");
const OUTPUT_PATH = path.join(__dirname, "../public/og-image.png");

async function generateOgImage() {
  console.log("Generating OG image PNG...");

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(SVG_PATH);

    // Convert to PNG
    await sharp(svgBuffer)
      .resize(1200, 630)
      .toFormat("png")
      .toFile(OUTPUT_PATH);

    console.log("OG image PNG generated successfully!");
  } catch (error) {
    console.error("Error generating OG image:", error);
  }
}

generateOgImage().catch(console.error);
