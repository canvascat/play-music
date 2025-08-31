// import { Vibrant, WorkerPipeline } from "node-vibrant/worker";
// import PipelineWorker from "node-vibrant/worker.worker?worker";
import Color from "color";
import { Vibrant } from "node-vibrant/browser";

// Vibrant.use(new WorkerPipeline(PipelineWorker as never));
// export default async function getImageColor(
// 	src: string,
// 	type: keyof Awaited<ReturnType<Vibrant["getPalette"]>>,
// ) {
// 	const palette = await new Vibrant(src, { colorCount: 2 }).getPalette();
// 	const rgb = palette[type]?.rgb;
// 	return new Color(rgb);
// }

type Palette = Awaited<ReturnType<Vibrant["getPalette"]>>;

/**
 * https://vibrant.dev/guides/get-started/
 * @param src image url
 * @param type palette type
 * @returns
 */
export default async function getImageColor(src: string, type: keyof Palette) {
	const palette = await Vibrant.from(src).getPalette();
	const rgb = palette[type]?.rgb;
	return new Color(rgb);
}
