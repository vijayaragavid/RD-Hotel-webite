import * as React from 'react';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import { RouteComponentProps, Link } from 'react-router-dom';
import SearchInfo from './SearchInfo';
import * as RoomDetailStore from '../store/RoomDetail';
import * as ModalDialogStore from '../store/ModalDialog';
import * as SearchStore from '../store/Search';
import * as UserStore from '../store/User';
import Loading from './Loading';
import * as moment from 'moment';
import { settings } from '../Settings';
import ModalDialog from './ModalDialog';

// Состояние подробностей номера
interface ILocalState {
    bookingText: string;
    canBook: boolean;
    tab: RoomDetailStore.Tabs;
}

// Подробности номера
class RoomDetail extends React.Component<any, ILocalState> {

    // Модальный диалог
    private modal: any;

    // Вызывается перед удалением компонента из DOM
    public componentWillMount() {
        // Создаём состояние
        this.state = {
            bookingText: 'Войдите, чтобы забронировать',
            canBook: false,
            tab: RoomDetailStore.Tabs.Hotel
        };

        // Если пользователь выполнил вход, меняем состояние на возможность бронирования
        if (this.props.user.id) {
            this.setState(prev => ({ ...prev, bookingText: 'Забронируйте сейчас', canBook: true }));
        }
    }

    // Вызывается перед обновлением компонента (если shouldComponentUpdate возвращает true)
    public componentWillUpdate(nextProps: any) {
        // Отображаем диалог, если нужно
        if (nextProps.showConfirmationModal) {
            this.modal.open();
        }
    }

    // Открыть модальный диалог
    private openModal = () => {
        this.modal.open();
    }

    // Закрыть модальный диалог
    private closeModal = () => {
        this.modal.close();
    }

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        // Инициализация
        this.props.init();
        // Запрос номера
        this.props.requestRoom(this.props.match.params.hotelId, this.props.user);
        // Запрос отзывов
        this.props.requestReviews(this.props.match.params.hotelId);
    }

    // По клику на таб
    private onClickTab = (tab: RoomDetailStore.Tabs) => {
        this.setState(prev => ({ ...prev, tab: tab }));
    }

    // Форматирует число
    private formatNumber(value: any, decimals?: number): string {
        // Парсим строку в флоат
        let n = parseFloat(value);

        // Проверка на корректность
        if (isNaN(n) || !isFinite(n)) {
            return value;
        }

        // Абсолютное значение
        let absNum = Math.abs(n);
        // Если есть десятки, то переводим их в значение с плавающей точкой и сплитим точкой
        let num = decimals
            ? absNum.toFixed(decimals).toString().split('.')
            : absNum.toString().split('.');
        let result = '';

        // Тысячи разделяются запятой, а десятки точкой
        const regex = new RegExp('(?=(?:\\d{3})+(?:\\.|$))', 'g'),
            thousands_separator = ',',
            decimals_separator = '.';

        if (n < 0) {
            result = '-';
        }

        result += value === 0
            ? '0'
            : num[1]
                ? `${num[0].split(regex).join(thousands_separator)}${decimals_separator}${num[1]}`
                : `${num[0].split(regex).join(thousands_separator)}`;

        return result;
    }

    // По клику "забронировать"
    private onClickBook = () => {
        // Если пользователь вошёл
        if (this.props.user.id) {
            // Формируем бронь
            let booking = new RoomDetailStore.Booking(
                this.props.match.params.hotelId,
                this.props.user.email,
                this.props.search.when.value.endDate,
                this.props.search.when.value.startDate,
                this.props.search.guests.value.adults,
                this.props.search.guests.value.kids,
                this.props.search.guests.value.baby,
                0,
                this.calculateTotal()
            );
            // Выполняем бронь
            this.props.book(booking, this.props.user);

            return;
        }

        // Если пользователь не вошёл
        this.setState(prev => ({ ...prev, bookingText: 'Войдите, чтобы забронировать' }));
    }

    // Посчитать итоговую сумму
    private calculateTotal = () => {
        // Начальная дата
        let start = moment(SearchStore.getLongDate(this.props.search.when.value.startDate));
        // Конечная дата
        let end = moment(SearchStore.getLongDate(this.props.search.when.value.endDate));
        // Кол-во ночей
        let nights = Math.abs(start.diff(end, 'days'));

        return this.props.room.rooms[0].localRoomPrice * nights;
    }

    // Форматировать время
    private formatHours = (hour: string) => {
        return moment(hour, ['hh:mm']).format('hh:mm');
    }

    // Получить иконки сервиса по ключу
    private getServicesIcon = (key: number) => {
        if (!key) {
            return;
        }

        return RoomDetailStore.servicesDictionary[key];
    }

    // Рендеринг описания
    private renderDescription() {
        return (<div>
                    <article className='sh-room_detail-description'>
                        {this.props.room.description}
                    </article>
                    <h3 className='sh-room_detail-subtitle'>Услуги</h3>
                    <div className='sh-room_detail-extra'>
                        <ul className='sh-room_detail-services'>
                            {this.props.room.services.map((service: any, key: number) =>
                                <li className='sh-room_detail-service' key={key}>
                                    <i className={`sh-room_detail-service_icon icon-${this.getServicesIcon(service.id)}`}></i>
                                    <span>{service.name}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className='sh-room_detail-extra'>
                        <h3 className='sh-room_detail-subtitle'>Информация</h3>

                        <div className='sh-room_detail-extra'>
                            <h4 className='sh-room_detail-smalltitle'>Регистрация / Выписка</h4>
                            <p className='sh-room_detail-text'>{this.formatHours(this.props.room.checkInTime)} / {this.formatHours(this.props.room.checkOutTime)}</p>
                        </div>

                        <div className='sh-room_detail-extra'>
                            <h4 className='sh-room_detail-smalltitle'>Политика отмены</h4>
                            <p className='sh-room_detail-text'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                        </div>
                    </div>
                    <div className='sh-room_detail-extra'>
                        <h3 className='sh-room_detail-subtitle'>Галерея {`(${this.props.room.pictures.length})`}</h3>
                        <ul className='sh-room_detail-gallery'>
                            {this.props.room.pictures.map((picture: string, key: number) =>
                                <li className='sh-room_detail-picture' key={key} 
                                    style={this.setBackgroundImage(picture)}></li>
                            )}
                        </ul>
                    </div>
                </div>);
    }

    // Возвращает активные звёзды
    private drawStars(rating: number): JSX.Element[] {
        // Максимум 5 звёзд
        const max = 5;
        // Сами звёзды
        let stars = [];

        // Заполняем массив звёзд
        for (let i = 1; i <= max; i++) {
            stars.push(<i className={'sh-room_detail-star active icon-sh-star ' + (i <= rating ? 'is-active' : '')} key={i}></i>);
        }

        return stars;
    }

    // Форматировать дату
    private formatDate = (date: moment.Moment) => {
        date = moment(date);

        return date ? `${date.format('D MMM YYYY')}` : '';
    }

    // Рендеринг отзывов
    private renderReviews() {
        return (<div>
                    <div className='sh-room_detail-extra'>
                        <ul className='sh-room_detail-reviews'>
                            {this.props.isLoading
                                ? <Loading/>
                                : this.props.reviews.map((review: any, key: number) =>
                                    <li className='sh-room_detail-review' key={key}>
                                        <header className='sh-room_detail-review_header'>
                                            <div>
                                                <span className='sh-room_detail-subtitle u-pr-2'>{review.userName}</span>
                                                <span className='sh-room_detail-smalltitle u-pr-2'>Двухкомнатный номер</span>
                                                <span className='sh-room_detail-date'>{review.formattedDate}</span>
                                            </div>
                                            <div>
                                                {this.drawStars(5)}
                                            </div>
                                        </header>
                                        <div className='sh-room_detail-extra'>
                                            <p className='sh-room_detail-text'>{review.description}</p>
                                        </div>
                                    </li>
                            )}
                        </ul>
                    </div>
                </div>);
    }

    // Рендерит выбранную опцию (таб)
    private renderCurrentOption(): any {
        switch (this.state.tab) {
            case RoomDetailStore.Tabs.Hotel:
                return this.renderDescription();

            case RoomDetailStore.Tabs.Reviews:
                return this.renderReviews();
        }
    }

    // Изменить фоновое изображение
    private setBackgroundImage(image: string): { [key: string]: string } {
        return {
            backgroundImage: `url(${settings.urls.images_Base}${image})`
        };
    }

    // Рендерит боковое бронирование
    private renderAsideBooking = () => {
        let originalPriceSpan: any = '';

        // Даты въезда и выезда с русской локалью
        let checkInMoment = SearchStore.getLongDate(this.props.search.when.value.startDate).locale('ru');
        let checkOutMoment = SearchStore.getLongDate(this.props.search.when.value.endDate).locale('ru');

        // Формат
        let formatCheckIn = `${checkInMoment.format('dd, MMM DD, YYYY')}`;
        let formatCheckOut = `${checkOutMoment.format('dd, MMM DD, YYYY')}`;

        // Проверка на скидку
        if (this.props.room.rooms[0].discountApplied > 0) {
            originalPriceSpan = <span className='sh-room_detail-smallstrokedtitle'>
                                    {`${this.props.room.rooms[0].badgeSymbol}${this.formatNumber(this.props.room.rooms[0].localOriginalRoomPrice)}`}&nbsp;
                                </span>;
        }

        return <aside className='sh-room_detail-filters'>
                   <header className='sh-room_detail-filter_header'>
                       <span className='sh-room_detail-filter_title'>{`${this.props.room.rooms[0].badgeSymbol}${this.formatNumber(this.calculateTotal())}`}</span>
                       <span>Всего</span>
                   </header>

                   <section className='sh-room_detail-info'>
                       <div className='sh-room_detail-title'>{this.props.room.name}</div>

                       <span className='sh-room_detail-location u-display-block'>{this.props.room.location}</span>
                       <span className='sh-room_detail-phone u-display-block'>{this.props.room.phone}</span>

                       <div className='sh-room_detail-extra sh-room_detail-extra--double row'>
                           <div className='col-xs-6'>
                               <span className='sh-room_detail-small'>Регистрация</span>
                               <span className='sh-room_detail-smalltitle'>{formatCheckIn}</span>
                           </div>
                           <div className='col-xs-6'>
                               <span className='sh-room_detail-small'>Выписка</span>
                               <span className='sh-room_detail-smalltitle'>{formatCheckOut}</span>
                           </div>
                       </div>

                       <div className='sh-room_detail-extra row'>
                           <div className='col-xs-4'>
                               <span className='sh-room_detail-small'>Номер</span>
                               <span className='sh-room_detail-smalltitle'>{SearchStore.getFullRooms(this.props.search.guests.value)}</span>
                           </div>
                           <div className='col-xs-4'>
                               <span className='sh-room_detail-small'>Гости</span>
                               <span className='sh-room_detail-smalltitle'>{SearchStore.getFullGuests(this.props.search.guests.value)}</span>
                           </div>
                           <div className='col-xs-4'>
                               <span className='sh-room_detail-small'>За ночь</span>
                               {originalPriceSpan}
                               <span className='sh-room_detail-smalltitle'>{`${this.props.room.rooms[0].badgeSymbol}${this.formatNumber(this.props.room.rooms[0].localRoomPrice)}`}</span>
                           </div>
                       </div>

                       <div className='sh-room_detail-extra'>
                           <span className={`sh-room_detail-book btn ${this.props.booked || !this.state.canBook ? 'is-disabled' : ''}`} onClick={this.onClickBook}>
                               {this.props.isBooking ? <Loading isBright={true}/> : this.state.bookingText}
                           </span>
                       </div>
                   </section>
               </aside>;
    }

    // Общий рендер
    public render() {
        // Даты въезда и выезда с русской локалью
        let checkInMoment = SearchStore.getLongDate(this.props.search.when.value.startDate).locale('ru');
        let checkOutMoment = SearchStore.getLongDate(this.props.search.when.value.endDate).locale('ru');

        // Формат
        let formatCheckIn = `${checkInMoment.format('dd, MMM DD, YYYY')}`;
        let formatCheckOut = `${checkOutMoment.format('dd, MMM DD, YYYY')}`;

        return <div className='sh-room_detail'>
                   <div className='sh-room_detail-search'>
                       <SearchInfo/>
                   </div>

                   <Link className='sh-room_detail-back' to={`/SearchRooms`}>
                        <i className='sh-room_detail-arrow icon-sh-chevron'></i>
                        Вернуться к отелям
                    </Link>

                   {this.props.isLoading
                       ? <Loading/>
                       : <header className='sh-room_detail-background' style={this.setBackgroundImage(this.props.room.defaultPicture)}>
                             <div className='sh-room_detail-show_small'> {this.renderAsideBooking()}</div>
                         </header>}

                   <section className='sh-room_detail-wrapper'>
                       <div className='sh-room_detail-column sh-room_detail-column--left'>
                           <ul className='sh-room_detail-tabs'>
                               <li className={`sh-room_detail-tab ${this.state.tab === RoomDetailStore.Tabs.Hotel ? 'is-active' : ''}`}
                                   onClick={() => this.onClickTab(RoomDetailStore.Tabs.Hotel)}>
                                   Отель
                               </li>
                               <li className={`sh-room_detail-tab ${this.state.tab === RoomDetailStore.Tabs.Reviews ? 'is-active' : ''}`}
                                   onClick={() => this.onClickTab(RoomDetailStore.Tabs.Reviews)}>
                                   Отзывы
                               </li>
                           </ul>

                           <div className='sh-room_detail-content'>
                               <header className='sh-room_detail-header'>
                                   <div className='sh-room_detail-group'>
                                       <span className='sh-room_detail-title'>{this.props.room.name}</span>
                                       <div className='sh-room_detail-stars'>{this.drawStars(this.props.room.rating)}</div>
                                   </div>
                                   <span className='sh-room_detail-location'>{this.props.room.city}</span>
                               </header>
                               {this.renderCurrentOption()}
                           </div>
                       </div>

                       <div className='sh-room_detail-column sh-room_detail-column--right'>
                           {this.renderAsideBooking()}
                       </div>
                   </section>

                   <ModalDialog callback={this.props.dismissModal} onRef={(ref: any) => (this.modal = ref)}>
                       <div className='sh-modal'>
                           <header className='sh-modal-header'>
                               <div className='sh-modal-title'>
                                   <span>Информация о бронировании</span>
                                   <span className='sh-modal-close' onClick={this.closeModal}>
                                       <i className='icon-sh-close'></i>
                                   </span>
                               </div>

                               <div className='sh-modal-picture' style={this.setBackgroundImage(this.props.room.defaultPicture)}></div>
                           </header>

                           <section className='sh-modal-body'>
                               <div className='sh-modal-row'>
                                   <span className='sh-room_detail-smalltitle'>Спасибо {this.props.user.name},</span>
                                   <span className='sh-room_detail-small'>Ваше бронирование на {this.props.room.name} подтверждено.</span>
                               </div>

                               <div className='sh-modal-row'>
                                   <span className='sh-room_detail-smalltitle'>{this.props.room.name}</span>
                                   <span className='sh-room_detail-small'>{this.props.room.street}</span>
                                   <span className='sh-room_detail-small'>{this.props.room.city}</span>
                               </div>

                               <div className='sh-modal-row row'>
                                   <div className='col-xs-6'>
                                       <span className='sh-room_detail-small'>Регистрация</span>
                                       <span className='sh-room_detail-smalltitle'>{formatCheckIn}</span>
                                   </div>
                                   <div className='col-xs-6'>
                                       <span className='sh-room_detail-small'>Выписка</span>
                                       <span className='sh-room_detail-smalltitle'>{formatCheckOut}</span>
                                   </div>
                               </div>

                               <div className='sh-modal-row row'>
                                   <div className='col-xs-4'>
                                       <span className='sh-room_detail-small'>Номер</span>
                                       <span className='sh-room_detail-smalltitle'>{SearchStore.getFullRooms(this.props.search.guests.value)}</span>
                                   </div>

                                   <div className='col-xs-4'>
                                       <span className='sh-room_detail-small'>Гости</span>
                                       <span className='sh-room_detail-smalltitle'>{SearchStore.getFullGuests(this.props.search.guests.value)}</span>
                                   </div>

                                   <div className='col-xs-4'>
                                       <span className='sh-room_detail-small'>За ночь</span>
                                       <span className='sh-room_detail-smalltitle'>{`${this.props.room.rooms[0].badgeSymbol}${this.formatNumber(this.props.room.rooms[0].localRoomPrice)}`}</span>
                                   </div>
                               </div>
                           </section>

                           <footer className='sh-modal-footer'>
                               <div className='sh-room_detail-grow'>
                                   <img className='sh-modal-logo' src='/assets/images/logo.svg'/>
                               </div>

                               <div className='sh-modal-total'>
                                   <span className='sh-modal-small'>Всего</span>
                                   <span className='sh-modal-price'>{`${this.props.room.rooms[0].badgeSymbol}${this.formatNumber(this.calculateTotal())}`}</span>
                               </div>
                           </footer>
                       </div>
                   </ModalDialog>
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => ({ ...state.roomDetail, search: state.search, user: state.user }), // Выбирает, какие свойства состояния объединяются в props компонента
    RoomDetailStore.actionCreators                                                                  // Выбирает, какие создатели действий объединяются в props компонента
)(RoomDetail) as any;