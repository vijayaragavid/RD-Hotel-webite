import * as React from 'react';
import * as moment from 'moment';
import * as $ from 'jquery';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { IApplicationState as ApplicationState } from '../store';
import * as SearchStore from '../store/Search';
import Loading from './Loading';
import IncrementDecrement from './IncrementDecrement';
import Checkbox from './Checkbox';

// Props поиска (коллекция значений, которые ассоциированы с данным компонентом)
type SearchProps =
    SearchStore.ISearchState
    & typeof SearchStore.actionCreators;

// Состояние
interface ILocalState {
    tab: SearchStore.Tab;
    selected: SearchStore.Option;
    started: boolean;
    whereFilled: boolean;
    whenFilled: boolean;
    guestsFilled: boolean;
    peopleFilled: boolean;
    shouldRender: boolean;
}

// Поиск
class Search extends React.Component<SearchProps, ILocalState> {

    // Вызывается перед удалением компонента из DOM
    public componentWillMount() {
        this.state = {
            tab: SearchStore.Tab.Smart,
            selected: SearchStore.Option.Where,
            started: false,
            whereFilled: false,
            whenFilled: false,
            guestsFilled: false,
            peopleFilled: false,
            shouldRender: true
        }
    }

    // Вызывается перед обновлением компонента (если shouldComponentUpdate возвращает true)
    public componentWillUpdate(nextProps: SearchProps): void {
        if (nextProps.guests.value.rooms !== this.props.guests.value.rooms) {
            const $oneRoomBox = $(this.refs.oneRoomBox);
            const $twoRoomBox = $(this.refs.twoRoomBox);
            const $moreRoomBox = $(this.refs.moreRoomBox);

            $oneRoomBox.removeClass('is-active');
            $twoRoomBox.removeClass('is-active');
            $moreRoomBox.removeClass('is-active');

            if (nextProps.guests.value.rooms === 1) {
                $oneRoomBox.addClass('is-active');
                return;
            }

            if (nextProps.guests.value.rooms === 2) {
                $twoRoomBox.addClass('is-active');
                return;
            }

            $moreRoomBox.addClass('is-active');
        }
    }

    // По клику на таб
    private onClickTab = (tab: SearchStore.Tab) => {
        // Изменяем состояние
        this.setState(prev => ({ ...prev, tab: tab }));
    }

    // При изменении "где"
    private onChangeWhere = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Производим поиск
        this.props.searchWhere(e.currentTarget.value);
        // Изменяем состояние
        this.setState(prev => ({ ...prev, started: true }));
    }

    // По клику на "где"
    private onClickWhere = () => {
        // Выполняем сброс всего
        this.props.resetPeople();
        this.props.resetGuests();
        this.props.resetWhen();
        this.props.resetWhere();

        // Поле ввода
        let input: any = this.refs.whereinput;
        input.value = '';
        // Выполняем фокус
        setTimeout(() => input.focus(), 10);
        // Изменяем состояние
        this.setState(prev => ({ ...prev, selected: SearchStore.Option.Where, whereFilled: false, started: false }));
    }

    // По выбору "где"
    private onSelectWhere = (city: SearchStore.City) => {
        // Выбираем "где"
        this.props.selectWhere(city);
        // Изменяем состояние
        this.setState(prev => ({ ...prev, selected: SearchStore.Option.When, whereFilled: true }));
    }

    // Рендер опции "где"
    private renderOptionWhere(): JSX.Element {
        return (<ul>
                    {this.props.where.list.map((city: SearchStore.City, key: number) =>
                        <div className='sh-search-option' key={key} onClick={() => this.onSelectWhere(city)}>
                            {SearchStore.getFullCity(city)}
                        </div>
                    )}
                </ul>);
    }

    // Рендер гостей или людей
    private renderGuestsOrPeople() {
        if (this.state.tab === SearchStore.Tab.Smart) {
            return (<li className={`sh-search-group ${this.state.selected === SearchStore.Option.Guests ? 'is-active' : ''}`}>
                        <div className={`sh-search-value ${this.state.guestsFilled ? 'is-filled' : ''}`} onClick={this.onClickGuests}>
                            {SearchStore.getFullRoomsGuests(this.props.guests.value)}
                        </div>

                        <span className={`sh-search-input ${!this.state.guestsFilled ? '' : 'is-hidden '}${this.state.selected === SearchStore.Option.Guests ? 'is-active' : ''}`} onClick={this.onClickGuests}>
                            Гости
                        </span>

                        <section className={`sh-search-options sh-search-options--s ${this.state.started && this.state.selected === SearchStore.Option.Guests ? '' : 'is-hidden'}`}>
                            {this.props.isLoading ? <Loading/> : this.renderCurrentOption()}
                        </section>
                    </li>);
        }

        if (this.state.tab === SearchStore.Tab.Conference) {
            return (<li className={`sh-search-group ${this.state.selected === SearchStore.Option.People ? 'is-active' : ''}`}>
                        <div className={`sh-search-value ${this.state.peopleFilled ? 'is-filled' : ''}`} onClick={this.onClickGuests}>
                            {SearchStore.getFullPeople(this.props.people.value)}
                        </div>

                        <span className={`sh-search-input ${!this.state.peopleFilled ? '' : 'is-hidden '}${this.state.selected === SearchStore.Option.Guests ? 'is-active' : ''}`} onClick={this.onClickGuests}>
                            Люди
                        </span>
                    </li>);
        }
    }

    // По клику "когда"
    private onClickWhen = () => {
        // Если выбрана опция "когда"
        if (this.state.selected === SearchStore.Option.Where) {
            // Получаем вводимый элемент
            let input: any = this.refs.whereinput;
            // Фокус на него
            setTimeout(() => input.focus(), 10);
            return;
        }

        // Иначе сбрасываем всё
        this.props.resetPeople();
        this.props.resetGuests();
        this.props.resetWhen();

        // Меняем состояние
        this.setState(prev => ({ ...prev, selected: SearchStore.Option.When, whenFilled: false }));
    }

    // При изменении начальной даты "когда"
    private onChangeWhenStart = (date: moment.Moment) => {
        // Выбор начальной даты
        this.props.selectWhenStart(date);
        // Меняем состояние
        this.setState(prev => ({ ...prev, whenFilled: true }));
    }

    // При изменении конечной даты бронирования "когда"
    private onChangeWhenEnd = (date: moment.Moment) => {
        // Выбор конечной даты
        this.props.selectWhenEnd(date);
        // Обновляем гостей
        this.props.updateGuestsAdults(this.props.guests.value.adults);
    }

    // Применить фильтр дат
    private applyDatesFilter = () => {
        // Меняем состояние
        this.setState(prev => ({ ...prev, selected: SearchStore.Option.Guests, whenFilled: true }));
    }

    // Отменить работу фильтра
    private cancelFilterOpeartion = () => {
        // Меняем состояние
        this.setState(prev => ({ ...prev, selected: '' }));
    }

    // Сбросить фильтр дат
    private resetDatesFilter = () => {
        // Меняем состояние
        this.setState(prev => ({ ...prev, selected: SearchStore.Option.When, whenFilled: false }));
        // Сбрасываем "где"
        this.props.resetWhen();
    }

    // Рендеринг опции "когда"
    private renderOptionWhen(): JSX.Element {
        // Получаем DatePicker react
        const DatePicker: any = (require('react-datepicker') as any).default;

        // Если нет стартовой даты
        if (!this.props.when.value.startDate) {
            return (<div className='sh-search-when'>
                        <DatePicker
                            selected={this.props.when.value.startDate}
                            selectsStart
                            inline
                            startDate={this.props.when.value.startDate}
                            endDate={this.props.when.value.endDate}
                            onChange={this.onChangeWhenStart}
                            minDate={moment()}
                            locale='ru-RU'
                            monthsShown={2}/>
                        <div className='sh-search-buttons'>
                            <button className='sh-search-calendar_button btn' onClick={this.cancelFilterOpeartion}>Отмена</button>
                            <button disabled className='sh-search-calendar_button btn'>Применить</button>
                        </div>
                    </div>);
        } else {
            return (<div className={`sh-search-when ${this.props.when.value.endDate === this.props.when.value.startDate ? '' : ' disabled_hover'}`}>
                        <DatePicker
                            selected={this.props.when.value.endDate}
                            selectsEnd
                            inline
                            startDate={this.props.when.value.startDate}
                            endDate={this.props.when.value.endDate}
                            minDate={this.props.when.value.startDate}
                            onChange={this.onChangeWhenEnd}
                            locale='ru-RU'
                            monthsShown={2}/>
                        <div className='sh-search-buttons'>
                            <button className='sh-search-calendar_button btn' onClick={this.resetDatesFilter}>Сбросить</button>
                            <button className={`sh-search-calendar_button sh-search-calendar_button--highlight btn ${this.props.when.value.endDate === this.props.when.value.startDate ? 'isDisabled' : ''}`} onClick={this.applyDatesFilter}>Применить</button>
                        </div>
                    </div>);
        }
    }

    // По клику "гости"
    private onClickGuests = () => {
        // Если выбрана опция "где"
        if (this.state.selected === SearchStore.Option.Where) {
            // Получаем ввод
            let input: any = this.refs.whereinput;
            // Фокусим
            setTimeout(() => input.focus(), 10);
            return;
        }

        if (this.state.selected === SearchStore.Option.When) {
            return;
        }

        // Сбрасываем гостей
        this.props.resetGuests();
        // Обновляем всё по дефолту
        this.props.updateGuestsAdults(1);
        this.props.updateGuestsBaby(0);
        this.props.updateGuestsKids(0);
        this.props.updateGuestsRooms(1);

        // Меняем состояние
        this.setState(prev => ({ ...prev, selected: SearchStore.Option.Guests, guestsFilled: true, peopleFilled: true }));
    }

    // Проверка на число
    private checkNumber(n: string): boolean {
        return !n || parseFloat(n) === Number(n);
    }

    // При изменении взрослых гостей
    private onChangeGuestsAdults = (e: any) => {
        const value = e.currentTarget.value;

        // Если не число - выходим
        if (!this.checkNumber(value)) {
            return;
        }

        // Обновляем
        this.props.updateGuestsAdults(e.currentTarget.value);
    }

    // При изменении детей гостей
    private onChangeGuestsKids = (e: any) => {
        // Обновляем
        this.props.updateGuestsKids(e.currentTarget.value);
    }

    // При изменении маленьких детей гостей
    private onChangeGuestsBaby = (e: any) => {
        // Обновляем
        this.props.updateGuestsBaby(e.currentTarget.value);
    }

    // При изменении гостей номера
    private onChangeGuestsRooms = (e: any) => {
        // Обновляем
        this.props.updateGuestsRooms(e.currentTarget.value);
    }

    // При изменении гостей по работе
    private onChangeGuestsWork = (isForWork: boolean) => {
        // Обновляем
        this.props.updateGuestsWork(isForWork);
    }

    // При изменении гостей "питомец"
    private onChangeGuestsPet = (bringPet: boolean) => {
        // Обновляем
        this.props.updateGuestsPet(bringPet);
    }

    // При изменении людей
    private onChangePeople = (e: any) => {
        // Обновляем
        this.props.updatePeople(e.currentTarget.value);
    }

    // Удаление гостя
    private removeGuest = (type: SearchStore.Guest) => {
        switch (type) {
            case SearchStore.Guest.Adults:
                // Вычитаем -1
                let adults = this.props.guests.value.adults - 1;
                // Обновляем
                if (adults) {
                    this.props.updateGuestsAdults(adults);
                }
                break;

            case SearchStore.Guest.Kids:
                // Вычитаем -1
                let kids = this.props.guests.value.kids - 1;
                // Обновляем
                if (kids >= 0) {
                    this.props.updateGuestsKids(kids);
                }
                break;

            case SearchStore.Guest.Babies:
                 // Вычитаем -1
                let babies = this.props.guests.value.baby - 1;
                // Обновляем
                if (babies >= 0) {
                    this.props.updateGuestsBaby(babies);
                }
                break;
        }
    }

    // Добавление гостя
    private addGuest = (type: SearchStore.Guest) => {
        switch (type) {
            case SearchStore.Guest.Adults:
                // Добавляем +1
                let adults = this.props.guests.value.adults + 1;
                // Обновляем
                this.props.updateGuestsAdults(adults);
                break;

            case SearchStore.Guest.Kids:
                // Добавляем +1
                let kids = this.props.guests.value.kids + 1;
                // Обновляем
                this.props.updateGuestsKids(kids);
                break;

            case SearchStore.Guest.Babies:
                // Добавляем +1
                let babies = this.props.guests.value.baby + 1;
                // Обновляем
                this.props.updateGuestsBaby(babies);
                break;
        }
    }

    // Добавление номера
    private addRoom = () => {
        // Добавляем +1
        let rooms = this.props.guests.value.rooms + 1;
        // Обновляем
        this.props.updateGuestsRooms(rooms);
    }

    // Удаление номера
    private removeRoom = () => {
        if (!this.props.guests.value.rooms || this.props.guests.value.rooms < 2) {
            return;
        }

        // Вычитаем -1 и обновляем
        let rooms = this.props.guests.value.rooms - 1;
        this.props.updateGuestsRooms(rooms);
    }

    // Выбрать одиого гостя
    private selectOneRoom = () => {
        this.props.updateGuestsRooms(1);
    }

    // Рендеринг опции "гости"
    private renderOptionGuests(): JSX.Element {
        return (<div className='sh-guests'>
                    <section className='sh-guests-config'>
                        <div className='sh-guests-people'>
                            <div className='sh-guests-people_row'>
                                <div className='sh-guests-description'>
                                    <span className='sh-guests-title'>Взрослые</span>
                                    <span className='sh-guests-text'>14 лет и выше</span>
                                </div>

                                <IncrementDecrement
                                    value={this.props.guests.value.adults}
                                    increment={() => this.addGuest(SearchStore.Guest.Adults)}
                                    decrement={() => this.removeGuest(SearchStore.Guest.Adults)}
                                    change={this.onChangeGuestsAdults} />
                            </div>

                            <div className='sh-guests-people_row'>
                                <div className='sh-guests-description'>
                                    <span className='sh-guests-title'>Дети</span>
                                    <span className='sh-guests-text'>От 2 до 13 лет</span>
                                </div>

                                <IncrementDecrement
                                    value={this.props.guests.value.kids}
                                    increment={() => this.addGuest(SearchStore.Guest.Kids)}
                                    decrement={() => this.removeGuest(SearchStore.Guest.Kids)}
                                    change={this.onChangeGuestsKids} />
                            </div>

                            <div className='sh-guests-people_row'>
                                <div className='sh-guests-description'>
                                    <span className='sh-guests-title'>Маленькие дети</span>
                                    <span className='sh-guests-text'>Менее 2-х лет</span>
                                </div>

                                <IncrementDecrement
                                    value={this.props.guests.value.baby}
                                    increment={() => this.addGuest(SearchStore.Guest.Babies)}
                                    decrement={() => this.removeGuest(SearchStore.Guest.Babies)}
                                    change={this.onChangeGuestsBaby} />
                            </div>
                        </div>

                        <div className='sh-guests-rooms'>
                            <div ref='oneRoomBox' className='sh-guests-room sh-guests-room--default is-active' 
                                onClick={() => this.props.updateGuestsRooms(1)}>
                                <i className='sh-guests-room_icon sh-guests-room_icon--one icon-sh-key'></i>
                                <span>Один номер</span>
                            </div>

                            <div ref='twoRoomBox' className='sh-guests-room sh-guests-room--default' 
                                onClick={() => this.props.updateGuestsRooms(2)}>
                                <i className='sh-guests-room_icon icon-sh-keys'></i>
                                <span>Два номера</span>
                            </div>

                            <div ref='moreRoomBox' className='sh-guests-room sh-guests-room--counter'>
                                <div className='sh-guests-custom'>
                                    <button onClick={() => this.removeRoom()} className='sh-guests-room_button'>
                                        <i className='icon-sh-less'></i>
                                    </button>
                                    <input className='sh-guests-room_input' type='text' 
                                        value={this.props.guests.value.rooms} 
                                        onChange={this.onChangeGuestsRooms} />
                                    <button onClick={() => this.addRoom()} className='sh-guests-room_button'>
                                        <i className='icon-sh-plus'></i>
                                    </button>
                                </div>
                                <span>Номера</span>
                            </div>
                        </div>
                    </section>

                    <section className='sh-guests-extra'>
                        Вы принесёте питомца?
                        <button className={'sh-guests-extra_button btn ' + (!this.props.guests.value.pet ? 'is-active' : '')} onClick={() => this.onChangeGuestsPet(false)}>Нет</button>
                        <button className={'sh-guests-extra_button btn ' + (this.props.guests.value.pet ? 'is-active' : '')} onClick={() => this.onChangeGuestsPet(true)}>Да</button>
                        <Link className={'sh-guests-pets_link' + (!this.props.guests.value.pet ? '-hidden' : '')} to={`/Pets`}>Проверить питомца</Link>
                    </section>
                </div>);
    }

    // Добавление человека
    private addPeople = () => {
        // Добавляем +1
        let people = this.props.people.value.total + 1;
        // Обновляем
        this.props.updatePeople(people);
    }

    // Удаление человека
    private removePeople = () => {
        // Вычитаем -1
        let people = this.props.people.value.total - 1;
        if (!people) {
            return;
        }
        // Обновляем
        this.props.updatePeople(people);
    }

    // Выбор сервиса
    private selectService = (e: any) => {
        $(e.currentTarget).toggleClass('is-active');
    }

    // Рендер опции "люди"
    private renderOptionPeople(): JSX.Element {
        let services = [
            {
                icon: 'sh-wifi',
                description: 'Бесплатный Wi-Fi'
            },
            {
                icon: 'sh-air-conditioning',
                description: 'Кондиционер'
            },
            {
                icon: 'sh-breakfast',
                description: 'Завтрак'
            },
            {
                icon: 'sh-elevator',
                description: 'Лифт'
            }
        ];

        return (<div className='sh-guests sh-guests--people'>
                    <section className='sh-guests-config'>
                        <div className='sh-guests-people'>
                            <div className='sh-guests-people_row'>
                                <div className='sh-guests-description'>
                                    <span className='sh-guests-title'>Человек (1-40)</span>
                                    <span className='sh-guests-text'>(1-40 человек)</span>
                                    <a className='sh-guests-link'>Запросить цитаты (41+ людей)</a>
                                </div>

                                <IncrementDecrement
                                    value={this.props.people.value.total}
                                    increment={() => this.addPeople()}
                                    decrement={() => this.removePeople()}
                                    change={() => this.onChangePeople}/>
                            </div>
                        </div>

                        <div className='sh-guests-people_services'>
                            <ul className='sh-guests-services'>
                                {services.map((service: any, key: any) =>
                                    <li className='sh-guests-service' onClick={this.selectService} key={key}>
                                        <i className={`sh-guests-service_icon icon-${service.icon}`}></i>
                                        {service.description}
                                    </li>
                                )}
                            </ul>

                            <div className='sh-guests-form'>
                                <Checkbox name='Нужно больше опций?'/>
                                <textarea className='sh-guests-textarea' />
                            </div>
                        </div>
                    </section>
                </div>);
    }

    // Рендер текущей опции
    private renderCurrentOption(): JSX.Element {
        switch (this.state.selected) {
            case SearchStore.Option.Where:
                return this.renderOptionWhere();

            case SearchStore.Option.When:
                if (this.state.shouldRender) {
                    return this.renderOptionWhen();
                }

            case SearchStore.Option.Guests:
                return this.renderOptionGuests();

            case SearchStore.Option.People:
                return this.renderOptionPeople();

            default:
                return (<div></div>);
        }
    }

    public render(): JSX.Element {
        return <div className='sh-search'>
                   <div className='sh-search-wrapper'>
                       <ul className='sh-search-tabs'>
                           <li className={`sh-search-tab ${this.state.tab === SearchStore.Tab.Smart ? 'is-active' : ''}`} 
                                onClick={() => this.onClickTab(SearchStore.Tab.Smart)}>
                               Умный номер
                           </li>

                           <li className={`sh-search-tab ${this.state.tab === SearchStore.Tab.Conference ? 'is-active' : ''}`} 
                                onClick={() => this.onClickTab(SearchStore.Tab.Conference)}>
                               Конференц-зал
                           </li>
                       </ul>

                       <ul className='sh-search-inputs'>
                           <li className={`sh-search-group ${this.state.selected === SearchStore.Option.Where ? 'is-active' : ''}`}>
                               <div className={`sh-search-value ${this.state.whereFilled ? 'is-filled' : ''}`} 
                                    onClick={this.onClickWhere}>
                                   {SearchStore.getFullCity(this.props.where.value)}
                               </div>

                               <input className={`sh-search-input ${!this.state.whereFilled ? '' : 'is-hidden'}`}
                                      type='text'
                                      ref='whereinput'
                                      placeholder='Где'
                                      onKeyUp={this.onChangeWhere}
                                      onClick={this.onClickWhere}/>

                               <section className={`sh-search-options sh-search-options--s ${this.state.started && this.state.selected === SearchStore.Option.Where ? '' : 'is-hidden'}`}>
                                   {this.props.isLoading ? <Loading/> : this.renderCurrentOption()}
                               </section>
                           </li>

                           <li className={`sh-search-group ${this.state.selected === SearchStore.Option.When ? 'is-active' : ''}`}>
                               <div className={`sh-search-value ${this.state.whenFilled ? 'is-filled' : ''}`} 
                                    onClick={this.onClickWhen}>
                                   {SearchStore.getShortDates(this.props.when.value.startDate, this.props.when.value.endDate)}
                               </div>

                               <span className={`sh-search-input ${!this.state.whenFilled ? '' : 'is-hidden '}${this.state.selected === SearchStore.Option.When ? 'is-active' : ''}`} 
                                    onClick={this.onClickWhen}>
                                   Когда
                               </span>

                               <section className={`sh-search-options sh-search-options--s ${this.state.started && this.state.selected === SearchStore.Option.When ? '' : 'is-hidden'}`}>
                                   {this.props.isLoading ? <Loading/> : this.renderCurrentOption()}
                               </section>
                           </li>

                           {this.renderGuestsOrPeople()}

                           <li className='sh-search-group--button'>
                               <Link to={'/SearchRooms'} className={`sh-search-button btn ${SearchStore.getFullCity(this.props.where.value) && this.state.whenFilled ? '' : 'is-disabled'}`}>
                                   {this.state.tab === SearchStore.Tab.Smart ? 'Найти номер' : 'Найти конференц-зал'}
                               </Link>
                           </li>
                       </ul>

                       <section className={`sh-search-options sh-search-options--m ${this.state.started ? '' : 'is-hidden'}`}>
                           {this.props.isLoading ? <Loading/> : this.renderCurrentOption()}
                       </section>
                   </div>
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.search, // Выбирает, какие свойства состояния объединяются в props компонента
    SearchStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(Search) as any;