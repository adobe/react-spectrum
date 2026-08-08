// @ts-ignore
import routes from './pages/s2/**/*.mdx?async=true&flat=true';
import {render} from './ssg';

render(routes);
