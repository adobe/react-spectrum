import {render} from './ssg';
// @ts-ignore
import routes from './pages/s2/**/*.mdx?async=true&flat=true';

render(routes);
