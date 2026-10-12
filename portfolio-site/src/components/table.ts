import { css, customElement, html } from 'thunderous';

// CSS table layout works across the flattened slot tree. Each host owns its
// layout and default accessibility role; no native table parser can reparent the children.
export const Table = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'table';
	});
	adoptStyleSheet(tableStyles);
	return html`<slot></slot>`;
});

export const TableRowGroup = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'rowgroup';
	});
	adoptStyleSheet(groupStyles);
	return html`<slot></slot>`;
});

export const TableRow = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'row';
	});
	adoptStyleSheet(rowStyles);
	return html`<slot></slot>`;
});

export const TableHeader = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'columnheader';
	});
	adoptStyleSheet(cellStyles);
	adoptStyleSheet(headerStyles);
	return html`<div class="heading"><slot></slot></div>`;
});

export const TableCell = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'cell';
	});
	adoptStyleSheet(cellStyles);
	return html`<slot></slot>`;
});

const tableStyles = css`
	:host {
		display: table;
		color: inherit;
		text-align: left;
		vertical-align: top;
		border: 1px solid;
		padding: 0.5rem;
		border-collapse: collapse;
		font-size: smaller;
	}
`;
const groupStyles = css`
	:host {
		display: table-row-group;
	}
`;
const rowStyles = css`
	:host {
		display: table-row;
	}
`;
const cellStyles = css`
	:host {
		display: table-cell;
		color: inherit;
		text-align: left;
		vertical-align: top;
		border: 1px solid;
		padding: 0.5rem;
	}
`;
const headerStyles = css`
	.heading {
		display: grid;
		gap: 0.25rem;
	}

	:host {
		font-weight: bold;
		white-space: nowrap;
	}
`;
