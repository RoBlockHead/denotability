export type Coordinate = { x: number, y: number };
export type Curve = {
    uuid: string,
    color: string,
    numPoints: number,
    points: Coordinate[]
};
export type Note = {
    hasAudio?: boolean,
    audioFilePaths?: string[],
    template: {
        enabled: boolean,
        path: string | undefined,
    },
    curves: Curve[],
}