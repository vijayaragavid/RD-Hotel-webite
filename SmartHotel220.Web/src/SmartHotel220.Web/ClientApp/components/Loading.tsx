import * as React from 'react';

// Props
type LoadingProps = {
    isBright?: boolean; // индикация
};

// Компонент загрузчика
export default class Loading extends React.Component<LoadingProps, {}> {

    public render() {
        return <div className={`sh-loading ${this.props.isBright ? 'sh-loading--bright' : ''}`}>
                   Загрузка...
               </div>;
    }
}
