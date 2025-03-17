import { derived, get, type Updater, type Writable } from "svelte/store";

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
		// return undefined if any value along path is null, undefined, or not an object
		if (target == null || typeof target != "object") {
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
 * @returns modified root
 */
export function setAtPath(root: Json | undefined, path: Path, value: Json | undefined): Json | undefined {
	// return value if path is empty
	if(path.length === 0) {
		return value;
	}

	// initialize root if null, undefined, or not an object
	if(root == null || typeof root != "object") {
		if(typeof path[0] == "string") {
			root = {};
		} else {
			root = [];
		}
	}

	let target = root as Record<string | number, Json | undefined>;

	// iterate over path except for last step
	for (let i = 0; i < path.length - 1; i++) {
		const pathStep = path[i];

		// initialize next target if value along path is null, undefined, or not an object
		if (target[pathStep] == null || typeof target[pathStep] != "object") {
			if(typeof path[i + 1] == "string") {
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

export function derivedFromPath(root: Writable<Json | undefined>, path: Path, defaultValue?: Json): Writable<Json | undefined> {
	const readable = derived(root, rootValue => {
		return getAtPath(rootValue, path);
	});

	function set(newValue: Json | undefined) {
		root.update(rootValue => {
			return setAtPath(rootValue, path, newValue);
		});
	}

	function update(updater: Updater<Json | undefined>) {
		set(updater(getAtPath(get(root), path)));
	}

	// Initialize default value
	if(defaultValue !== undefined && getAtPath(get(root), path) === undefined) {
		set(defaultValue);
	}

	return { ...readable, set, update };
};
