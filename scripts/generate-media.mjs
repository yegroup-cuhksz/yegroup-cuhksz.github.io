#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const projectRoot = process.cwd();
const inputDir = path.join(projectRoot, 'public', 'assets', 'images');
const outputDir = path.join(projectRoot, 'public', 'media');
const widths = [360, 640, 960, 1400, 2000];
const rasterPattern = /\.(?:jpe?g|png|webp)$/i;

function safeStem(relativePath) {
  return relativePath
    .replace(/\.[^.]+$/, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function collectRasterFiles(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRasterFiles(fullPath, baseDir)));
    } else if (entry.isFile() && rasterPattern.test(entry.name)) {
      files.push(path.relative(baseDir, fullPath).split(path.sep).join('/'));
    }
  }
  return files;
}

async function main() {
  await fs.access(inputDir);

  const files = (await collectRasterFiles(inputDir)).sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No raster source images found in ${inputDir}`);
  }

  const stems = new Map();
  const outputStems = new Map();
  for (const relativePath of files) {
    const extension = path.extname(relativePath).slice(1).toLowerCase();
    const stem = `${safeStem(relativePath) || 'image'}-${extension}`;
    const existingSource = outputStems.get(stem);
    if (existingSource) {
      throw new Error(
        `Generated media name collision for "${relativePath}" and "${existingSource}" (both would use "${stem}"). ` +
          'Rename one of the original files so derivatives cannot overwrite each other.',
      );
    }
    outputStems.set(stem, relativePath);
    stems.set(relativePath, stem);
  }

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const manifest = {
    generated_by: 'scripts/generate-media.mjs',
    widths,
    images: {},
  };

  for (const relativePath of files) {
    const inputPath = path.join(inputDir, ...relativePath.split('/'));
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Could not determine dimensions for ${relativePath}`);
    }
    const rotated = (metadata.orientation ?? 1) >= 5;
    const originalWidth = rotated ? metadata.height : metadata.width;
    const originalHeight = rotated ? metadata.width : metadata.height;
    const stem = stems.get(relativePath);
    if (!stem) throw new Error(`No generated media name was prepared for ${relativePath}`);
    const variantWidths = [...new Set([...widths, originalWidth])]
      .filter((width) => width <= originalWidth)
      .sort((a, b) => a - b);
    const variants = [];

    for (const width of variantWidths) {
      const outputName = `${stem}-${width}.webp`;
      const outputPath = path.join(outputDir, outputName);
      const info = await sharp(inputPath)
        .rotate()
        .resize({ width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(outputPath);
      const stats = await fs.stat(outputPath);
      variants.push({
        width: info.width,
        height: info.height,
        src: `/media/${outputName}`,
        bytes: stats.size,
      });
    }

    const sourceKey = `assets/images/${relativePath}`;
    manifest.images[sourceKey] = {
      source: `/assets/images/${relativePath}`,
      width: originalWidth,
      height: originalHeight,
      format: metadata.format ?? path.extname(relativePath).slice(1),
      bytes: (await fs.stat(inputPath)).size,
      variants,
    };
    console.log(`generated ${relativePath} (${variants.length} WebP variants)`);
  }

  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
  console.log(`Wrote ${files.length} image records to public/media/manifest.json`);
}

main().catch((error) => {
  console.error(`Media generation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
