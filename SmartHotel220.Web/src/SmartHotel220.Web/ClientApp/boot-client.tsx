import './scss/site.scss';
import 'bootstrap';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { createBrowserHistory } from 'history';
import configureStore from './configureStore';
import { IApplicationState as ApplicationState } from './store';
import * as RoutesModule from './routes';

let routes = RoutesModule.routes;

// Создаем историю браузера для использования в хранилище Redux
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href')!;
const history = createBrowserHistory({ basename: baseUrl });

// Получаем экземпляр хранилища в приложении, предварительно заполняющий состояние с сервера, если он доступен.
const initialState = (window as any).initialReduxState as ApplicationState;
const store = configureStore(history, initialState);

function renderApp() {
    // Этот код запускает приложение React, когда он запускается в браузере. Он настраивает конфигурацию маршрутизации
    // и внедряет приложение в элемент DOM.
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <ConnectedRouter history={history} children={routes} store={store} />
            </Provider>
        </AppContainer>,
        document.getElementById('react-app')
    );
}

renderApp();

// Разрешить замену hot-модулем
if (module.hot) {
    module.hot.accept('./routes', () => {
        routes = require<typeof RoutesModule>('./routes').routes;
        renderApp();
    });
}
