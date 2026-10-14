export type Route = {
	label: string;
	href: string;
};

/**
 * The site's primary destinations. Order is meaningful: page transitions travel left or right
 * depending on whether a navigation moves toward the end of this list or back toward its start.
 */
export const routes: Route[] = [
	{ label: 'Home', href: '/' },
	{ label: 'Blog', href: '/blog' },
	{ label: 'About Me', href: '/about' },
	{ label: 'My Work', href: '/work' },
	{ label: 'Resume', href: '/resume' },
	{ label: 'Contact Me', href: '/contact' },
];

/** Position of a pathname in `routes`, or -1 when it is not one of them. */
export const routeIndex = (pathname: string): number => {
	const path = pathname.replace(/\/$/, '') || '/';
	return routes.findIndex((route) => route.href === path);
};
