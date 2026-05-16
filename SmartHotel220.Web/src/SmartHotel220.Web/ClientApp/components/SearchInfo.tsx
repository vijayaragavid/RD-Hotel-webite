import * as React from 'react';
import * as moment from 'moment';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import * as SearchStore from '../store/Search';

// Props
type SearchInfoProps = SearchStore.ISearchState
    & typeof SearchStore.actionCreators;

// Состояние
interface ILocalState {
    tab: SearchStore.Tab
}

// Описание поиска
class SearchInfo extends React.Component<SearchInfoProps, ILocalState> {

    // Вызывается перед удалением компонента из DOM
    public componentWillMount() {
        this.state = {
            tab: SearchStore.Tab.Smart
        }
    }

    // Рендеринг гостей или людей
    private renderGuestsOrPeople() {
        if (this.state.tab === SearchStore.Tab.Smart) {
            return (<li className='sh-search-group'>
                        {SearchStore.getFullRoomsGuests(this.props.guests.value)}
                    </li>);
        }

        if (this.state.tab === SearchStore.Tab.Conference) {
            return (<li className='sh-search-group'>
                        {SearchStore.getFullPeople(this.props.people.value)}
                    </li>);
        }
    }

    public render(): JSX.Element {
        return <div className='sh-search sh-search--info'>
                   <div className='sh-search-wrapper'>
                       <ul className='sh-search-inputs'>
                           <li className='sh-search-group'>
                               {SearchStore.getFullCity(this.props.where.value)}
                           </li>

                           <li className='sh-search-group'>
                               {SearchStore.getShortDates(this.props.when.value.startDate, this.props.when.value.endDate)}
                           </li>

                           {this.renderGuestsOrPeople()}
                       </ul>
                   </div>
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.search, // Выбирает, какие свойства состояния объединяются в props компонента
    SearchStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(SearchInfo) as any;