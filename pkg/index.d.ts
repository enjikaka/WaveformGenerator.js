type Options = {
    waveformWidth: number;
    waveformHeight: number;
    waveformColor: string;
    barAlign: string;
    barWidth: number;
    barGap: number;
    drawMode: "png" | "svg";
};
declare class WaveformGenerator {
    #private;
    constructor(fileArrayBuffer: ArrayBuffer);
    /**
     * Generate the waveform.
     */
    getWaveform(options?: Options): Promise<string>;
    generateSVGStylesheet(): HTMLStyleElement;
    drawBarToCanvas(x: number, y: number, barHeight: number): void;
    drawBarToSVG(x: number, y: number, barHeight: number): void;
    drawBar({ position, height }: {
        position: number;
        height: number;
    }): void;
    bufferMeasure(position: number, length: number, data: Float32Array<ArrayBufferLike>): number;
    drawWaveform(audioBuffer: AudioBuffer): void;
}
export default WaveformGenerator;
