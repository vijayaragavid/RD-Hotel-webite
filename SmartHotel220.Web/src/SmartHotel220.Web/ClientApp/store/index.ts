import * as NavMenu from './NavMenu';
import * as Rooms from './Rooms';
import * as User from './User';
import * as Search from './Search';
import * as ConferenceRoomsFeatures from './ConferenceRoomsFeatures';
import * as RoomDetail from './RoomDetail';
import * as ModalDialog from './ModalDialog';
import * as Home from './Home';
import * as Pets from './Pets';

// Описывает объект состояния верхнего уровня
export interface IApplicationState {
    nav: NavMenu.INavMenuState;
    rooms: Rooms.IRoomsState;
    user: User.IUserState;
    conferenceRoomsFeatures: ConferenceRoomsFeatures.IFeaturesState;
    search: Search.ISearchState;
    roomDetail: RoomDetail.IRoomDetailState;
    modalDialog: ModalDialog.IModalDialogState;
    home: Home.IHomeState;
    pets: Pets.IPetsState;
}

// Всякий раз, когда отправляется действие, Redux обновляет каждое свойство состояния приложения верхнего уровня, используя
// reducer с совпадающим именем. Важно, чтобы имена соответствовали точно, и что reducer
// действует в соответствующем типе свойства ApplicationState.
export const reducers = {
    nav: NavMenu.reducer,
    rooms: Rooms.reducer,
    user: User.reducer,
    conferenceRoomsFeatures: ConferenceRoomsFeatures.reducer,
    search: Search.reducer,
    roomDetail: RoomDetail.reducer,
    modalDialog: ModalDialog.reducer,
    home: Home.reducer,
    pets: Pets.reducer
}

// Этот тип можно использовать, как подсказку для создателей действий, чтобы его параметры "dispatch" и "getState"
// правильно печатались в соответствии с хранилищем
export interface IAppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => IApplicationState): void;
}