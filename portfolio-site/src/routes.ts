/**
 * The site's primary destinations, in the order they appear on the orbit ring.
 *
 * The order is meaningful beyond rendering: page transitions travel left or right depending
 * on whether you are moving toward the end of this list or back toward its start, so this is
 * the single source both the nav and the transition direction read from.
 */
export type Route = {
	label: string;
	href: string;
};

export const routes: Route[] = [
	{ label: 'Home', href: '/' },
	{ label: 'About Me', href: '/about' },
	{ label: 'My Work', href: '/work' },
	{ label: 'Contact Me', href: '/contact' },
];

/** Position of a pathname in `routes`, or -1 when it is not one of them. */
export const routeIndex = (pathname: string): number => {
	const path = pathname.replace(/\/$/, '') || '/';
	return routes.findIndex((route) => route.href === path);
};
