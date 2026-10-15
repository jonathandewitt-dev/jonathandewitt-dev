import { View } from 'thunderous-csr';
import { Page } from './components/page';
import { Feature } from './components/feature';
import { OrbitNav } from './components/orbit-nav';
import { ProjectList, ProjectItem } from './components/project-list';
import { PageHeading } from './components/page-heading';
import { Crumb } from './components/crumb';
import { Content } from './components/content';
import { Cosmos } from './components/cosmos';
import { Section } from './components/section';
import { Link } from './components/link';
import { List, ListItem } from './components/list';
import { CardGrid, Card } from './components/card-grid';
import { Blockquote } from './components/blockquote';
import { DescriptionList, DescriptionItem } from './components/description-list';
import { startMotion } from './motion';
import { startNavDirection } from './nav-direction';
import { startNavigationRequests } from './navigation-request';
import { startOrbitPosition } from './orbit-position';

/*
 * Initialize shared state before elements mount so direct loads start at their destination.
 * These services live for the whole page; the guard keeps browser APIs out of static generation.
 */
if (typeof window !== 'undefined') {
	startMotion();
	startNavDirection();
	startNavigationRequests();
	startOrbitPosition();
}

View.define('t-view');
Page.define('x-page');
Feature.define('x-feature');
OrbitNav.define('x-orbit-nav');
PageHeading.define('x-page-heading');
Crumb.define('x-crumb');
Content.define('x-content');
Cosmos.define('x-cosmos');
Section.define('x-section');
Link.define('x-link');
List.define('x-list');
ListItem.define('x-list-item');
CardGrid.define('x-card-grid');
Card.define('x-card');
Blockquote.define('x-blockquote');

DescriptionList.define('x-description-list');
DescriptionItem.define('x-description-item');

ProjectList.define('x-project-list');
ProjectItem.define('x-project-item');
