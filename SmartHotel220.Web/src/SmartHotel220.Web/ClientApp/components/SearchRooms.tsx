import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import SearchInfo from './SearchInfo';
import Filters from './Filters';
import Rooms from './Rooms';
import Room from './Room';

// Props поиска номеров
type SearchRoomsProps = RouteComponentProps<{}>;

// Поиск номеров
export default class SearchRooms extends React.Component<SearchRoomsProps, {}> {

    public render() {
        return <div className='sh-search_rooms'>
                   <SearchInfo/>
                   <Filters/>
                   <Rooms component={Room} isLinked={true} title='Интеллектуальные номера' modifier='full'/>
               </div>;
    }
}