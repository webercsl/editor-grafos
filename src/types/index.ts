import { NodeObject, LinkObject } from 'force-graph';

export interface CustomNodeObject extends NodeObject {
    id: string;
    name: string;
    color?: string;
    __bckgDimensions?: [number, number];
}

export interface CustomLinkObject extends LinkObject {
    source: string | CustomNodeObject;
    target: string | CustomNodeObject;
    weight: number;
    color?: string;
}

export interface GraphCanvasHandle {
    zoomToElement: (element: CustomNodeObject | CustomLinkObject) => void;
    reheatSimulation: () => void;
    resizeCanvas?: () => void;
}