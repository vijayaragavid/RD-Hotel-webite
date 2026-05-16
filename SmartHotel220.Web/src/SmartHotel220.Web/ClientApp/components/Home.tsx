import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ConferenceRoomsFeatures from './ConferenceRoomsFeatures';
import { IApplicationState as ApplicationState } from '../store';
import { connect } from 'react-redux';
import Rooms from './Rooms';
import * as RoomsState from '../store/Rooms';
import * as HomeStore from '../store/Home';
import Search from './Search';
import { RoomHighlighted } from './RoomHighlighted';
import Loading from './Loading';

// Props домашней страницы (коллекция значений, которые ассоциированы с данным компонентом)
type HomeProps =
    HomeStore.IHomeState
    & typeof HomeStore.actionCreators
    & RouteComponentProps<{}>;

// Компонент главной страницы
class Home extends React.Component<HomeProps, {}> {

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        this.props.requestTestimonial();
    }

    public render() {
        return <div className='sh-home'>
                   <div className='sh-hero'>
                       <div className='sh-hero-wrapper'>
                           <div className='sh-hero-title'>Будущее интеллектуального гостеприимства и связанного с ним рабочего места</div>
                           <ul className='sh-hero-buttons'>
                               <li className='sh-hero-button'>
                                   <div className='sh-hero-download_app sh-hero-download_app--win'></div>
                               </li>
                               <li className='sh-hero-button'>
                                   <div className='sh-hero-download_app sh-hero-download_app--google'></div>
                               </li>
                           </ul>
                       </div>
                   </div>
                   <Search/>
                   <section className='sh-infogrid'>
                       <p className='sh-home-title'>Интеллектуальный опыт</p>
                       <article className='sh-infogrid-row'>
                           <div className='sh-infogrid-column'>
                               <i className='sh-infogrid-icon icon-sh-smart-check'></i>
                               <div className='sh-infogrid-description'>
                                   <p className='sh-infogrid-subtitle'>Зарегистрируйтесь со своего телефона</p>
                                   <span className='sh-infogrid-text'>
                                       Используйте наше мобильное приложение SmartHotel220 на любом из своих устройств, чтобы ускорить процесс регистрации. Вы можете не заходить к нам на стойку регистрации, а использовать Ваш телефон в качестве ключа от номера.
                                   </span>
                               </div>
                           </div>
                       </article>

                       <article className='sh-infogrid-row'>
                           <div className='sh-infogrid-column'>
                               <i className='sh-infogrid-icon icon-sh-smart-finde'></i>
                               <div className='sh-infogrid-description'>
                                   <p className='sh-infogrid-subtitle'>Найдите путь к своему номеру</p>
                                   <span className='sh-infogrid-text'>
                                       Используйте мобильное приложение SmartHotel220, чтобы быстро найти свой номер.
                                   </span>
                               </div>
                           </div>
                       </article>

                       <article className='sh-infogrid-row'>
                           <div className='sh-infogrid-column'>
                               <i className='sh-infogrid-icon icon-sh-smart-perso'></i>
                               <div className='sh-infogrid-description'>
                                   <p className='sh-infogrid-subtitle'>Опыт персонализации</p>
                                   <span className='sh-infogrid-text'>
                                       Используйте мобильное приложение SmartHotel220, чтобы настроить свой номер удалённо. Устанавливайте температуру в номере или бронируйте новые номера, всё просто и быстро.
                                   </span>
                               </div>
                           </div>
                       </article>

                       <article className='sh-infogrid-row'>
                           <div className='sh-infogrid-column'>
                               <i className='sh-infogrid-icon icon-sh-smart-green'></i>
                               <div className='sh-infogrid-description'>
                                   <p className='sh-infogrid-subtitle'>Экологически чистый подход</p>
                                   <span className='sh-infogrid-text'>
                                       От датчиков, управляющих энергопотреблением наших отелей до программного обеспечения, которое сокращает требуемые рабочие часы. Цель SmartHotel220 сводится к минимизации использования ресурсов.
                                   </span>
                               </div>
                           </div>
                       </article>
                   </section>

                   <span className='sh-home-label'>Для бизнес путешественников</span>
                   <span className='sh-home-title'>Интеллектуальный конференц-зал</span>
                   <ConferenceRoomsFeatures/>

                   <section className='sh-smartphone'>
                       <div className='sh-smartphone-wrapper'>
                           <h2 className='sh-smartphone-title'>Откройте для себя новый опыт</h2>
                           <p className='sh-smartphone-description'>Изучайте наш сайт и приложения под разные платформы. Знакомьтесь с нашими отелями, планируйте свой следующий маршрут. Получайте советы и рекомендации от нас.</p>
                           <img className='sh-smartphone-image' src='/assets/images/smartphone.png'/>
                       </div>
                       <div className='sh-smartphone-quote'>
                           {this.props.isLoading 
                               ? <div className='sh-smartphone-quote_loading'><Loading isBright={true}/></div>
                               : <div className='sh-smartphone-quote_container'>
                                     <p className='sh-smartphone-quote_text'>"{this.props.testimonial.text}"</p>
                                     <span className='sh-smartphone-quote_name'>
                                         <i className='sh-smartphone-quote_icon icon-sh-tweet'></i>
                                         @{this.props.testimonial.customerName}
                                     </span>
                                 </div>}
                       </div>
                   </section>

                   <span className='sh-home-title'>Номера и залы для конференций</span>
                   <Rooms component={RoomHighlighted} source={RoomsState.Sources.Featured}/>
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.home, // Выбирает, какие свойства состояния объединяются в props компонента
    HomeStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(Home) as any;