import {render} from './ssg';
// @ts-ignore
import routes from './pages/react-aria/**/*.mdx?async=true&flat=true';

render(routes);
