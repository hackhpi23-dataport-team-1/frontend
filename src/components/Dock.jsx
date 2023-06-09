import React from 'react';
import hackathon_logo from '../images/hackhpi_logo.jpeg';
import { Link } from 'react-router-dom';

const Dock = () => {
    return (
        <div className="dock">
            <div className="dock__item">
                <div className="dock__item__icon">
                    <img src={hackathon_logo} alt="HackHPI 2023 Logo" className='dock__item__icon__logo'/>
                </div>
            </div>
            <Link to="/" className="dock__item">
                <div className="dock__item__icon">
                    <svg className="dock__item__icon__icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M11.5 0c6.347 0 11.5 5.153 11.5 11.5s-5.153 11.5-11.5 11.5-11.5-5.153-11.5-11.5 5.153-11.5 11.5-11.5zm0 1c5.795 0 10.5 4.705 10.5 10.5s-4.705 10.5-10.5 10.5-10.5-4.705-10.5-10.5 4.705-10.5 10.5-10.5zm.5 10h6v1h-6v6h-1v-6h-6v-1h6v-6h1v6z"/></svg>
                </div>
            </Link>
        </div>
    );
}

export default Dock;