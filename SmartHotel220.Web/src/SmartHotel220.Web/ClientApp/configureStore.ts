import { createStore, applyMiddleware, compose, combineReducers, GenericStoreEnhancer, Store, StoreEnhancerStoreCreator, ReducersMapObject } from 'redux';
import thunk from 'redux-thunk';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import persistState  from 'redux-localstorage';
import * as StoreModule from './store';
import { IApplicationState as ApplicationState, reducers } from './store';
import { History } from 'history';

// Настройка хранилища Redux
export default function configureStore(history: History, initialState?: ApplicationState) {
    const windowIfDefined = typeof window === 'undefined' ? null : window as any;

    // Если devTools установлен, подключитесь к нему
    const devToolsExtension = windowIfDefined && windowIfDefined.devToolsExtension as () => GenericStoreEnhancer;

    // Построение промежуточного программного обеспечения (middleware).
    // Это функции, которые могут обрабатывать действия до того, как они достигнут хранилища
    const createStoreWithMiddleware = compose(
        applyMiddleware(thunk, routerMiddleware(history)),
        devToolsExtension ? devToolsExtension() : <S>(next: StoreEnhancerStoreCreator<S>) => next,
        persistState()
    )(createStore);
    
    // Объединяем все reducers и создаем экземпляр хранилища в приложении
    const allReducers = buildRootReducer(reducers);
    const store = createStoreWithMiddleware(allReducers, initialState) as Store<ApplicationState>;

    // Включаем Webpack hot module для reducers
    if (module.hot) {
        module.hot.accept('./store', () => {
            const nextRootReducer = require<typeof StoreModule>('./store');
            store.replaceReducer(buildRootReducer(nextRootReducer.reducers));
        });
    }

    return store;
}

function buildRootReducer(allReducers: ReducersMapObject) {
    return combineReducers<ApplicationState>(Object.assign({}, allReducers, { routing: routerReducer }));
}
