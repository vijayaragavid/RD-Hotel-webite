import * as React from 'react';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import * as Swipeable from 'react-swipeable';
import * as ConferenceRoomsFeaturesStore from '../store/ConferenceRoomsFeatures';

// Props фич конференц румы (коллекция значений, которые ассоциированы с данным компонентом)
type ConferenceRoomsFeaturesProps =
    ConferenceRoomsFeaturesStore.IFeaturesState
    & Swipeable.SwipeableProps
    & typeof ConferenceRoomsFeaturesStore.actionCreators;

// Компонент фич конференц-зала
class ConferenceRoomsFeatures extends React.Component<ConferenceRoomsFeaturesProps, {}> {

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        this.props.request();
    }

    // Меняет фоновую картинку номера. Возвращает стиль CSS в виде JSON
    private setBackgroundImage(image: string): any {
        return {
            backgroundImage: `url(${image})`,
        };
    }

    // При загрузке
    private onLoad = () => {
        console.log(this.props);
    };

    // По свайпу влево
    private onSwipedLeft = () => {
        // Свайпэйбл транслируем влево
        this.props.translateLeft();
    };

    // По свайпу вправо
    private onSwipedRight = () => {
        // Свайпэйбл транслируем вправо
        this.props.translateRight();
    };

    // Рендеринг номера в карусели
    private renderRoomInCarousel(feature: any, key: any) {
        return (<li key={key} className={`sh-rooms_feature-wrapper ${feature.title ? '' : 'is-invisible'}`}>
                    <div className='sh-rooms_feature-image' style={this.setBackgroundImage(feature.imageUrl)}></div>
                    <div className='sh-rooms_feature-box'>
                        <span className='sh-rooms_feature-title'>{feature.title}</span>
                        <span className='sh-rooms_feature-text'>{feature.description}</span>
                    </div>
                </li>);
    }

    public render() {
        return <div className='sh-rooms_feature'>
                   <span className='sh-rooms_feature-arrow icon-sh-chevron' onClick={this.onSwipedRight}></span>
                   <span className='sh-rooms_feature-arrow sh-rooms_feature-arrow--right icon-sh-chevron' onClick={this.onSwipedLeft}></span>

                   <Swipeable
                       trackMouse
                       onSwipedLeft={this.onSwipedLeft}
                       onSwipedRight={this.onSwipedRight}>
                       <div className='sh-rooms_feature-carousel'>
                           <ul className='sh-rooms_feature-slider' style={this.props.translation.styles}>
                               {this.props.list.map((feature: any, key: any) => this.renderRoomInCarousel(feature, key))}
                           </ul>
                       </div>
                   </Swipeable>

                   <button className='sh-rooms_feature-button btn'>Найти конференц-зал</button>
               </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.conferenceRoomsFeatures, // Выбирает, какие свойства состояния объединяются в props компонента
    ConferenceRoomsFeaturesStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(ConferenceRoomsFeatures) as any;