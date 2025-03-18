export interface ReadableStore<T> {
    subscribe: (subscriber: (value: T) => void) => (() => void),
};

export interface WritableStore<T> extends ReadableStore<T> {
    set: (value: T) => void,
};

export type Path = (string | number)[];

export type Json = boolean | number | string | { [key: string]: Json } | Json[] | null;

/**
 * Gets value at {@link path} of {@link root}
 * 
 * Gets the value of an object's field
 * @returns value at {@link path} of {@link root} or undefined
 */
export function getAtPath(root: Json | undefined, path: Path): Json | undefined {
    let target = root;

    // interate over path
    for (const pathStep of path) {
        // return undefined if any value along path is not an object (arrays are objects)
        if (typeof target != "object") {
            return undefined;
        }

        // update target along path
        target = (target as Record<string | number, Json>)[pathStep];
    }

    // return final target value
    return target;
};

/**
 * Sets value at {@link path} of {@link root} to {@link value}
 * 
 * Sets the value of an object's field
 * @returns modified root (this is important if {@link root} is not an object)
 */
export function setAtPath(root: Json | undefined, path: Path, value: Json | undefined): Json | undefined {
    // return value if path is empty
    if (path.length === 0) {
        return value;
    }

    // initialize root if not an object (arrays are objects)
    if (typeof root != "object") {
        if (typeof path[0] === "string") {
            root = {};
        } else {
            root = [];
        }
    }

    let target = root as Record<string | number, Json | undefined>;

    // iterate over path except for last step
    for (let i = 0; i < path.length - 1; i++) {
        const pathStep = path[i];

        // initialize next target if value along path is not an object (arrays are objects)
        if (typeof target[pathStep] != "object") {
            if (typeof path[i + 1] === "string") {
                target[pathStep] = {};
            } else {
                target[pathStep] = [];
            }
        }

        // update target along path
        target = target[pathStep] as Record<string | number, Json>;
    }

    // set value with index for last step
    target[path[path.length - 1]] = value;

    // return updated root
    return root;
};

/**
 * WebSocket payload Message type
 */
export type Message = {
    path: Path;
    value: Json | undefined;
};

export interface WebSocketStores {
    readonly connectionState: ReadableStore<boolean>;
    start(): void;
    webSocketStore<T extends Json = Json>(path: Path, defaultValue?: T): WritableStore<T | undefined>;
};
