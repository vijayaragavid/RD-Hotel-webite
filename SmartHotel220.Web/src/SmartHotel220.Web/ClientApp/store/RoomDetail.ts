import { fetch, addTask } from 'domain-task';
import { Reducer } from 'redux';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { settings } from '../Settings';
import * as moment from 'moment';

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Описывает сервис в номере
export interface IService {
    id: number;
    name: string;
}

// Для описания словаря
interface IServicesDicionary {
    key: number;
}

// Бронь
export class Booking {
    constructor(public hotelId: number,
        public userId: string,
        public from: string,
        public to: string,
        public adults: number | 0,
        public kids: number | 0,
        public babies: number | 0,
        public roomType: number | 0,
        public price: number | 0) { }
}

// Словарь с сервисами
export const servicesDictionary: { [index: number]: string } = {
    1: 'sh-wifi',
    2: 'sh-parking',
    3: 'sh-tv',
    4: 'sh-air-conditioning',
    5: 'sh-dryer',
    6: 'sh-indoor-fireplace',
    7: 'sh-table',
    8: 'sh-breakfast',
    9: 'sh-kid-friendly',
    10: 'sh-airport-shutle',
    11: 'sh-pool',
    12: 'sh-fitness-centre',
    13: 'sh-gym',
    14: 'sh-hot-tub',
    15: 'sh-lunch',
    16: 'sh-wheelchair-accessible',
    17: 'sh-elevator'
}

// Сводка всего по номеру
export interface IRoomSummary {
    roomId: number;
    roomName: string;
    roomPrice: number;
    discountApplied: number;
    originalRoomPrice: number;
    localRoomPrice: number;
    localOrginalRoomPrice: number;
    badgeSymbol: string;
}

// Подробности номера
export interface IRoomDetail {
    defaultPicture: string;
    pictures: string[];
    description: string;
    name: string;
    rating: number;
    city: string;
    street: string;
    latitude: number;
    longitude: number;
    checkInTime: string;
    checkOutTime: string;
    pricePerNight: number;
    phone: string;
    services: IService[];
    rooms: IRoomSummary[];
}

// Описывает отзыв
export interface IReview {
    id: number;
    userId: string;
    submitted: number;
    description: string;
    hotelId: number;
    formattedDate: string;
    userName: string;
}

// Вкладки
export enum Tabs {
    Hotel,
    Reviews
}

// Опции
export enum Option {
    Hotel,
    Reviews
}

// Состояние подробностей номера
export interface IRoomDetailState {
    room: IRoomDetail;
    reviews: IReview[];
    isLoading: boolean;
    isBooking: boolean;
    booked: boolean;
    showConfirmationModal: boolean;
}

// Начальное состояние
const initialState: IRoomDetailState = {
    room: {
        defaultPicture: '',
        pictures: [''],
        description: '',
        name: '',
        rating: 1,
        city: '',
        street: '',
        latitude: 0,
        longitude: 0,
        checkInTime: '',
        checkOutTime: '',
        pricePerNight: 0,
        phone: '',
        services: [],
        rooms: [{
            badgeSymbol: '',
            discountApplied: 0,
            localOrginalRoomPrice: 0,
            localRoomPrice: 0,
            originalRoomPrice: 0,
            roomId: 0,
            roomName: '',
            roomPrice: 0
        }]
    },
    reviews: [],
    isLoading: false,
    isBooking: false,
    booked: false,
    showConfirmationModal: false
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Запрос номера
interface IRequestRoomAction { type: 'REQUEST_ROOM_ACTION' }
// Получение номера
interface IReceiveRoomAction { type: 'RECEIVE_ROOM_ACTION', room: IRoomDetail }
// Инициализация
interface INitRoomDetailAction { type: 'INIT_ROOM_DETAIL_ACTION' }
// Бронирование в целом
interface IBookRoomAction { type: 'BOOK_ROOM_ACTION', booked: boolean, showConfirmationModal: boolean }
// Бронирование номера
interface IBookingRoomAction { type: 'BOOKING_ROOM_ACTION' }
// Запрос отзывов
interface IRequestReviewsAction { type: 'REQUEST_REVIEWS_ACTION' }
// Получение отзывов
interface IReceiveReviewsAction { type: 'RECEIVE_REVIEWS_ACTION', reviews: IReview[] }
// Закрыть диалог
interface IDismissModalAction { type: 'DISMISS_MODAL_ACTION' }

// Известные действия
type KnownAction = IRequestRoomAction | IReceiveRoomAction | INitRoomDetailAction | IBookRoomAction | IBookingRoomAction | IRequestReviewsAction | IReceiveReviewsAction | IDismissModalAction;

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Инициализация
    init: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'INIT_ROOM_DETAIL_ACTION' });
    },

    // Запрос номера
    requestRoom: (id: number, user: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let url = `${settings.urls.hotels}Hotels/${id}`;

        // Если пользователь вошёл
        if (user.id != '' && user.id != null) {
            url = `${settings.urls.hotels}Hotels/${id}?user=${user.id}`;
        }   

        // Получаем номер
        let fetchTask = fetch(url)
            .then(response => response.json() as Promise<IRoomDetail>)
            .then(data => {
                dispatch({ type: 'RECEIVE_ROOM_ACTION', room: data });
            });

        // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
        addTask(fetchTask);

        dispatch({ type: 'REQUEST_ROOM_ACTION' });
    },

    // Запрос отзывов
    requestReviews: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Получаем отзывы отеля
        let fetchTask = fetch(`${settings.urls.reviews}/reviews/hotel/${id}`)
            .then(response => response.json() as Promise<IReview[]>)
            .then(data => {
                dispatch({ type: 'RECEIVE_REVIEWS_ACTION', reviews: data });
            });

        // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
        addTask(fetchTask);

        dispatch({ type: 'REQUEST_REVIEWS_ACTION' });
    },

    // Бронь
    book: (booking: Booking, user: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Заголовки
        let headers = new Headers();
        // Говорим, что это будет json
        headers.append('Content-Type', 'application/json');
        // И Bearer токен авторизации
        const auth = `Bearer ${user.token}`;

        // Выполняем запрос на бронь
        let fetchTask = fetch(`${settings.urls.bookings}Bookings`, {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        }).then(response => {
            dispatch({ type: 'BOOK_ROOM_ACTION', booked: true, showConfirmationModal: true });
            console.log(response);
        }, (e) => {
            dispatch({ type: 'BOOK_ROOM_ACTION', booked: false, showConfirmationModal: false });
        });

        dispatch({ type: 'BOOKING_ROOM_ACTION' });
    },

    // Закрыть модальный диалог
    dismissModal: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'DISMISS_MODAL_ACTION' });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IRoomDetailState> = (state: IRoomDetailState, action: KnownAction) => {
    switch (action.type) {
        case 'INIT_ROOM_DETAIL_ACTION':
            return { ...state, isBooking: false, booked: false, showConfirmationModal: false };

        case 'REQUEST_ROOM_ACTION':
            return { ...state, isLoading: true };

        case 'RECEIVE_ROOM_ACTION':
            return { ...state, isLoading: false, room: action.room };

        case 'BOOKING_ROOM_ACTION':
            return { ...state, isBooking: true, booked: false };

        case 'BOOK_ROOM_ACTION':
            return { ...state, isBooking: false, booked: action.booked, showConfirmationModal: action.showConfirmationModal };

        case 'REQUEST_REVIEWS_ACTION':
            return { ...state, isLoading: true };

        case 'RECEIVE_REVIEWS_ACTION':
            return { ...state, isLoading: false, reviews: action.reviews };

        case 'DISMISS_MODAL_ACTION':
            return { ...state, showConfirmationModal: false };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}