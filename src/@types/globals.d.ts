import type {BaseType, Selection as D3Selection, ZoomBehavior} from 'd3';
import type {ExposedAPI} from '../types';

declare global {
    const PACKAGE: string;

    interface Window {
        mermaidJsonp: Callback[];
    }

    type SVGSelection = D3Selection<SVGSVGElement, any, BaseType, any>;

    type GSelection = D3Selection<SVGGElement, any, any, any>;

    type Zoom = ZoomBehavior<SVGSVGElement, any>;

    type Callback = (exposed: ExposedAPI) => void | Promise<void>;
}
