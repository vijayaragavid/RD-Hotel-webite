import * as React from 'react';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import Slider, { Range } from 'rc-slider';
import * as RoomsStore from '../store/Rooms';

// Props фильтрации по цене (коллекция значений, которые ассоциированы с данным компонентом)
type FilterProps =
    RoomsStore.IRoomsState
    & typeof RoomsStore.actionCreators;

// Фильтрация цены
class FilterPrice extends React.Component<FilterProps, {}> {

    // При изменении ползунка
    private onSliderChange = (value: Array<number>) => {
        this.props.updatePrice(value[0], value[1]);
    }

    public render() {
        return <div className='sh-filter_price'>
                   <div className='sh-filter_price-range'>
                       <span className='sh-filter_price-value'>$ {this.props.filters.minPrice}</span>
                       <span className='sh-filter_price-value'>$ {this.props.filters.maxPrice}</span>
                   </div>
                   <Range min={0} max={1000} 
                        defaultValue={[this.props.filters.minPrice, this.props.filters.maxPrice]} 
                        tipFormatter={value => `$${value}`} onChange={this.onSliderChange}/>
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.rooms, // Выбирает, какие свойства состояния объединяются в props компонента
    RoomsStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(FilterPrice) as any;