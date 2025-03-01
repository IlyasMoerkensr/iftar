const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SVG_PATH = path.join(__dirname, "../public/og-image.svg");
const SIMPLE_SVG_PATH = path.join(__dirname, "../public/og-image-simple.svg");
const OUTPUT_PATH_PNG = path.join(__dirname, "../public/og-image.png");
const OUTPUT_PATH_JPG = path.join(__dirname, "../public/og-image.jpg");
const SIMPLE_OUTPUT_PATH_JPG = path.join(
  __dirname,
  "../public/og-image-simple.jpg"
);

async function generateOgImage() {
  console.log("Generating OG images...");

  try {
    // Read the SVG files
    const svgBuffer = fs.readFileSync(SVG_PATH);
    const simpleSvgBuffer = fs.readFileSync(SIMPLE_SVG_PATH);

    // Convert to PNG
    await sharp(svgBuffer)
      .resize(1200, 630)
      .toFormat("png")
      .toFile(OUTPUT_PATH_PNG);

    console.log("OG image PNG generated successfully!");

    // Convert to JPEG (better compatibility with Facebook)
    await sharp(svgBuffer)
      .resize(1200, 630)
      .toFormat("jpeg", { quality: 90 })
      .toFile(OUTPUT_PATH_JPG);

    console.log("OG image JPEG generated successfully!");

    // Generate simple version (even better compatibility)
    await sharp(simpleSvgBuffer)
      .resize(1200, 630)
      .toFormat("jpeg", { quality: 90 })
      .toFile(SIMPLE_OUTPUT_PATH_JPG);

    console.log("Simple OG image JPEG generated successfully!");
  } catch (error) {
    console.error("Error generating OG images:", error);
  }
}

generateOgImage().catch(console.error);
