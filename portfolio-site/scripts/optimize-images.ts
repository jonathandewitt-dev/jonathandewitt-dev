import { mkdir, readdir, unlink } from 'node:fs/promises';
import { parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = new URL('../_image-sources/', import.meta.url);
const destination = new URL('../src/assets/', import.meta.url);

try {
	await mkdir(new URL('projects/', destination), { recursive: true });
	const generated = new Set<string>();
	for (const filename of await readdir(new URL('projects/', source))) {
		const input = fileURLToPath(new URL(`projects/${filename}`, source));
		const { width } = await sharp(input).metadata();
		if (width === undefined) throw new Error(`Missing image width: ${filename}`);
		const widths = [...new Set([384, 768, Math.min(width, 1152)])].filter((size) => size <= width);
		for (const variant of [
			...widths.map((size) => ({ size, height: Math.round((size * 9) / 16), suffix: '' })),
			...[192, 384, 576].map((size) => ({ size, height: (size * 5) / 6, suffix: '-card' })),
		]) {
			const name = `${parse(filename).name}${variant.suffix}-${variant.size}.webp`;
			const output = new URL(`projects/${name}`, destination);
			const result = await sharp(input)
				.resize({ width: variant.size, height: variant.height, fit: 'cover', kernel: 'lanczos3' })
				.sharpen({ sigma: 0.5 })
				.webp({ lossless: variant.suffix === '-card', quality: 90, smartSubsample: true, effort: 6 })
				.toFile(fileURLToPath(output));
			generated.add(name);
			console.log(`${output.pathname}: ${result.size} bytes`);
		}
	}
	for (const filename of await readdir(new URL('projects/', destination))) {
		if (filename.endsWith('.webp') && generated.has(filename) === false) {
			await unlink(new URL(`projects/${filename}`, destination));
		}
	}
	for (const width of [1280, 1920, 2560, 3840]) {
		const output = new URL(`orion-nebula-${width}.webp`, destination);
		const result = await sharp(fileURLToPath(new URL('orion-nebula.jpg', source)))
			.resize({ width, withoutEnlargement: true })
			.webp({ quality: 83, smartSubsample: true, effort: 6 })
			.toFile(fileURLToPath(output));
		console.log(`${output.pathname}: ${result.size} bytes`);
	}
} catch (error) {
	console.error('Image optimization failed:', error);
	process.exitCode = 1;
}
