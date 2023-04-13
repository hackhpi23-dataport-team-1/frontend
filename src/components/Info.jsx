import React, { useEffect } from 'react';

const Dock = ({vertex}) => {
    const [selectedVertex, setSelectedVertex] = React.useState(null);

    useEffect(() => {
        console.log(vertex);
        if (!vertex) return;

        delete vertex.__indexColor;
        delete vertex.index;
        delete vertex.x;
        delete vertex.y;
        delete vertex.vx;
        delete vertex.vy;
        delete vertex.neighbors;
        delete vertex.links;

        setSelectedVertex(JSON.stringify(vertex, null, 4));
    }, [vertex]);

    if (!vertex) return (
        <div className="info--empty">
            <div>
                <i className="info--empty__icon" />
                <span className="info--empty__text">Select a vertex to see more information</span>
            </div>
        </div>
    );

    return (
        <div className="info">
            <code className="info__title">{vertex.id}</code>
            <code className='info__file-type'>{vertex.kind}</code>
            <pre>
                {selectedVertex && selectedVertex.toString()}
            </pre>
        </div>
    );
}

export default Dock;