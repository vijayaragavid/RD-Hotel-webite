import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { Reducer } from 'redux';

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Описывает фичу (рекомендацию)
export interface IFeature {
    title: string | null;
    imageUrl: string | null;
    description: string | null;
}

// Еденицы измерения
type TranslationUnits = 'rem' | 'px' | 'em' | '%';
// Для передвижения карусели
export interface ITranslation {
    current: number;
    factor: number;
    units: TranslationUnits;
    styles: any;
    min: number;
    max: number;
}

// Состояние фич
export interface IFeaturesState {
    list: IFeature[];
    translation: ITranslation;
}

// Начальное состояние
const initialState: IFeaturesState = {
    list: [],
    translation: {
        current: 0,
        factor: 30,
        units: 'rem',
        styles: {},
        min: 0,
        max: 0
    }
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Запрос фич
interface IRequestFeaturesAction { type: 'REQUEST_FEATURES_ACTION' }
// Получение фич
interface IReceiveFeaturesAction { type: 'RECEIVE_FEATURES_ACTION', list: IFeature[] }
// Когда происходит свайп
interface ITranslateAction { type: 'TRANSLATE_ACTION', current: number }

// Известные действия
type KnownAction = IRequestFeaturesAction | IReceiveFeaturesAction | ITranslateAction;

// -----------------------------------------------------------------------------------------------------------------
// FUNCTIONS - Функции для повторного использования в этом коде

// Передвинуть по иксу
function createStyles(value: number, units: TranslationUnits): any {
    return {
        transform: `translateX(${value}${units})`
    }
}

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Запрос
    request: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Статический контент
        const data = [
            {
                title: null,
                imageUrl: null,
                description: null
            },
            {
                title: 'Забронировать умный зал для конференций',
                imageUrl: '/assets/images/conference_room_1.png',
                description: 'Найдите идеальное место для проведения большой встречи на высоком уровне. Войдите в систему, настройте и забронируйте номер прямо сейчас. Инструменты SmartHotel220 помогут найти именно то, что Вам нужно.'
            },
            {
                title: 'Автоматическая адаптация номера',
                imageUrl: '/assets/images/conference_room_2.png',
                description: 'Используя сенсоры и последние технологии, номер SmartHotel220 может снизить уровень освещения в солнечный день или предоставить услуги качественного питания для ваших гостей. Наши номера помогут Вам сделать обычный день необычным.'
            },
            {
                title: 'Распознавание лиц',
                imageUrl: '/assets/images/conference_room_3.png',
                description: 'Наша технология распознавания лиц SmartHotel220 обеспечит отличную информацию о вашей аудитории. Определите людей в конференц-зале по имени и получите представление о эффективности вашей презентации.'
            },
            {
                title: 'Настраивайте номер в один клик',
                imageUrl: '/assets/images/conference_room_4.png',
                description: 'Используйте приложение SmartHotel220 для настройки презентации. Создавайте и настраивайте собственную рабочую среду благодаря специальным эффектам SmartHotel220.'
            }
        ];

        dispatch({ type: 'RECEIVE_FEATURES_ACTION', list: data });
    },

    // Перевести влево (свайп влево)
    translateLeft: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Получаем состояние
        const state = getState().conferenceRoomsFeatures;
        // Текущая позиция
        let current = state.translation.current -= state.translation.factor;
        // Передвигаем
        current = current < state.translation.max ? state.translation.current += state.translation.factor : current;

        dispatch({ type: 'TRANSLATE_ACTION', current: current});
    },

    // Перевести вправо (свайп вправо)
    translateRight: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Получаем состояние
        const state = getState().conferenceRoomsFeatures;
        // Текущая позиция
        let current = state.translation.current += state.translation.factor;
        // Передвигаем
        current = current > state.translation.min ? state.translation.current -= state.translation.factor : current;

        dispatch({ type: 'TRANSLATE_ACTION', current: current });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IFeaturesState> = (state: IFeaturesState, action: KnownAction) => {
    let translation = 0;

    switch (action.type) {
        case 'REQUEST_FEATURES_ACTION':
            return { ...state };

        case 'RECEIVE_FEATURES_ACTION':
            // Длина списка
            const length = action.list.length % 2 === 0 ? action.list.length : action.list.length + 1;
            // Минимальное передвигаемое значение
            const min = ((length / 2) - 3) * state.translation.factor;
            // Максимальное передвигаемое значение
            const max = -((length / 2) - 2) * state.translation.factor;

            return {
                ...state, list: action.list, translation: { ...state.translation, min: min, max: max }
            };

        case 'TRANSLATE_ACTION':
            return { ...state, translation: { ...state.translation, current: action.current, styles: createStyles(action.current, state.translation.units) } };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}