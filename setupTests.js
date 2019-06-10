// setup file
import 'jest-dom/extend-expect';
import Adapter from 'enzyme-adapter-react-16';
import {configure} from 'enzyme';

configure({adapter: new Adapter()});
