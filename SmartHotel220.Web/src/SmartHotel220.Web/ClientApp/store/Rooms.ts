import { fetch, addTask } from 'domain-task';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { Reducer } from 'redux';
import { settings } from '../Settings';

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Описывает номер
export interface IRoom {
    id: number;
    name: string;
    itemType: string;
    city: string;
    rating: number;
    price: number;
    picture: string;
}

// Источники
export enum Sources {
    Featured,
    Filtered
}

// Значения звёзд
export type StarValues = 1 | 2 | 3 | 4 | 5;

// Описывает фильтр
interface IFilters {
    rating: StarValues;
    minPrice: number;
    maxPrice: number;
}

// Описывает состояние номера
export interface IRoomsState {
    list: IRoom[];
    isLoading: boolean;
    filters: IFilters;
}

// Начальное состояние
const initialState: IRoomsState = {
    list: [],
    filters: {
        rating: 4,
        minPrice: 0,
        maxPrice: 1000
    },
    isLoading: false,
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Запрос рекомендуемых
interface IRequestFeaturedAction { type: 'REQUEST_FEATURED_ACTION' }
// Получение рекомендуемых
interface IReceiveFeaturedAction { type: 'RECEIVE_FEATURED_ACTION', list: IRoom[] }
// Запрос фильтрации
interface IRequestFilteredAction { type: 'REQUEST_FILTERED_ACTION' }
// Получение фильтрации
interface IReceiveFilteredAction { type: 'RECEIVE_FILTERED_ACTION', list: IRoom[] }
// Обновление цены
interface IUpdatePriceAction { type: 'UPDATE_PRICE_ACTION', minPrice: number, maxPrice: number }
// Обновление рейтинга
interface IUpdateRatingAction { type: 'UPDATE_RATING_ACTION', rating: StarValues }

// Известные действия
type KnownAction = IRequestFeaturedAction | IReceiveFeaturedAction | IRequestFilteredAction | IReceiveFilteredAction | IUpdatePriceAction | IUpdateRatingAction;

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Запрос рекомендуемых
    requestFeatured: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Запрашиваем рекомендуемые номера
        let fetchTask = fetch(`${settings.urls.hotels}Featured`)
             .then(response => response.json() as Promise<IRoom[]>)
             .then(data => {
                 dispatch({ type: 'RECEIVE_FEATURED_ACTION', list: data });
             });

         // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
         addTask(fetchTask);

         dispatch({ type: 'REQUEST_FEATURED_ACTION' });
    },

    // Запрос профильтрованных
    requestFiltered: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Получаем состояние
        const state = getState();

        // Запрашиваем отфильтрованные номера
        let fetchTask = fetch(`${settings.urls.hotels}Hotels/search?cityId=${state.search.where.value.id}&rating=${state.rooms.filters.rating}&minPrice=${state.rooms.filters.minPrice}&maxPrice=${state.rooms.filters.maxPrice}`, { method: 'GET' })
            .then(response => response.json() as Promise<IRoom[]>)
            .then(data => {
                dispatch({ type: 'RECEIVE_FILTERED_ACTION', list: data });
            });

        // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
        addTask(fetchTask);

        dispatch({ type: 'REQUEST_FILTERED_ACTION' });
    },

    // Обновление цены
    updatePrice: (minPrice: number, maxPrice: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UPDATE_PRICE_ACTION', minPrice, maxPrice });
    },

    // Обновление рейтинга
    updateRating: (rating: StarValues): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'UPDATE_RATING_ACTION', rating });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IRoomsState> = (state: IRoomsState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_FEATURED_ACTION':
            return { ...state, isLoading: true };

        case 'RECEIVE_FEATURED_ACTION':
            return { ...state, isLoading: false, list: action.list };

        case 'REQUEST_FILTERED_ACTION':
            return { ...state, isLoading: true };

        case 'UPDATE_PRICE_ACTION':
            return { ...state, filters: { ...state.filters, minPrice: action.minPrice, maxPrice: action.maxPrice } };

        case 'UPDATE_RATING_ACTION':
            return { ...state, filters: { ...state.filters, rating: action.rating } };

        case 'RECEIVE_FILTERED_ACTION':
            return { ...state, isLoading: false, list: action.list };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}