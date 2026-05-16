import * as React from 'react';
import * as RoomsStore from '../store/Rooms';
import { settings } from '../Settings';

// Номер выше футера
export default class Room extends React.Component<RoomsStore.IRoom, {}> {

    // Изменить фон
    private setBackgroundImage(image: string): { [key: string]: string } {   
        return {
            backgroundImage: `url(${settings.urls.images_Base}${image}), url('assets/images/placeholder.png')`
        };
    }

    protected navigationButtons(): JSX.Element {
        return (<span></span>);
    }

    // Отрисовать звёзды. Возвращает массив JSX элементов
    private drawStars(rating: number): JSX.Element[] {
        // Максимум 5 звёзд
        const max = 5;
        // Сами звёзды
        let stars = [];

        // Заполняем массив звёзд
        for (let i = 1; i <= max; i++) {
            stars.push(<i className={'sh-room-star active icon-sh-star ' + (i <= rating ? 'is-active' : '')} key={i}></i>);
        }

        return stars;
    }

    // Получить лэйбл цены. Если тип равен отелю, то это ночь иначе день
    private getPriceLabel(type: string): string {
        return type === 'hotel' ? 'Ночь' : 'День';
    }

    public render() {
        return <div className='sh-room'>
                   <header className='sh-room-header'>
                       <div className='sh-room-image' style={this.setBackgroundImage(this.props.picture)}></div>
                       {this.navigationButtons()}
                   </header>
                   <article className='sh-room-info'>
                       <div className='sh-room-column sh-room-column--left'>
                           <span className='sh-room-title sh-room-row'>{this.props.name}</span>
                           <span className='sh-room-text'>{this.props.city}</span>
                       </div>
                       <div className='sh-room-column sh-room-column--right'>
                           <div className='sh-room-row'>
                               <span className='sh-room-price'>${this.props.price}/</span>
                               <span className='sh-room-label'>{this.getPriceLabel(this.props.itemType)}</span>
                           </div>
                           <span className='sh-room-stars'>
                               {this.drawStars(this.props.rating)}
                           </span>
                       </div>
                   </article>
               </div>;
    }
}