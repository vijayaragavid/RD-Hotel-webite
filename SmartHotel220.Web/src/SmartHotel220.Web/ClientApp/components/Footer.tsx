import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';

// Подвал
export class Footer extends React.Component<{}, {}> {

    public render() {
        return <footer className='sh-footer'>
                   <section className='sh-footer-content'>
                       <div>
                           <div className='sh-footer-section'>
                               <img className='sh-footer-logo' src='/assets/images/logo.svg'/>
                           </div>
                       </div>
                       <div>
                           <div className='sh-footer-section'>
                               <ul className='sh-footer-list'>
                                   <li>
                                       <a className='sh-footer-link' href='#'>Соглашения</a>
                                   </li>
                                   <li>
                                       <a className='sh-footer-link' href='#'>Политика конфиденциальности</a>
                                   </li>
                                   <li>
                                       <a className='sh-footer-link' href='#'>Помощь</a>
                                   </li>
                                   <li>
                                       <a className='sh-footer-link' href='#'>Контакты</a>
                                   </li>
                               </ul>
                           </div>
                       </div>
                       <div>
                           <div className='sh-footer-section'>
                               <p>Поделиться</p>
                               <ul className='sh-footer-social'>
                                   <li>
                                       <a href='#'>
                                           <img className='sh-footer-icon' src='/assets/images/instagram.svg'/>
                                       </a>
                                   </li>
                                   <li>
                                       <a href='#'>
                                           <img className='sh-footer-icon' src='/assets/images/facebook.svg'/>
                                       </a>
                                   </li>
                                   <li>
                                       <a href='#'>
                                           <img className='sh-footer-icon' src='/assets/images/twitter.svg'/>
                                       </a>
                                   </li>
                               </ul>
                           </div>
                       </div>
                   </section>
                   <section className='sh-footer-disclaimer'>
                       Дипломная работа на тематику отельного бизнеса. &copy; Алексей Бурьянов, 2018.
                   </section>
               </footer>;
    }
}
