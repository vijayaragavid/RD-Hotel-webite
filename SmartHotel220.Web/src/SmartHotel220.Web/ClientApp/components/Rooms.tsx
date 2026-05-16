import * as React from 'react';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import Loading from './Loading';
import * as RoomsStore from '../store/Rooms';
import { RoomHighlighted } from './RoomHighlighted';
import { Link } from 'react-router-dom';

// Props
type RoomsProps = {
        component: any,
        isLinked: boolean | true,
        source?: any,
        title?: string,
        modifier?: string;
    }
    & RoomsStore.IRoomsState
    & typeof RoomsStore.actionCreators;

class Rooms extends React.Component<RoomsProps, {}> {

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        // Запрос рекомендуемых номеров, если выставлен источник
        if (this.props.source === RoomsStore.Sources.Featured) {
            this.props.requestFeatured();
            return;
        }

        // иначе запрос фильтруемых
        this.props.requestFiltered();
    }

    // Рендер элемента
    public renderItem = (key: number, room: RoomsStore.IRoom) => {
        //if (this.props.isLinked) {
            return (<Link className='sh-rooms-item' key={key} to={`/RoomDetail/${room.id}`}>
                        {React.createElement(this.props.component, Object.assign({}, this.props, { ...room }))}
                    </Link>);
        //} else {
        //    return (<div className='sh-rooms-item' key={key}>
        //                {React.createElement(this.props.component, Object.assign({}, this.props, { ...room }))}
        //            </div>);
        //}
    }

    public render() {
        return <div className={`sh-rooms ${this.props.modifier ? `sh-rooms--${this.props.modifier}` : ''}`}>
                   <span className='sh-rooms-title'>{this.props.title}</span>
                   {this.props.isLoading ? <Loading/> : this.props.list.map((room: RoomsStore.IRoom, key: number) =>
                           this.renderItem(key, room)
                   )}
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.rooms, // Выбирает, какие свойства состояния объединяются в props компонента
    RoomsStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(Rooms) as any;