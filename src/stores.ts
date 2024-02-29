import { writable } from 'svelte/store';

export const booleans = writable({} as {[id: string]: boolean});
export const integers = writable({} as {[id: string]: number});
export const strings = writable({} as {[id: string]: string});

var booleanValues: {[id: string]: boolean};
var integerValues: {[id: string]: number};
var stringValues: {[id: string]: string};

booleans.subscribe(v => booleanValues = v);
integers.subscribe(v => integerValues = v);
strings.subscribe(v => stringValues = v);

export function getStoreBoolean(id: string): boolean {
    return booleanValues[id];
}

export function setStoreBoolean(id: string, value: boolean) {
    booleans.update(v => {
        v[id] = value;
        return v;
    });
}

export function getStoreInteger(id: string): number {
    return integerValues[id];
}

export function setStoreInteger(id: string, value: number) {
    integers.update(v => {
        v[id] = value;
        return v;
    });
}

export function getStoreString(id: string): string {
    return stringValues[id];
}

export function setStoreString(id: string, value: string) {
    strings.update(v => {
        v[id] = value;
        return v;
    });
}

console.log('abc');