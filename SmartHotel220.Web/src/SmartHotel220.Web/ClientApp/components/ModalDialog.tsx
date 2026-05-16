import * as React from 'react';
import * as Modal from 'react-modal';
import { connect } from 'react-redux';
import { IApplicationState as ApplicationState } from '../store';
import * as ModalDialogStore from '../store/ModalDialog';

// Props
type ModalDialogProps = ModalDialogStore.IModalDialogState
    & { callback: Function }
    & typeof ModalDialogStore.actionCreators

// Кастомные стили
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: 0
    }
};

// Модальный диалог
class ModalDialog extends React.Component<ModalDialogProps, {}> {

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        this.props.onRef(this);
    }

    // Освобождение ресурсов
    // Вызывается перед удалением компонента из DOM
    public componentWillUnmount() {
        this.props.onRef(undefined);
    }

    // Закрытие
    public close = () => {
        this.props.close();
        this.props.callback();
    }

    // Открытие
    public open = () => {
        this.props.open();
    }

    public render(): JSX.Element {
        return (
            <Modal
                isOpen={this.props.isModalOpen}
                contentLabel='Modal'
                style={customStyles}
                onRequestClose={this.close}>
                {this.props.children}
            </Modal>
        );
    }
}

// Подключаем компонент React к хранилищу Redux
export default connect(
    (state: ApplicationState) =>  state.modalDialog, // Выбирает, какие свойства состояния объединяются в props компонента
    ModalDialogStore.actionCreators                  // Выбирает, какие создатели действий объединяются в props компонента
)(ModalDialog) as any;