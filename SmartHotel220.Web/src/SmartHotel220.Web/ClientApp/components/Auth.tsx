import * as React from 'react';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import Loading from './Loading';
import * as UserStore from '../store/User';

// Props авторизации (коллекция значений, которые ассоциированы с данным компонентом)
type AuthProps = UserStore.IUserState
    & typeof UserStore.actionCreators;

// Компонент авторизации
class Auth extends React.Component<AuthProps, {}> {
    
    // Рендер входа
    private renderLogin() {
        if (!this.props.name && !this.props.isLoading) {
            return (<li>
                        <span className='sh-auth-link' onClick={() => { this.props.login() }}>Войти</span>
                    </li>);
        }
    }

    // Рендер загрузки
    private renderLoading() {
        if (this.props.isLoading) {
            return (<li>
                        <Loading isBright={true}/>
                    </li>);
        }
    }

    // Рендер выхода
    private renderLogout() {
        if (this.props.name && !this.props.isLoading) {
            return (<li className='sh-auth-group'>
                        <section className='sh-auth-profile'>
                            <div className='sh-auth-name'>
                                {this.props.name}
                            </div>
                            <span className='sh-auth-link' onClick={() => { this.props.logout() }}>Выйти</span>
                        </section>
                        <img className='sh-auth-picture' src={this.props.gravatar} title={this.props.name}/>
                    </li>);
        }
    }

    public render() {
        return <div className='sh-auth'>
                   {this.renderLogin()}
                   {this.renderLoading()}
                   {this.renderLogout()}
               </div>;
    }

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        this.props.init();
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.user, // Выбирает, какие свойства состояния объединяются в props компонента
    UserStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(Auth) as any;