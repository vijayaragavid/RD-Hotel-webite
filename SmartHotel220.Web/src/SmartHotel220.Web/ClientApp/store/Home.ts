import { Reducer } from 'redux';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { addTask } from 'domain-task';
import * as Search from './Search';

// Интерфейс описывает клиента, который озывается о компании
// Testimonial - рекомендация
interface ITestimonial {
    customerName: string;
    text: string;
}

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Состоянии главной страницы
export interface IHomeState {
    testimonial: ITestimonial;
    isLoading: boolean;
}

// Начальное состояние
const initialState: IHomeState = {
    testimonial: {} as ITestimonial,
    isLoading: false
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Запрос рекомендации
interface IRequestTestimonialAction { type: 'REQUEST_TESTIMONIAL_ACTION' }
// Получение рекомендации
interface IReceiveTestimonialAction { type: 'RECEIVE_TESTIMONIAL_ACTION', testimonial: ITestimonial }

// Известные действия
type KnownAction = IRequestTestimonialAction | IReceiveTestimonialAction;

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Запрос рекомендации
    requestTestimonial: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`/api/Testimonials`)
            .then(response => response.json() as Promise<ITestimonial>)
            .then(data => {
                dispatch({ type: 'RECEIVE_TESTIMONIAL_ACTION', testimonial: data });
            });

        // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
        addTask(fetchTask);

        dispatch({ type: 'REQUEST_TESTIMONIAL_ACTION' });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IHomeState> = (state: IHomeState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_TESTIMONIAL_ACTION':
            return { ...state, isLoading: true };

        case 'RECEIVE_TESTIMONIAL_ACTION':
            return { ...state, isLoading: false, testimonial: action.testimonial };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}