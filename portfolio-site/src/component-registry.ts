import { View } from 'thunderous-csr';
import { Page } from './components/page';
import { Crumb } from './components/crumb';
import { Content } from './components/content';
import { Section } from './components/section';
import { Link } from './components/link';
import { List, ListItem } from './components/list';
import { Table, TableRowGroup, TableRow, TableHeader, TableCell } from './components/table';
import { Blockquote } from './components/blockquote';
import { DescriptionList, DescriptionItem } from './components/description-list';

View.define('t-view');
Page.define('x-page');
Crumb.define('x-crumb');
Content.define('x-content');
Section.define('x-section');
Link.define('x-link');
List.define('x-list');
ListItem.define('x-list-item');
Table.define('x-table');
TableRowGroup.define('x-table-row-group');
TableRow.define('x-table-row');
TableHeader.define('x-table-header');
TableCell.define('x-table-cell');
Blockquote.define('x-blockquote');

DescriptionList.define('x-description-list');
DescriptionItem.define('x-description-item');
