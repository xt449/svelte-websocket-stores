export function lerp(min: number, max: number, alpha: number): number {
	return min + alpha * (max - min);
}
