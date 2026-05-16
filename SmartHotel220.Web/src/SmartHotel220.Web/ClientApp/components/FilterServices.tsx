import * as React from 'react';
import Checkbox from './Checkbox';

// TODO: Переместить props и интерфейс в хранилище (store)
// Описывает сервис, который подвержен фильтрации
interface IService {
    name: string;
    selected: boolean;
}

// Состояние
type FilterServicesState = {
    services: IService[];
}

// Фильтрация сервисов
export default class FilterServices extends React.Component<{}, FilterServicesState> {

    constructor() {
        super();
        // Создаём состояние сервисов
        this.state = {
            services: []
        };
    }

    // Вызывается после рендеринга компонента
    public componentDidMount() {
        // Заполняем сервисами
        this.setState({
            services: [
                {
                    name: 'Бесплатный Wi-Fi',
                    selected: false
                },
                {
                    name: 'Парковка',
                    selected: false
                },
                {
                    name: 'ТВ',
                    selected: false
                },
                {
                    name: 'Кондиционер',
                    selected: false
                },
                {
                    name: 'Сушилка',
                    selected: false
                },
                {
                    name: 'Крытый камин',
                    selected: false
                },
                {
                    name: 'Рабочее пространство',
                    selected: false
                },
                {
                    name: 'Завтрак',
                    selected: false
                },
                {
                    name: 'Зона для детей',
                    selected: false
                },
                {
                    name: 'Трансфер до аэропорта',
                    selected: false
                },
                {
                    name: 'Бассейн',
                    selected: false
                },
                {
                    name: 'Фитнес клуб',
                    selected: false
                },
                {
                    name: 'Гимнастический зал',
                    selected: false
                },
                {
                    name: 'Джакузи',
                    selected: false
                },
                {
                    name: 'Ресторан',
                    selected: false
                },
                {
                    name: 'Доступно для инвалидов',
                    selected: false
                },
                {
                    name: 'Лифт',
                    selected: false
                }
            ]
        });
    }

    public render() {
        // Всего
        const total = this.state.services.length;
        // Половина
        const half = total / 2;

        // Делим массив на одну половину и фильтруем используя map
        const list1 = this.state.services.slice(0, half).map((service: IService, key: any) => {
            return <div key={key}>
                       <Checkbox name={service.name}/>
                   </div>;
        });

        // Делим массив на вторую половину и фильтруем используя map
        const list2 = this.state.services.slice(half, total).map((service: IService, key: any) => {
            return <div key={key}>
                       <Checkbox name={service.name}/>
                   </div>;
        });

        // Возвращаем всё
        return <div className='sh-filter_services'>
                   <div>{list1}</div>
                   <div>{list2}</div>
               </div>;
    }
}