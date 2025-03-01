const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SVG_PATH = path.join(__dirname, "../public/favicon.svg");
const ICONS_DIR = path.join(__dirname, "../public/icons");

// Ensure the icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Define the icon sizes to generate
const sizes = [
  { name: "icon-16.png", size: 16 },
  { name: "icon-32.png", size: 32 },
  { name: "icon-64.png", size: 64 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-icon-180.png", size: 180 },
  { name: "favicon.ico", size: 32 },
];

// Read the SVG file
const svgBuffer = fs.readFileSync(SVG_PATH);

// Generate each icon
async function generateIcons() {
  console.log("Generating icons...");

  for (const { name, size } of sizes) {
    const outputPath = path.join(ICONS_DIR, name);

    try {
      if (name.endsWith(".ico")) {
        // For ICO files, we need to convert to PNG first
        await sharp(svgBuffer)
          .resize(size, size)
          .toFormat("png")
          .toFile(path.join(ICONS_DIR, "temp-favicon.png"));

        // Then convert PNG to ICO using sharp
        await sharp(path.join(ICONS_DIR, "temp-favicon.png")).toFile(
          path.join(__dirname, "../public", name)
        );

        // Remove the temporary file
        fs.unlinkSync(path.join(ICONS_DIR, "temp-favicon.png"));
      } else {
        // For PNG files
        await sharp(svgBuffer)
          .resize(size, size)
          .toFormat("png")
          .toFile(outputPath);
      }

      console.log(`Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating ${name}:`, error);
    }
  }

  console.log("Icon generation complete!");
}

generateIcons().catch(console.error);
