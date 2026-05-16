import { Reducer } from 'redux';
import * as moment from 'moment';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { settings } from '../Settings';
import { fetch, addTask } from 'domain-task';

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Опции
export enum Option {
    Where,
    When,
    Guests,
    People
}

// Вкладки
export enum Tab {
    Smart,
    Conference
}

// Гости
export enum Guest {
    Adults,
    Kids,
    Babies
}

// Описывает ввод значения по конкретному типу
interface INput<T> {
    value: T;
    list: T[];
}

// Город
export class City {
    constructor(
        public id?: number,
        public name?: string,
        public country?: string) {}
}

// Гости
export class Guests {
    constructor(
        public adults: number,
        public kids: number,
        public baby: number,
        public rooms: number,
        public work?: boolean,
        public pet?: boolean) { }
}

// Люди
export class People {
    constructor(
        public total: number) { }
}

// Даты
export class Dates {
    constructor(
        public startDate?: moment.Moment,
        public endDate?: moment.Moment,
        public isStartDateSelected = false,
        public isEndDateSelected = false
    ) { }

    // Начальная дата полностью
    public get startFull(): string {
        return this.startDate ? `${this.startDate.format('DD MMM')}` : '';
    }

    // Конечная дата полностью
    public get endFull(): string {
        return this.endDate ? `${this.endDate.format('DD MMM')}` : '';
    }

    // Конечная дата полностью в комплексе
    public get endFullComplex(): string {
        return this.endDate ? `${this.endDate.format('dd, MMM DD, YYYY')}` : '';
    }
}

// Состояние поиска
export interface ISearchState {
    isLoading: boolean;
    minLength: number;
    where: INput<City>;
    when: INput<Dates>;
    guests: INput<Guests>;
    people: INput<People>;
}

// Начальное состояние
const initialState: ISearchState = {
    minLength: 3,
    isLoading: false,
    where: {
        value: new City(),
        list: []
    },
    when: {
        value: new Dates(),
        list: []
    },
    guests: {
        value: new Guests(1, 0, 0, 1, false),
        list: []
    },
    people: {
        value: new People(1),
        list: []
    }
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Инициализация
interface INitAction { type: 'INIT_ACTION' }
// Запрос "где"
interface IRequestWhereAction { type: 'REQUEST_WHERE_ACTION' }
// Получение "где"
interface IReceiveWhereAction { type: 'RECEIVE_WHERE_ACTION', list: City[] }
// Выбор "где"
interface ISelectWhereAction  { type: 'SELECT_WHERE_ACTION', city: City }
// Сброс "где"
interface IResetWhereAction   { type: 'RESET_WHERE_ACTION' }
// Брос "когда"
interface IResetWhenAction { type: 'RESET_WHEN_ACTION' }
// Сброс гостей
interface IResetGuestsAction { type: 'RESET_GUESTS_ACTION' }
// Сброс людей
interface IResetPeopleAction { type: 'RESET_PEOPLE_ACTION' }
// Выбор "когда"
interface ISelectWhenAction { type: 'SELECT_WHEN_ACTION', next: Option, start?: moment.Moment, end?: moment.Moment }
// Выбор гостей
interface ISelectGuestsAction { type: 'SELECT_GUESTS_ACTION', adults: number, kids: number, baby: number, rooms: number, work: boolean, pet: boolean }
// Выбор людей
interface ISelectPepopleAction { type: 'SELECT_PEOPLE_ACTION', total: number }

// Известные действия
type KnownAction = INitAction | IRequestWhereAction | IReceiveWhereAction | ISelectWhereAction | IResetWhereAction | ISelectWhenAction | ISelectGuestsAction | ISelectPepopleAction | IResetWhenAction | IResetGuestsAction | IResetPeopleAction;

// -----------------------------------------------------------------------------------------------------------------
// FUNCTIONS - Функции для повторного использования в этом коде

// Получить полностью город
export function getFullCity(city: City) {
    return city.name ? `${city.name}, ${city.country}` : '';
}

// Получить полностью номера
export function getFullRooms(guests: Guests) {
    return guests.rooms > 1 ? `${guests.rooms} Номеров` : `${guests.rooms} Номер`;
}

// Получить полностью гостей
export function getFullGuests(guests: Guests) {
    return (guests.adults + guests.kids + guests.baby) > 1 ? `${guests.adults + guests.kids + guests.baby} Гостей` : `${guests.adults + guests.kids + guests.baby} Гость`;
}

// Получить номера и гостей
export function getFullRoomsGuests(guests: Guests) {
    return `${getFullRooms(guests)}, ${getFullGuests(guests)}`;
}

// Получить полностью людей
export function getFullPeople(people: People) {
    return people.total ? `${people.total} Люди` : '';
}

// Получить короткую дату
export function getShortDate(date?: moment.Moment) {
    date = moment(date).locale('ru');
    return date ? `${date.format('DD MMM')}` : '';
}

// Получить короткие даты
export function getShortDates(startDate?: moment.Moment, endDate?: moment.Moment) {
    startDate = moment(startDate).locale('ru');
    endDate = moment(endDate).locale('ru');
    return `${getShortDate(startDate)} - ${startDate === endDate ? '' : getShortDate(endDate)}`;
}

// Получить длинную дату
export function getLongDate(date: moment.Moment) {
    date = moment(date).locale('en');
    return date;
}

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Инициализация
    init: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'INIT_ACTION'});
    },

    // Поиск "где"
    searchWhere: (value: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Получаем состояние поиска
        const state = getState().search;

        // Проверка на длину
        if (value.length < state.minLength) {
            dispatch({ type: 'RECEIVE_WHERE_ACTION', list: [] });
            return;
        }

        dispatch({ type: 'RECEIVE_WHERE_ACTION', list: [] });

        // Выполняем поиск
        let fetchTask = fetch(`${settings.urls.hotels}Cities?name=${value}`)
            .then(response => response.json() as Promise<any>)
            .then(data => {
                data = data.map((item: any) => {
                    return new City(item.id, item.name, item.country);
                });
                dispatch({ type: 'RECEIVE_WHERE_ACTION', list: data });
            });

        // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
        addTask(fetchTask);

        dispatch({ type: 'REQUEST_WHERE_ACTION' });
    },

    // Выбор "где"
    selectWhere: (city: City): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SELECT_WHERE_ACTION', city: city });
    },

    // Сброс "где"
    resetWhere: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RESET_WHERE_ACTION'});
    },

    // Сброс "когда"
    resetWhen: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RESET_WHEN_ACTION' });
    },

    // Сброс гостей
    resetGuests: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RESET_GUESTS_ACTION' });
    },

    // Сброс людей
    resetPeople: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RESET_PEOPLE_ACTION' });
    },

    // Выбор начальной даты
    selectWhenStart: (date: moment.Moment): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const end = getState().search.when.value.endDate;
        dispatch({ type: 'SELECT_WHEN_ACTION', next: Option.When, start: date, end: date});
    },

    // Выбор конечной даты
    selectWhenEnd: (date: moment.Moment): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const state = getState().search;
        const start = state.when.value.startDate;
        dispatch({ type: 'SELECT_WHEN_ACTION', next: Tab.Smart === Tab.Smart ? Option.Guests : Option.People, start: (start || moment()), end: date });
    },

    // Обновление гостей, взрослые
    updateGuestsAdults: (value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const guests = getState().search.guests.value;
        dispatch({ type: 'SELECT_GUESTS_ACTION', adults: value, kids: guests.kids || 0, baby: guests.baby || 0, rooms: guests.rooms || 0, work: guests.work || false , pet: guests.pet || false});
    },

    // Обновление гостей, дети
    updateGuestsKids: (value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const guests = getState().search.guests.value;
        dispatch({ type: 'SELECT_GUESTS_ACTION', adults: guests.adults || 0, kids: value, baby: guests.baby || 0, rooms: guests.rooms || 0, work: guests.work || false, pet: guests.pet || false });
    },

    // Обновление гостей, маленькие
    updateGuestsBaby: (value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const guests = getState().search.guests.value;
        dispatch({ type: 'SELECT_GUESTS_ACTION', adults: guests.adults || 0, kids: guests.kids || 0, baby: value, rooms: guests.rooms || 0, work: guests.work || false, pet: guests.pet || false});
    },

    // Обновление гостей, номера
    updateGuestsRooms: (value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const guests = getState().search.guests.value;
        dispatch({ type: 'SELECT_GUESTS_ACTION', adults: guests.adults || 0, kids: guests.kids || 0, baby: guests.baby || 0, rooms: value, work: guests.work || false, pet: guests.pet || false });
    },

    // Обновление гостей, работа
    updateGuestsWork: (value: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const guests = getState().search.guests.value;
        dispatch({ type: 'SELECT_GUESTS_ACTION', adults: guests.adults || 0, kids: guests.kids || 0, baby: guests.baby || 0, rooms: guests.rooms || 0, work: value, pet: guests.pet || false });
    },

    // Обновление гостей, питомец
    updateGuestsPet: (value: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const guests = getState().search.guests.value;
        dispatch({ type: 'SELECT_GUESTS_ACTION', adults: guests.adults || 0, kids: guests.kids || 0, baby: guests.baby || 0, rooms: guests.rooms || 0, work: guests.work || false, pet: value});
    },

    // Обновление людей
    updatePeople: (value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SELECT_PEOPLE_ACTION', total: value || 0 });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<ISearchState> = (state: ISearchState, action: KnownAction) => {
    switch (action.type) {
        case 'INIT_ACTION': 
            return { ...state };

        case 'REQUEST_WHERE_ACTION':
            return { ...state, isLoading: true };

        case 'RECEIVE_WHERE_ACTION':
            return { ...state, isLoading: false, where: { ...state.where, list: action.list } };

        case 'SELECT_WHERE_ACTION':
            return { ...state, where: { ...state.where, value: action.city } };

        case 'RESET_WHERE_ACTION':
            return { ...state, where: { ...state.where, value: new City(), list: [] } };

        case 'SELECT_WHEN_ACTION':
            return { ...state, when: { ...state.when, value: new Dates(action.start, action.end) } };

        case 'RESET_WHEN_ACTION':
            return { ...state, when: { ...state.when, value: new Dates()} };

        case 'SELECT_GUESTS_ACTION':
            return { ...state, guests: { ...state.guests, value: new Guests(action.adults, action.kids, action.baby, action.rooms, action.work, action.pet) } };

        case 'RESET_GUESTS_ACTION':
            return { ...state, guests: { ...state.guests, value: new Guests(1, 0, 0, 1, false) } };

        case 'RESET_PEOPLE_ACTION':
            return { ...state, people: { ...state.people, value: new People(1) } };

        case 'SELECT_PEOPLE_ACTION':
            return { ...state, people: { ...state.people, value: new People(action.total) } };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}