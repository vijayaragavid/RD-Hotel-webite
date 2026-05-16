import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import Auth from './Auth';
import * as NavMenuStore from '../store/NavMenu';

// Props навигации
type NavMenuProps = NavMenuStore.INavMenuState
    & typeof NavMenuStore.actionCreators
    & RouteComponentProps<{}>;

// Компонент навигации
class NavMenu extends React.Component<NavMenuProps, {}> {

    public render() {
        return <div className={`sh-nav_menu ${this.props.isHome ? 'is-home' : ''}`}>
                   <Link to={'/'} className='sh-nav_menu-container'>
                       <img className={`sh-nav_menu-logo ${this.props.isHome ? 'is-home' : ''}`} 
                            src='/assets/images/logo.svg'/>
                   </Link>

                   <ul className='sh-nav_menu-links'>
                       <Auth/>
                   </ul>
               </div>;
    }

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        this.props.listen(this.props.history);
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.nav, // Выбирает, какие свойства состояния объединяются в props компонента
    NavMenuStore.actionCreators             // Выбирает, какие создатели действий объединяются в props компонента
)(NavMenu) as typeof NavMenu;
