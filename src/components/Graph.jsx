import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import SpriteText from 'three-spritetext';

const Graph = ({setVertex}) => {
    const [graphData, setGraphData] = useState({nodes: [], links: []});
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState(null);
    const [loading, setLoading] = useState(true);

    const fgRef = useRef();

    const parseGraph = (response) => {
        const graph = {
                nodes: response.data.vertices,
                links: response.data.edges
            };

            console.log(graph);

            // cross-link node objects
            graph.links.forEach(link => {
                const a = graph.nodes.find((node) => node.id === link.from);
                const b = graph.nodes.find((node) => node.id === link.to);
                !a.neighbors && (a.neighbors = []);
                !b.neighbors && (b.neighbors = []);
                a.neighbors.push(b.id);
                b.neighbors.push(a.id);

                !a.links && (a.links = []);
                !b.links && (b.links = []);
                a.links.push(link);
                b.links.push(link);
            });

            console.log(graph);

            setGraphData(graph);
            setLoading(false);
    }

    useEffect(() => {
        setLoading(true);
        axios.get('http://127.0.0.1:5000/case/1').then(parseGraph);
    }, []);

    const nodePaint = useCallback((node, color, ctx) => {
        const radius = node.score / 100 * 5;

        let inner = new Path2D();
        inner.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);

        let outer = new Path2D();
        outer.arc(node.x, node.y, radius + node.score / 100 * 2, 0, 2 * Math.PI, false);

        ctx.fillStyle = node === hoverNode ? "#FFEC74" : color;
        ctx.fill(inner);

        ctx.lineWidth = node.score / 100;
        ctx.strokeStyle = color;
        ctx.stroke(outer);
        
        if (highlightNodes.has(node.id)) {
            ctx.strokeStyle = "#FFEC74";
            ctx.stroke(outer);
        }

        const type = `${node.kind}`;
        const fontSize = 2;
        ctx.font = `bold ${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = "#000000";
        ctx.fillText(type, node.x, node.y - node.score / 100 * 8 - 4);

        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillText(node.id, node.x, node.y - node.score / 100 * 8 - 1.5);

    }, [hoverNode, highlightNodes]);

    const getColor = (node) => {
        // rgba(80,87,176,1) 0%, rgba(255,44,0,1) 100%

        const start = {
            red: 80,
            green: 87,
            blue: 176,
        }

        const end = {
            red: 255,
            green: 44,
            blue: 0,
        }

        const percentFade = node.score / 100.0;

        var diffRed = end.red - start.red;
        var diffGreen = end.green - start.green;
        var diffBlue = end.blue - start.blue;

        diffRed = Math.floor((diffRed * percentFade) + start.red);
        diffGreen = Math.floor((diffGreen * percentFade) + start.green);
        diffBlue = Math.floor((diffBlue * percentFade) + start.blue);

        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        const color = rgbToHex(diffRed, diffGreen, diffBlue);
        return color;
    }

    const graphWidth = window.innerWidth - 120;

    const onNodeClick = (node) => {
        if (node === hoverNode) {
            setHoverNode(null);
            setVertex(null);
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            return;
        };

        const clickedNode = {...node};

        setVertex(clickedNode);

        const highlightedNodes = new Set();
        const highlightedLinks = new Set();

        if (node) {
            highlightedNodes.add(node.id);
            node.neighbors.forEach(neighbor => highlightedNodes.add(neighbor));
            node.links.forEach(link => highlightedLinks.add({
                from: link.from,
                to: link.to
            }));
        }

        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        setHighlightNodes(highlightedNodes);
        setHighlightLinks(highlightedLinks);
        setHoverNode(node || null);
    };

    const linkPaint = (link, ctx) => {
        const LABEL_NODE_MARGIN = 1 * 1.5;

        const start = link.source;
        const end = link.target;

        // ignore unbound links
        if (typeof start !== 'object' || typeof end !== 'object') return;

        // calculate label positioning
        const textPos = Object.assign(...['x', 'y'].map(c => ({
            [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
        })));

        const relLink = { x: end.x - start.x, y: end.y - start.y };

        const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;

        let textAngle = Math.atan2(relLink.y, relLink.x);
        // maintain label vertical orientation for legibility
        if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
        if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

        const label = link.kind;

        // estimate fontSize to fit in link length
        ctx.font = '1px Sans-Serif';
        const fontSize = 1.4;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

        // draw text label (with background rect)
        ctx.save();
        ctx.translate(textPos.x, textPos.y);
        ctx.rotate(textAngle);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(link.source.vx, link.source.vy, link.target.x - link.source.x, 0.1);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(link.x, link.y, 1, 1);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, ...bckgDimensions);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'darkgrey';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    }

    useEffect(() => {
        console.log(highlightLinks);
    }, [highlightLinks]);

    const findLink = (link) => {
        return Array.from(highlightLinks.values()).find((l) => l.from === link.from && l.to === link.to);
    }

    if (loading) {
        return (
            <div className="loading">
                <h1>Loading the previous Case...</h1>
            </div>
        )
    }

    return (
        <ForceGraph2D 
            ref={fgRef}
            graphData={graphData} 
            linkSource='from'
            linkTarget='to'
            autoPauseRedraw={false}
            width={graphWidth}
            height={window.innerHeight - 40}
            className="graph"
            nodePointerAreaPaint={nodePaint}
            nodeCanvasObject={(node, ctx) => nodePaint(node, highlightNodes.has((id) => id === node.id) ? "#00ff00" : getColor(node), ctx)}
            onNodeClick={onNodeClick}
            linkWidth={link => findLink(link) ? 5 : 1}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={link => findLink(link) ? 4 : 0}
            cooldownTime={0}
            onNodeRightClick={() => {
                setHoverNode(null);
                setHighlightNodes(new Set());
                setHighlightLinks(new Set());
                setVertex(null);
            }}
            linkLabel={(link) => link.kind}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={0.9}
        />
    );
}

export default Graph;