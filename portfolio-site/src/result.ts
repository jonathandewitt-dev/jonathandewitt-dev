export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = unknown> = Ok<T> | Err<E>;
export type AsyncResult<T, E = unknown> = Promise<Result<T, E>>;

/** Captures a throwing operation so callers must handle its failure explicitly. */
export const safeTry = <T>(operation: () => T): Result<T> => {
	try {
		return { ok: true, value: operation() };
	} catch (error) {
		return { ok: false, error };
	}
};

/** Captures synchronous throws and promise rejections through the same result contract. */
export const asyncSafeTry = async <T>(operation: () => T | PromiseLike<T>): AsyncResult<T> => {
	try {
		return { ok: true, value: await operation() };
	} catch (error) {
		return { ok: false, error };
	}
};
