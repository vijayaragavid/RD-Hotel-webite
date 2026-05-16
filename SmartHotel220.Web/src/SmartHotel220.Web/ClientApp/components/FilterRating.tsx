import * as React from 'react';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import * as RoomsStore from '../store/Rooms';

// Props фильтрации по рейтингу (коллекция значений, которые ассоциированы с данным компонентом)
type FilterProps =
    RoomsStore.IRoomsState
    & typeof RoomsStore.actionCreators;

// Фильтрация по рейтингу
class FilterRating extends React.Component<FilterProps, {}> {

    // При клике по звёздочке
    private onClickStar = (value: RoomsStore.StarValues) => {
        // Обновляем рейтинг
        this.props.updateRating(value);
        // Делаем запрос на фильтрацию
        this.props.requestFiltered();
    }

    // Отрисовать звёзды. Возвращает массив JSX элементов
    private drawStars(rating = 5): JSX.Element[] {
        // Максимум 5 звёзд
        const max = 5;
        // Сами звёзды
        let stars = [];

        // Заполняем массив звёзд
        for (let i = max; i > 0; i--) {
            stars.push(<i className={'sh-filter_rating-star icon-sh-star ' + (i === rating ? 'is-active' : '')}
                            key={i} 
                            onClick={() => this.onClickStar(i as RoomsStore.StarValues)}></i>);
        }

        return stars;
    }

    public render() {
        return <div className='sh-filter_rating'>
                   {this.drawStars(this.props.filters.rating)}
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.rooms, // Выбирает, какие свойства состояния объединяются в props компонента
    RoomsStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(FilterRating) as any;