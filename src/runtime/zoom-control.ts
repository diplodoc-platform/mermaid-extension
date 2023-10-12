import * as d3 from 'd3';
import MagnifierPlusIcon from '@gravity-ui/icons/svgs/magnifier-plus.svg';
import MagnifierMinusIcon from '@gravity-ui/icons/svgs/magnifier-minus.svg';
import CaretUpIcon from '@gravity-ui/icons/svgs/caret-up.svg';
import CaretDownIcon from '@gravity-ui/icons/svgs/caret-down.svg';
import CaretLeftIcon from '@gravity-ui/icons/svgs/caret-left.svg';
import CaretRightIcon from '@gravity-ui/icons/svgs/caret-right.svg';
import CircleIcon from '@gravity-ui/icons/svgs/circle.svg';

const ZOOM_SPEED = 1;
const MOVE_SPEED = 500;
const CONTROLS_CLASS = 'mermaid-zoom-menu-control';
const CONTROLS: Record<string, Control> = {
    up: ['move up', CaretUpIcon, ['KeyW', 'w'], [0, 0, 1]],
    down: ['move down', CaretDownIcon, ['KeyS', 's'], [0, 0, -1]],
    left: ['move left', CaretLeftIcon, ['KeyA', 'a'], [0, 1, 0]],
    right: ['move right', CaretRightIcon, ['KeyD', 'd'], [0, -1, 0]],
    zoomin: ['zoom in', MagnifierPlusIcon, ['KeyE', 'e'], [1, 0, 0]],
    zoomout: ['zoom out', MagnifierMinusIcon, ['KeyQ', 'q'], [-1, 0, 0]],
    reset: ['reset', CircleIcon, ['KeyR', 'r'], d3.zoomIdentity],
};

type Transform = [number, number, number];
type Control = [string, string, [string, string], Transform | d3.ZoomTransform];
type Action = keyof typeof CONTROLS;

const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));
const sum = (a1: number[], a2: number[]) => a1.map((item, index) => item + a2[index]);

const transitions = new WeakMap();
const transition = ($svg: SVGSelection, $inner: GSelection, zoom: Zoom) => {
    if (transitions.has(zoom)) {
        return transitions.get(zoom);
    }

    const actions = new Set<Action>();
    let loop: Promise<void> | null = null;

    const iterarte = async () => {
        while (actions.size) {
            const t = Date.now();

            let [dk, dx, dy] = [0, 0, 0];
            for (const action of actions) {
                const d = CONTROLS[action][3];
                if (d === d3.zoomIdentity) {
                    try {
                        await $svg.transition().call(zoom.transform, d3.zoomIdentity).end();
                    } catch {}
                } else {
                    [dk, dx, dy] = sum([dk, dx, dy], d as Transform);
                }
            }

            await raf();

            const {k} = d3.zoomTransform($inner.node() as Element);
            const dt = (Date.now() - t) / 1000;

            [dk, dx, dy] = [dk * dt * ZOOM_SPEED, dx * dt * MOVE_SPEED, dy * dt * MOVE_SPEED];

            if (dx || dy) {
                zoom.translateBy($svg, dx, dy);
            }

            if (dk) {
                zoom.scaleTo($svg, k + dk);
            }
        }
    };

    transitions.set(zoom, {
        add(action: Action) {
            actions.add(action);

            if (!loop) {
                loop = iterarte().finally(() => {
                    loop = null;
                });
            }
        },

        delete(action: Action) {
            actions.delete(action);
        },
    });

    return transitions.get(zoom);
};

export const attachKeyboard = ($svg: SVGSelection, $inner: GSelection, zoom: Zoom) => {
    const ts = transition($svg, $inner, zoom);

    const keys: Record<string, Action> = Object.keys(CONTROLS).reduce(
        (acc, key) => {
            const control = CONTROLS[key] as Control;
            const bind = control[2][0];

            acc[bind] = key;

            return acc;
        },
        {} as Record<string, Action>,
    );

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
            return;
        }

        const action = keys[event.code];
        if (action) {
            event.preventDefault();
            ts.add(action);
        }
    };

    const handleKeyup = (event: KeyboardEvent) => {
        const action = keys[event.code];
        if (action) {
            event.preventDefault();
            ts.delete(action);
        }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);

    return () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('keyup', handleKeyup);
    };
};

export const attachMenu = (
    container: HTMLElement,
    $svg: SVGSelection,
    $inner: GSelection,
    zoom: Zoom,
) => {
    const ts = transition($svg, $inner, zoom);

    const build = document.createElement('div');
    const buttons = Object.keys(CONTROLS)
        .map((key) => [key, ...CONTROLS[key]])
        .reduce(
            (acc, [name, title, icon]) =>
                acc +
                `
            <div class="${CONTROLS_CLASS}" title="${title}" data-action="${name}">
                ${icon}
            </div>`,
            '',
        );

    build.innerHTML = `
        <div class="mermaid-zoom-menu">
            <div class="mermaid-zoom-menu-controls">
                ${buttons}
            </div>
        </div>
    `;

    const menu = build.firstElementChild as HTMLElement;

    let controlActive: Action | null = null;
    const resetTransition = () => {
        ts.delete(controlActive);
        controlActive = null;
        document.removeEventListener('mouseup', resetTransition, true);
    };

    const handleControlClick = async (event: MouseEvent) => {
        // Disable external text selection
        if (event.detail > 1) {
            event.preventDefault();
        }

        const element = (event.target as HTMLElement).closest('.mermaid-zoom-menu-control');

        if (!element) {
            return;
        }

        controlActive = (element as HTMLElement).dataset.action as Action;
        ts.add(controlActive as Action);
        document.addEventListener('mouseup', resetTransition, true);
    };

    menu.addEventListener('mousedown', handleControlClick);
    container.appendChild(menu);

    return () => {
        resetTransition();
        container.removeChild(menu);
        menu.removeEventListener('mousedown', handleControlClick);
    };
};
