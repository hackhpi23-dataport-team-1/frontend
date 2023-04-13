import React from 'react';

const List = ({items}) => {
    return (
        <div className="list">
            {items.map((item, index) => (
                <div className="list__item" key={index}>
                    <span className="list__item__headline">Malware {item.id}</span>
                    <span className="list__item__description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </span>
                </div>
            ))}
        </div>
    );
}

export default List;