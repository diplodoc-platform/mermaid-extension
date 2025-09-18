import type {BaseType, Selection as D3Selection, D3ZoomEvent, ZoomBehavior} from 'd3';
import type {ExposedAPI} from '../types';

declare global {
    const PACKAGE: string;

    interface Window {
        mermaidJsonp: Callback[];
    }

    type Hash<T = unknown> = Record<string, T>;

    type SVGSelection = D3Selection<SVGSVGElement, unknown, BaseType, unknown>;

    type GSelection = D3Selection<SVGGElement, unknown, unknown, unknown>;

    type Zoom = ZoomBehavior<SVGSVGElement, unknown>;

    type ZoomEvent = D3ZoomEvent<SVGSVGElement, unknown>;

    type Callback = (exposed: ExposedAPI) => void | Promise<void>;
}
