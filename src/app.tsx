
import * as React from 'react';

import { Layout } from 'antd';
const { Header, Footer, Content, Sider } = Layout;

import * as style from './app.module.scss';


export const App = () => (
    <Layout className={style.fullScreen}>
        <Header style={{ backgroundColor: '#FFFFFF' }}>
            <div>hello,world!</div>
        </Header>
    </Layout>
);
