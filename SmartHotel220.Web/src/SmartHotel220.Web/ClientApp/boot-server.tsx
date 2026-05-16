import * as React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { replace } from 'react-router-redux';
import { createMemoryHistory } from 'history';
import { createServerRenderer, RenderResult } from 'aspnet-prerendering';
import { routes } from './routes';
import configureStore from './configureStore';

// Серверный пререндеринг (асинхронно)
export default createServerRenderer(params => {
    return new Promise<RenderResult>((resolve, reject) => {
        // Подготавливаем хранилище Redux с историей в памяти и отправляем навигационное событие
        // соответствующее входящему URL-адресу
        const basename = params.baseUrl.substring(0, params.baseUrl.length - 1); // Удалить конечную косую черту
        const urlAfterBasename = params.url.substring(basename.length);
        const store = configureStore(createMemoryHistory());
        store.dispatch(replace(urlAfterBasename));

        // Подготавливаем экземпляр приложения и выполняем начальную визуализацию, 
        // которая приведет к вызову каких-либо асинхронных задач (например, доступа к данным)
        const routerContext: any = {};
        const app = (
            <Provider store={store}>
                <StaticRouter basename={basename} context={routerContext} location={params.location.path} children={routes} />
            </Provider>
        );
        renderToString(app);

        // Если есть перенаправление, просто отправляем эту информацию обратно на хост приложения
        if (routerContext.url) {
            resolve({ redirectUrl: routerContext.url });
            return;
        }
        
        // После выполнения каких-либо асинхронных задач мы можем выполнить окончательный рендеринг
        // Мы также отправляем состояние хранилища redux, поэтому клиент может продолжить выполнение, когда сервер остановился
        params.domainTasks.then(() => {
            resolve({
                html: renderToString(app),
                globals: { initialReduxState: store.getState() }
            });
        }, reject); // Также распространять любые ошибки обратно на хост приложения
    });
})