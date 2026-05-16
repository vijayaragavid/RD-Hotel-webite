import { Reducer } from 'redux';
import { History, Location } from 'history';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Описывает состояние навигации
export interface INavMenuState {
    isHome: boolean;
}

// Начальное состояние
const initialState: INavMenuState = {
    isHome: true
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

interface INavigateAction { type: 'NAVIGATE_ACTION' }
// Домой
interface INavigateHomeAction { type: 'NAVIGATE_HOME_ACTION' }

// Известные действия
type KnownAction = INavigateAction | INavigateHomeAction ;

// -----------------------------------------------------------------------------------------------------------------
// FUNCTIONS - Функции для повторного использования в этом коде

// Проверка на главную страницу
function checkIsHome(pathname: string): boolean {
    return pathname === '/';
}

// Выбрать диспетчера
function chooseDispatcher(location: Location, dispatch: (action: KnownAction) => void): void {
    // Если это дом
    if (checkIsHome(location.pathname)) {
        dispatch({ type: 'NAVIGATE_HOME_ACTION' });
        return;
    }

    // иначе
    dispatch({ type: 'NAVIGATE_ACTION' });
}

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Слушать историю браузера
    listen: (history: History): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Выбирать диспетчер в зависимости от местоположения
        history.listen((location: Location) => chooseDispatcher(location, dispatch));
        chooseDispatcher(history.location, dispatch);
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<INavMenuState> = (state: INavMenuState, action: KnownAction) => {
    switch (action.type) {
        case 'NAVIGATE_ACTION':
            return { ...state, isHome: false };

        case 'NAVIGATE_HOME_ACTION':
            return { ...state, isHome: true };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}