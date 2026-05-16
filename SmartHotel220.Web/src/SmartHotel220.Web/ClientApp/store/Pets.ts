import { Reducer } from 'redux';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { addTask } from 'domain-task';

// Путь к API питомцев
const api = `/api/Pets`;

// Статусы обработки
export enum Status {
    None,
    Ok,
    Bad
}

// Инфо питомца
export class PetInfo {
    public base64: string;
}

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента

// Состояние питомцев
export interface IPetsState {
    isUploading: boolean;
    isThinking: boolean;
    id: string | null;
    image: string | null;
    status: PetAcceptedResponse;
}

// Начальное состояние
const initialState: IPetsState = {
    isUploading: false,
    isThinking: false,
    id: null,
    image: null,
    status: {approved: false, message: ''}
}

// Класс описывающий успешный ответ
class PetAcceptedResponse {
    public approved: boolean | null;
    public message: string;
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Инициализация
interface INitAction { type: 'INIT_ACTION' }
// Запрос загрузки питомца
interface IRequestPetUploadAction { type: 'REQUEST_PET_UPLOAD_ACTION', image: string }
// Получение загрузки питомца
interface IReceivePetUploadAction { type: 'RECEIVE_PET_UPLOAD_ACTION', id: string }
// Начало получения статуса
interface IStartPoolingAction { type: 'START_POOLING_ACTION' }
// Конец получения статуса
interface IEndPoolingAction { type: 'END_POOLING_ACTION', status: PetAcceptedResponse }

// Известные действия
type KnownAction = INitAction | IRequestPetUploadAction | IReceivePetUploadAction | IStartPoolingAction | IEndPoolingAction;

// -----------------------------------------------------------------------------------------------------------------
// FUNCTIONS - Функции для повторного использования в этом коде

function postImage(pet: PetInfo): Promise<string> {
    // Грузим питомца в хранилище
    let fetchTask = fetch(api, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pet)
    }).then(response => response.json() as Promise<string>);

    // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
    addTask(fetchTask);

    return fetchTask;
}

// Максимум попыток
const maximumAttempts = 100;
// Время ожидания
const differenceTime = 400;

// Начальное время, время старта
let startTime: number;
// Получает ли информацию
let isGettingInfo: boolean;
// Попыток
let attempts: number;
// Фрейм
let frame: any;

// Рекурсивно получаем результат загрузки
function recursiveGet(id: string, resolve: any) {
    // Текущее время
    let now = Date.now();

    // Если инфо не получено
    if (!isGettingInfo && (now - startTime > differenceTime)) {
        // Получаем
        isGettingInfo = true;

        // Делаем запрос
        let fetchTask = fetch(api + `?identifier=${id}`)
            .then(response => response.json() as Promise<PetAcceptedResponse>)
            .then(status => {
                // Инфо не получаем
                isGettingInfo = false;

                // Если сообщение НЕ пустое
                if (status.message !== '') {
                    // Отменяем анимацию
                    cancelAnimationFrame(frame);
                    // Решаем задачу
                    resolve(status);
                // иначе повторная попытка
                } else {
                    // Попытка+1
                    attempts++;
                    if (attempts >= maximumAttempts) {
                        // Отменяем анимацию
                        cancelAnimationFrame(frame);
                        // Решено со статусом status
                        resolve(status);
                    }
                }

                // Сохраняем текущее время, как начало операции
                startTime = now;
            });

        // Нужно убедиться, что пререндеринг на стороне сервера ожидает завершения этого
        addTask(fetchTask);
    }

    // Запрос на фрейм анимацию с вызовом текущей функции (рекурсия)
    frame = requestAnimationFrame(() => recursiveGet(id, resolve));
}

// Получить статус (асинхронно)
function getStatus(id: string): Promise<PetAcceptedResponse> {
    // Начальное время
    startTime = Date.now();
    // Инфо не получаем
    isGettingInfo = false;
    // Сбрасываем попытки
    attempts = 0;

    // Возвращаем Promise с запросом на анимацию во фрейме и рекурсивной функцией
    // получения результата
    return new Promise(resolve => {
        frame = requestAnimationFrame(() => recursiveGet(id, resolve));
    });
}

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Инициализация
    init: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'INIT_ACTION'});
    },

    // Загрузить питомца
    uploadPet: (pet: PetInfo): AppThunkAction<KnownAction> => (dispatch, getState) => {
        postImage(pet)
            .then(id => {
                dispatch({ type: 'RECEIVE_PET_UPLOAD_ACTION', id: id });

                dispatch({ type: 'START_POOLING_ACTION' });

                // Теперь начнем получать статус
                getStatus(id).then(status => {
                    dispatch({ type: 'END_POOLING_ACTION', status: status });
                });
            });

        dispatch({ type: 'REQUEST_PET_UPLOAD_ACTION', image: pet.base64 });
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IPetsState> = (state: IPetsState, action: KnownAction) => {
    switch (action.type) {
        case 'INIT_ACTION':
            return { ...state, isUploading: false, isThinking: false, image: null, status: {approved: null, message: ''}};

        case 'REQUEST_PET_UPLOAD_ACTION':
            return { ...state, isUploading: true, isThinking: false, image: action.image, status: { approved: null, message: '' } };

        case 'RECEIVE_PET_UPLOAD_ACTION':
            return { ...state, isUploading: false, isThinking: false, id: action.id };

        case 'START_POOLING_ACTION':
            return { ...state, isUploading: false, isThinking: true };

        case 'END_POOLING_ACTION':
            return { ...state, isUploading: false, isThinking: false, image: null, status: action.status };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}