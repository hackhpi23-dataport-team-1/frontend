import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import GridLoader from "react-spinners/GridLoader";

const mapping = {
    'ip': 'ip',
    'asn': 'asn',
    'domain': 'name',
    'has_asn': 'asn',
    "process": "Image",
    "Dummy" : "Dummy",
    "file" : "TargetFilename",
    "dns" : "dns",
    'NetworkConnect': 'process',
    'create': 'level',
    'key': 'TargetObject',
};

const Graph = ({setVertex}) => {
    const [graphData, setGraphData] = useState({nodes: [], links: []});
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState(null);
    const [loading, setLoading] = useState(true);

    const caseId = window.location.pathname.split('/')[2];
    const fgRef = useRef();

    const parseGraph = (response) => {
        console.log("Fetched graph data!");

        console.log(response);

        const links = response.data.edges.map((edge) => {
            const new_edge = {...edge};
            
            if (typeof edge.source !== 'string') {
                new_edge.source = edge.source.id;
            }

            if (typeof edge.target !== 'string') {
                new_edge.target = edge.target.id;
            }

            return new_edge;
        })

        console.log(links);

        const graph = {
            nodes: response.data.vertices,
            links: links,
        };

        console.log(graph.links);

        // cross-link node objects
        graph.links.forEach(link => {
            const a = graph.nodes.find((node) => node.id === link.source);
            if (!a) return;

            const b = graph.nodes.find((node) => node.id === link.target);
            if (!b) return;
            
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
        console.log("Fetching graph data...");
        axios.get(`http://127.0.0.1:5000/case/${caseId}`).then(parseGraph);
    }, [caseId]);

    const getLabel = (node) => {
        const attr = node.attr[mapping[node.kind]] || node.id;
        if (attr.length > 15) {
            return "..." + attr.substring(attr.length - 15, attr.length);
        }

        return attr;
    }

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
        const label = getLabel(node)
        ctx.fillText(label, node.x, node.y - node.score / 100 * 8 - 1.5);

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

        if (node && node.neighbors && node.neighbors.length > 0) {
            highlightedNodes.add(node.id);
            node.neighbors.forEach(neighbor => highlightedNodes.add(neighbor));

            node.links.forEach(link => highlightedLinks.add({
                source: link.source,
                target: link.target
            }));
        }

        setHighlightNodes(highlightedNodes);
        setHighlightLinks(highlightedLinks);
        setHoverNode(node || null);
    };

    const findLink = (link) => {
        if (highlightLinks.size === 0) return false;
        return Array.from(highlightLinks.values()).find((l) => l.source === link.source && l.target === link.target);
    }

    if (loading) {
        return (
            <div className="loading">
                <GridLoader color="#5057B0" />
            </div>
        )
    }

    return (
        <ForceGraph2D 
            ref={fgRef}
            graphData={graphData} 
            linkSource='source'
            linkTarget='target'
            autoPauseRedraw={false}
            width={graphWidth}
            height={window.innerHeight - 40}
            className="graph"
            nodePointerAreaPaint={nodePaint}
            nodeCanvasObject={(node, ctx) => nodePaint(node, highlightNodes.has((id) => id === node.id) ? "#00ff00" : getColor(node), ctx)}
            onNodeClick={onNodeClick}
            linkWidth={link => findLink(link) ? 3 : 1}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={link => findLink(link) ? 2 : 0}
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