import * as React from 'react';
import * as $ from 'jquery';
import { RouteComponentProps } from 'react-router-dom';
import { IApplicationState as ApplicationState } from '../store';
import { connect } from 'react-redux';
import Rooms from './Rooms';
import * as RoomsState from '../store/Rooms';
import * as PetsStore from '../store/Pets';
import { Status } from '../store/Pets';
import Search from './Search';
import { RoomHighlighted } from './RoomHighlighted';
import Loading from './Loading';

// Props питомцев
type PetsProps = PetsStore.IPetsState
    & typeof PetsStore.actionCreators
    & RouteComponentProps<{}>;

// Компонент питомцев
class Pets extends React.Component<PetsProps, {}> {

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        this.props.init();
    }

    // При изменении файла
    private onFileChange = (evt: any) => {
        // Наш файл выбранный пользователем
        let input = evt.target;
        // Создаём читатель
        let reader = new FileReader();
        // Настраиваем читателя на момент успешного завершения операции чтения
        reader.onload = (evt: any) => {
            // Создаём инфо о питомце
            let pet = new PetsStore.PetInfo();
            // Прочтённый результат
            pet.base64 = reader.result;
            // Загрузка питомца
            this.props.uploadPet(pet);
        };
        // Запускаем процесс чтения данных указанного БЛОБ
        reader.readAsDataURL(input.files[0]);
    }

    // По загрузке
    private onClickUploader = () => {
        if (this.props.image) {
            return;
        }

        // Вызываем родной загрузчик
        $(this.refs.nativeUpload).click();
    }

    public render() {
        return <div className='sh-pets'>
                    <div className='sh-pets-hero'>
                        <div className='sh-pets-wrapper'>
                            <img className='sh-pets-logo' src='/assets/images/logo.svg' />
                            <h1 className='sh-pets-title'>Будущее интеллектуального гостеприимства и связанного с ним рабочего места</h1>
                        </div>
                    </div>
                    <div className='sh-pets-margin'></div>
                    <h2 className='sh-pets-subtitle'>Хотите узнать, может ли Ваше домашнее животное сопровождать вас?</h2>

                    <section className={'sh-uploader ' + (this.props.isThinking || this.props.isUploading ? 'is-loading' : 'is-empty') + ' ' + (this.props.status.approved === true ? 'is-ok' : '') + ' ' + (this.props.status.approved === false ? 'is-bad' : '')} onClick={this.onClickUploader}>
                        {this.props.image ? <div className='sh-uploader-image' style={{ backgroundImage: `url(${this.props.image})` }}></div> : <div className='sh-uploader-avatar'></div>}

                        <div className='sh-uploader-loading'>
                            {this.props.isThinking || this.props.isUploading ? <div><Loading isBright={true} /></div> : <div></div>}
                        </div>
                    </section>

                    {!this.props.isThinking && !this.props.isUploading && this.props.status.approved === null ? <span className='sh-pets-smalltitle'>Нажмите на аватар, чтобы загрузить изображение</span> : <span></span>}
                    {this.props.isUploading ? <span className='sh-pets-smalltitle'>Загрузка изображения...</span> : <span></span>}
                    {this.props.isThinking ? <span className='sh-pets-smalltitle'>Обработка изображения...</span> : <span></span>}

                    {this.props.status.approved === true ? <span className='sh-pets-smalltitle is-ok'>Ваш питомец выглядит как "{this.props.status.message}" и Вы можете взять его с собой =)</span> : <span></span>}
                    {this.props.status.approved === false ? <span className='sh-pets-smalltitle is-bad'>Извините, Ваш питомец выглядит как "{this.props.status.message}" и Вы НЕ можете взять его с собой =(</span> : <span></span>}

                    <input className='is-hidden' ref='nativeUpload' type='file' onChange={this.onFileChange} />
                </div>;
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) => state.pets, // Выбирает, какие свойства состояния объединяются в props компонента
    PetsStore.actionCreators                 // Выбирает, какие создатели действий объединяются в props компонента
)(Pets) as any;