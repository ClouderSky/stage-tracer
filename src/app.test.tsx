
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from './app';


it('正常启动', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});
