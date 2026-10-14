export type OrbitGesture = {
	origin: number | null;
	startX: number;
	startY: number;
	startRotation: number;
	rotation: number;
	cancelled: boolean;
	dragging: boolean;
};

type OrbitMovement = { x: number; y: number; item: number | null; width: number; limit: number };

/** Advances a drag while preserving cancellation for the remainder of the press. */
export const moveOrbitGesture = (gesture: OrbitGesture, movement: OrbitMovement): OrbitGesture => {
	const dragging = gesture.dragging || Math.hypot(movement.x - gesture.startX, movement.y - gesture.startY) >= 6;
	const limit = Math.max(0, movement.limit);
	const rotation =
		dragging && movement.width > 0
			? Math.max(
					-limit,
					Math.min(limit, gesture.startRotation + ((movement.x - gesture.startX) * 2 * limit) / movement.width),
				)
			: gesture.rotation;
	return {
		...gesture,
		rotation,
		dragging,
		cancelled: gesture.cancelled || gesture.origin !== movement.item || dragging,
	};
};

/** Returns the destination only for an uninterrupted press and release on the same item. */
export const finishOrbitGesture = (gesture: OrbitGesture, item: number | null): number | null =>
	gesture.origin !== null && gesture.origin === item && gesture.cancelled === false && gesture.dragging === false
		? gesture.origin
		: null;
