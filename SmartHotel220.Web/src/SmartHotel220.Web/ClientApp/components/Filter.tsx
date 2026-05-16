import * as React from 'react';
import * as $ from 'jquery';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { IApplicationState as ApplicationState } from '../store';
import * as RoomsStore from '../store/Rooms';

// Props фильтрации (коллекция значений, которые ассоциированы с данным компонентом)
type FilterProps = {
        title: string,
        left?: number,
        right?: number,
        disabled?: boolean;
    }
    & RoomsStore.IRoomsState
    & typeof RoomsStore.actionCreators;

// Состояние фильтров
type FiltersState = {
    modalVisible: boolean;
}

class Filter extends React.Component<FilterProps, FiltersState> {

    // Заголовок
    private $header: JQuery;
    // Выпадающий список
    private $dropdown: JQuery;
    // Фильтр
    private $filter: JQuery;
    // Узел (обвёртка)
    private node: any;

    constructor() {
        super();

        // Чтобы в методы корректно передавалась ссылка на текущий объект через this
        this.handleClick = this.handleClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);

        // Модальное окно не отображено по умолчанию
        this.state = {
            modalVisible: false
        }
    }

    // Обработчик для контроля модального диалога, в случае, если он отображается
    public handleClick() {
        if (!this.state.modalVisible) {
            document.addEventListener('click', this.handleOutsideClick, false);
        } else {
            document.removeEventListener('click', this.handleOutsideClick, false);
        }

        // Меняем состояние попап элемента
        this.setState(prevState => ({
            popupVisible: !prevState.modalVisible,
        }));
    }

    // Убирает активность элементов фильтрации по внешнему клику (других каких-то элементов на сайте)
    public handleOutsideClick(e: any) {
        if (this.node.contains(e.target)) {
            return;
        }

        this.close();
    }

    // Стили секции выпадающего листа
    private setStyles = () => {
        return {
            left: this.props.left,
            right: this.props.right
        }
    }

    // Переключатель активности элемента
    private toggle = () => {
        if (this.props.disabled) {
            return;
        }

        // Обрабатываем клик
        this.handleClick();
        // Делаем активной шапку
        this.$header.toggleClass('active');
        this.$dropdown.toggleClass('active');
        this.$filter.toggleClass('active');
    }

    // Отмена
    private onClickCancel = () => {
        this.close();
    }

    // Применить
    private onClickApply = () => {
        // Запрос на фильтрацию
        this.props.requestFiltered();
        this.close();
    }

    // Закрыть
    private close = () => {
        // Убираем активность шапки
        this.$header.removeClass('active');
        this.$dropdown.removeClass('active');
        this.$filter.removeClass('active');
    }

    public render() {
        return <div ref='filter' className='sh-filter'>
                   <div ref={(node: any) => { this.node = node; }}>
                       <label className='sh-filter-header sh-filter-arrow' ref='header' onClick={this.toggle}>
                           <span className='sh-filter-title'>{this.props.title}</span>
                           <i className='sh-filter-icon icon-sh-chevron'></i>
                       </label>
                       <section className='sh-filter-dropdown' ref='dropdown' style={this.setStyles()}>
                           <div>
                               {this.props.children}
                           </div>
                           <ul className='sh-filter-actions'>
                               <li className='sh-filter-button sh-filter-button--cancel' onClick={this.onClickCancel}>Отмена</li>
                               <li className='sh-filter-button sh-filter-button--apply' onClick={this.onClickApply}>Применить</li>
                           </ul>
                       </section>
                   </div>
               </div>;
    }

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        // Получаем элементы с помощью jquery
        this.$header = $(this.refs.header);
        this.$dropdown = $(this.refs.dropdown);
        this.$filter = $(this.refs.filter);
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.rooms, // Выбирает, какие свойства состояния объединяются в props компонента
    RoomsStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(Filter) as any;