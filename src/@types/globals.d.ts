import type { Selection, ZoomBehavior, BaseType } from 'd3';
import type { ExposedAPI } from '../types';

declare global {
    const PACKAGE: string;

    interface Window {
        mermaidJsonp: Callback[];
    }

    type SVGSelection = Selection<SVGSVGElement, any, BaseType, any>;

    type GSelection = Selection<SVGGElement, any, any, any>;

    type Zoom = ZoomBehavior<SVGSVGElement, any>;

    type Callback = (exposed: ExposedAPI) => void | Promise<void>;
}
