import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Filter from './Filter';
import FilterPrice from './FilterPrice';
import FilterAvailability from './FilterAvailability';
import FilterRating from './FilterRating';
import FilterReviews from './FilterReviews';
import FilterServices from './FilterServices';
import FilterCancelation from './FilterCancelation';
import FilterNeighborhood from './FilterNeighborhood';
import FilterRelevance from './FilterRelevance';

// Компонент отвечающий за фильтры
export default class Filters extends React.Component<{}, {}> {

    public render() {
        return <div className='sh-filters'>
                   <div className='sh-filters-container'>
                       <FilterAvailability/>
                       <FilterRating rating={4}/>
                       <Filter title='Ценовой диапазон'>
                           <FilterPrice/>
                       </Filter>
                       <Filter title='Отзывы' disabled={true}>
                           <FilterReviews/>
                       </Filter>
                       <Filter title='Обслуживание'>
                           <FilterServices/>
                       </Filter>
                       <Filter title='Отмена' disabled={true}>
                           <FilterCancelation/>
                       </Filter>
                       <Filter title='Окрестности' right={0} disabled={true}>
                           <FilterNeighborhood/>
                       </Filter>
                       <Filter title='Сортировать по релевантности' right={0} disabled={true}>
                           <FilterRelevance/>
                       </Filter>
                   </div>

                   <div className='sh-filters-float'>
                       <i className='sh-filters-icon icon-sh-map'></i>
                   </div>
               </div>;
    }
}