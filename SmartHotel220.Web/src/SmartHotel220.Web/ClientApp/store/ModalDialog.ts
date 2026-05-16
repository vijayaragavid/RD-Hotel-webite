import { Reducer } from 'redux';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Описывает состояние модального диалога
export interface IModalDialogState {
    isModalOpen: boolean;
    onRef?: any;
}

// Начальное состояние
const initialState: IModalDialogState = {
    isModalOpen: true
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Инициализация
interface INitAction { type: 'INIT_ACTION' }
// Открытие диалога
interface IOpenModalAction { type: 'OPEN_MODAL_ACTION' }
// Закрытие диалога
interface ICloseModalAction { type: 'CLOSE_MODAL_ACTION' }

// Известные действия
type KnownAction = INitAction | IOpenModalAction | ICloseModalAction;

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Инициализация
    init: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let state = getState().modalDialog;
        dispatch({ type: 'INIT_ACTION' });
    },

    // Открыть
    open: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'OPEN_MODAL_ACTION' });
    },

    // Закрыть
    close: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'CLOSE_MODAL_ACTION' });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IModalDialogState> = (state: IModalDialogState, action: KnownAction) => {
    switch (action.type) {
        case 'INIT_ACTION':
            return { ...state, isModalOpen: false };

        case 'OPEN_MODAL_ACTION':
            return { ...state, isModalOpen: true };

        case 'CLOSE_MODAL_ACTION':
            return { ...state, isModalOpen: false };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}