import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Switch from './Switch';

// Доступность фильтрации
export default class FilterAvailability extends React.Component<{}, {}> {

    public render() {
        return <div className='sh-filter'>
                   <Switch label='Только свободные' checked={true}/>
               </div>;
    }
}