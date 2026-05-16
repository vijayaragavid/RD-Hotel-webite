/// <reference path='../../node_modules/msal/out/msal.d.ts' />

import { Reducer } from 'redux';
import { Md5 } from 'ts-md5/dist/md5';
import { IAppThunkAction as AppThunkAction } from 'ClientApp/store';
import { settings } from '../Settings';

// Домен арендатор
const tenant = settings.b2c.tenant;
// Политика регистрации/входа
const policy = settings.b2c.policy;
// ИД клиента AAD B2C
const client = settings.b2c.client;

const scopes = ['openid'];
// Ссылка авторизации
const authority = `https://login.microsoftonline.com/tfp/${tenant}/${policy}`;

// Менеджер пользователей
let userManager: Msal.UserAgentApplication;

// Описывает юзера
interface IUser {
    user: Msal.User,
    email: string;
}

// -----------------------------------------------------------------------------------------------------------------
// STATE - определяет тип данных, хранящийся в хранилище Redux
// Описывает внутреннее состояние компонента
export interface IUserState {
    id: string | null;
    name: string | null;
    email: string;
    gravatar: string;
    token: string;
    error: boolean;
    isLoading: boolean;
}

// Начальное состояние
const initialState: IUserState = {
    id: null,
    name: null,
    email: '',
    gravatar: '',
    token: '',
    error: false,
    isLoading: false
}

// -----------------------------------------------------------------------------------------------------------------
// ACTIONS - События/действия. Некоторый набор информации, который исходит от приложения к хранилищу 
// и который указывает, что именно нужно сделать. Для передачи этой информации у хранилища вызывается метод dispatch()

// Инициализация
interface INitAction { type: 'INIT_ACTION' }
// Изменить пользователя
interface ISetUserAction { type: 'SET_USER_ACTION', id: string | null, name: string | null, email: string, gravatar: string, token: string, isFake: boolean }
// Логин
interface ILoginAction { type: 'LOGIN_ACTION', error: boolean }
// Логаут
interface ILogoutAction { type: 'LOGOUT_ACTION' }

// Известные действия
type KnownAction = INitAction | ILoginAction | ILogoutAction | ISetUserAction;

// Получить данные пользователя
let getUserData = (accessToken: string): IUser => {
    // Получаем пользователя
    const user = userManager.getUser();

    // Получаем email
    const jwt = Msal.Utils.decodeJwt(accessToken);
    let email = user.name;

    if (jwt && jwt.JWSPayload) {
        const decoded = JSON.parse(atob(jwt.JWSPayload));

        if (decoded && decoded.emails && decoded.emails[0]) {
            email = decoded.emails[0];
        }
    }

    return {
        user: user,
        email: email
    }
}

// -----------------------------------------------------------------------------------------------------------------
// ACTION CREATORS - Создатели действий. Функции, которые создают действия

export const actionCreators = {
    // Инициализация
    init: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        userManager = new Msal.UserAgentApplication(client, authority,
            (errorDesc: any, token: any, error: any, tokenType: any) => {
                if (token) {
                    userManager.acquireTokenSilent(scopes).then(accessToken => {
                        const userData = getUserData(accessToken);

                        //let bytes = encoder.encode(this.props.name);
                        //let newName = decoder.decode(bytes);

                        //console.log(name);
                        //console.log(bytes);
                        //console.log(newName);

                        dispatch({
                            type: 'SET_USER_ACTION', id: userData.user.userIdentifier, name: userData.user.name, email: userData.email, gravatar: 'https://www.gravatar.com/avatar/' + Md5.hashStr(userData.email.toLowerCase()).toString(), token: accessToken, isFake: false
                        });
                    }, error => {
                        userManager.acquireTokenPopup(scopes).then(function (accessToken) {
                            const userData = getUserData(accessToken);

                            dispatch({
                                type: 'SET_USER_ACTION', id: userData.user.userIdentifier, name: userData.user.name, email: userData.email, gravatar: 'https://www.gravatar.com/avatar/' + Md5.hashStr(userData.email.toLowerCase()).toString(), token: accessToken, isFake: false
                            });
                        }, function (error) {
                            dispatch({ type: 'SET_USER_ACTION', id: null, name: null, email: '', gravatar: '', token: '', isFake: false });
                        });
                    });
                } else {
                    dispatch({ type: 'INIT_ACTION', id: null, name: null, email: '', gravatar: '', token: '' });
                }
            });

        dispatch({ type: 'INIT_ACTION' });
    },

    // Вход
    login: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        userManager.acquireTokenSilent(scopes)
            .then((accessToken: any) => {
                dispatch({ type: 'LOGIN_ACTION', error: false });
            }, (error: any) => {
                userManager.loginRedirect(scopes);
                dispatch({ type: 'LOGIN_ACTION', error: true });
            });
    },

    // Выход
    logout: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'LOGOUT_ACTION' });
        localStorage.clear();
        userManager.logout();
    }
}

// -----------------------------------------------------------------------------------------------------------------
// REDUCER - функция (или несколько функций), которая получает действие и в соответствии с этим действием изменяет состояние хранилища

export const reducer: Reducer<IUserState> = (state: IUserState, action: KnownAction) => {
    switch (action.type) {
        case 'INIT_ACTION':
            return { ...state, isLoading: false };

        case 'SET_USER_ACTION':
            return { ...state, error: false, id: action.id, name: action.name, email: action.email, gravatar: action.gravatar, token: action.token, isLoading: false };

        case 'LOGIN_ACTION':
            return { ...state, error: action.error, isLoading: true };

        case 'LOGOUT_ACTION':
            return { ...state, error: false };

        default:
            const exhaustiveCheck: never = action;
    }

    // Для непризнанных действий (или в случаях, когда действия в кейсах не действуют), необходимо вернуть существующее состояние
    // (или начальное состояние по умолчанию)
    return state || { ...initialState };
}