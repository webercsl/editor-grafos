"use client";

import { useRef, useEffect, useState, useLayoutEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { CustomNodeObject, CustomLinkObject, GraphCanvasHandle } from '@/types';
import { EditElementPopover } from './popovers/EditElementPopover';
import { toast } from 'sonner';
import { forceManyBody } from 'd3-force';

// --- Constantes de Estilo para fácil customização ---
const NODE_RADIUS = 10;
const FONT_SIZE_NODE = 12;
const FONT_SIZE_LINK = 16;
const SHOW_ARROWS = true; // Mude para false para esconder as setas
const ARROW_LENGTH = 6; // Comprimento da seta
const ARROW_OFFSET = 0.9; // Fator de deslocamento da seta para trás do ponto final (0 a 1)

interface Props {
    data: { nodes: CustomNodeObject[]; links: CustomLinkObject[]; };
    onBackgroundClick: () => void;
    onAddNode: (name: string, id: string) => void;
    highlightedElements: { nodes: Set<string>, links: Set<CustomLinkObject> };
    onUpdateNodeName: (nodeId: string, newName: string) => void;
    onUpdateNodeColor: (nodeId: string, newColor: string) => void;
    onUpdateEdgeWeight: (link: CustomLinkObject, newWeight: number) => void;
    onRemoveNode: (nodeId: string) => void;
    onRemoveEdge: (link: CustomLinkObject) => void;
    onPinNode: (nodeId: string, x: number | undefined, y: number | undefined) => void;
}

const GraphCanvas = forwardRef<GraphCanvasHandle, Props>(({
    data,
    onBackgroundClick,
    onAddNode,
    highlightedElements,
    onUpdateNodeName,
    onUpdateNodeColor,
    onUpdateEdgeWeight,
    onRemoveNode,
    onRemoveEdge,
    onPinNode,
}, ref) => {
    const fgRef = useRef<ForceGraphMethods<NodeObject<CustomNodeObject>, LinkObject<CustomNodeObject, CustomLinkObject>> | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [popoverState, setPopoverState] = useState<{ element: CustomNodeObject | CustomLinkObject | null; x: number; y: number }>({ element: null, x: 0, y: 0 });

    const [hoveredElement, setHoveredElement] = useState<CustomNodeObject | CustomLinkObject | null>(null);

    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge', forceManyBody().strength(-200));
        }
    }, []);

    useImperativeHandle(ref, () => ({
        zoomToElement(element: CustomNodeObject | CustomLinkObject) {
            const el = 'name' in element ? element : (element.source as CustomNodeObject);
            if (el && typeof el.x === 'number' && typeof el.y === 'number') {
                fgRef.current?.centerAt(el.x, el.y, 1000);
                fgRef.current?.zoom(2.5, 1000);
            }
        },
        reheatSimulation() {
            console.log('Reheating simulation...');
            fgRef.current?.d3ReheatSimulation();
            toast.info("Reorganizando layout do grafo...");
        },
        resizeCanvas: () => {
            fgRef.current?.d3ReheatSimulation();
        },
    }));

    useLayoutEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { fgRef.current?.zoomToFit(200, 100); }, 150);
        return () => clearTimeout(timer);
    }, [data]);

    const handleNodeClick = (node: NodeObject, event: MouseEvent) => {
        console.log('Node clicked:', node, 'Event:', event);
        setPopoverState({ element: node as CustomNodeObject, x: event.clientX, y: event.clientY });
    };

    const handleLinkClick = (link: LinkObject, event: MouseEvent) => {
        console.log('Link clicked:', link, 'Event:', event);
        setPopoverState({ element: link as CustomLinkObject, x: event.clientX, y: event.clientY });
    };

    const handleBackgroundClick = useCallback((event: MouseEvent) => {
        if (popoverState.element) {
            setPopoverState({ element: null, x: 0, y: 0 });
            return;
        }
        const coords = fgRef.current?.screen2GraphCoords(event.offsetX, event.offsetY);
        if (coords) {
            const id = `node-${Date.now()}`;
            const name = `Nó ${data.nodes.length + 1}`;
            onAddNode(name, id);
        }
        onBackgroundClick();
    }, [popoverState.element, data.nodes.length, onAddNode, onBackgroundClick]);

    /**
     * Função de desenho para os NÓS (agora como círculos).
     */
    const nodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const n = node as CustomNodeObject;
        const isHighlighted = highlightedElements.nodes.has(n.id as string);
        const isHovered = hoveredElement === n;

        // --- Desenho do Círculo ---
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, NODE_RADIUS, 0, 2 * Math.PI, false);

        // Cor de preenchimento
        ctx.fillStyle = n.color || (isHighlighted ? 'rgba(255, 255, 0, 0.8)' : 'rgba(70, 130, 180, 0.9)');
        ctx.fill();

        // Borda (stroke) para efeito de hover
        if (isHovered) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
        }

        // --- Desenho do Texto (Nome do Nó) ---
        const fontSize = FONT_SIZE_NODE / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isHighlighted ? '#000000' : '#FFFFFF';
        ctx.fillText(n.name, n.x!, n.y!);

    }, [highlightedElements, hoveredElement]);

    /**
     * Função de desenho para as ARESTAS (com setas e feedback de hover).
     */
    const linkCanvasObject = useCallback((link: LinkObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const l = link as CustomLinkObject;
        const start = l.source as CustomNodeObject;
        const end = l.target as CustomNodeObject;

        if (!start?.x || !start?.y || !end?.x || !end?.y) return;

        const isHighlighted = highlightedElements.links.has(l);
        const isHovered = hoveredElement === l;

        ctx.strokeStyle = isHighlighted ? 'rgba(255, 255, 0, 0.8)' : isHovered ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = (isHighlighted || isHovered ? 3 : 1) / globalScale;

        const pairLinks = data.links.filter(other => {
            const os = other.source as CustomNodeObject;
            const ot = other.target as CustomNodeObject;
            return (os.id === start.id && ot.id === end.id) || (os.id === end.id && ot.id === start.id);
        });
        const isBidirectional = pairLinks.length === 2;

        // Curvatura base
        const baseCurvature = 0.25;
        let curve = 0;

        if (isBidirectional) {
            // Para garantir consistência, ordenamos os dois links
            const sorted = [...pairLinks].sort((a, b) =>
                JSON.stringify(a).localeCompare(JSON.stringify(b))
            );
            const index = sorted.indexOf(l);

            // Index 0 → curva positiva, Index 1 → curva negativa
            // mas damos um "offset extra" para afastar
            curve = index === 0 ? baseCurvature : -baseCurvature;
        }

        const isLoop = start.id === end.id;

        if (isLoop) {
            const loopRadius = NODE_RADIUS + 10;
            const cx = start.x;
            const cy = start.y - loopRadius;

            ctx.beginPath();
            ctx.arc(cx, cy, NODE_RADIUS * 1.5, 0, 2 * Math.PI);
            ctx.stroke();

            // Desenho da Seta no loop
            if (SHOW_ARROWS) {
                const arrowAngle = Math.PI / 2;
                const arrowLength = ARROW_LENGTH / globalScale;
                const arrowTipX = cx + (NODE_RADIUS * 1.5) * Math.cos(arrowAngle);
                const arrowTipY = cy + (NODE_RADIUS * 1.5) * Math.sin(arrowAngle);
                const arrowDir = arrowAngle + Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(arrowTipX - arrowLength * Math.cos(arrowDir - Math.PI / 6), arrowTipY - arrowLength * Math.sin(arrowDir - Math.PI / 6));
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(arrowTipX - arrowLength * Math.cos(arrowDir + Math.PI / 6), arrowTipY - arrowLength * Math.sin(arrowDir + Math.PI / 6));
                ctx.stroke();
            }

            // Desenho do Texto (Peso) acima do loop
            const text = l.weight.toString();
            const fontSize = FONT_SIZE_LINK / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(cx - textWidth / 2 - 1, cy - NODE_RADIUS * 1.5 - fontSize - 1, textWidth + 2, fontSize + 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText(text, cx, cy - NODE_RADIUS * 1.5 - fontSize / 2);
        } else {
            // Curvatura base
            const baseCurvature = 0.28;

            // Regra determinística: A->B curva positiva, B->A negativa (pelo id em ordem lexicográfica)
            if (isBidirectional) {
                const forward = String(start.id) < String(end.id);
                curve = forward ? baseCurvature : -baseCurvature;
            }

            // Geometria da curva (reta quando curve === 0)
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const relX = end.x - start.x;
            const relY = end.y - start.y;

            const cpX = midX + curve * relY;
            const cpY = midY - curve * relX;

            const isStraight = curve === 0;
            if (isStraight) ctx.lineTo(end.x, end.y);
            else ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);
            ctx.stroke();

            // --- Seta seguindo a curva ---
            if (SHOW_ARROWS) {
                const arrowLen = ARROW_LENGTH / globalScale;
                const arrowAngle = Math.PI / 6;
                const t = ARROW_OFFSET; // 0..1

                let arrowTipX: number, arrowTipY: number, angle: number;

                if (!isStraight) {
                    // ponto na Bézier
                    arrowTipX = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cpX + t * t * end.x;
                    arrowTipY = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cpY + t * t * end.y;
                    // tangente da Bézier
                    const dx = 2 * (1 - t) * (cpX - start.x) + 2 * t * (end.x - cpX);
                    const dy = 2 * (1 - t) * (cpY - start.y) + 2 * t * (end.y - cpY);
                    angle = Math.atan2(dy, dx);
                } else {
                    arrowTipX = (1 - t) * start.x + t * end.x;
                    arrowTipY = (1 - t) * start.y + t * end.y;
                    angle = Math.atan2(end.y - start.y, end.x - start.x);
                }

                ctx.beginPath();
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(arrowTipX - arrowLen * Math.cos(angle - arrowAngle), arrowTipY - arrowLen * Math.sin(angle - arrowAngle));
                ctx.moveTo(arrowTipX, arrowTipY);
                ctx.lineTo(arrowTipX - arrowLen * Math.cos(angle + arrowAngle), arrowTipY - arrowLen * Math.sin(angle + arrowAngle));
                ctx.stroke();
            }

            // --- Peso da aresta (posicionado de acordo com o lado da curva) ---
            const text = l.weight.toString();
            const fontSize = FONT_SIZE_LINK / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(text).width;

            const textPosX = isStraight ? midX : (start.x + 2 * cpX + end.x) / 4;
            const textPosY = isStraight ? midY : (start.y + 2 * cpY + end.y) / 4 + curve * 25;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(textPosX - textWidth / 2 - 1, textPosY - fontSize / 2 - 1, textWidth + 2, fontSize + 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText(text, textPosX, textPosY);
        }
    }, [highlightedElements, hoveredElement, data.links]);

    return (
        <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing border">
            <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                nodeRelSize={NODE_RADIUS * 2}
                linkDirectionalArrowLength={0}
                nodeCanvasObject={nodeCanvasObject}
                linkCanvasObject={linkCanvasObject}
                linkPointerAreaPaint={(link, color, ctx) => {
                    const l = link as CustomLinkObject;
                    const start = l.source as CustomNodeObject;
                    const end = l.target as CustomNodeObject;

                    if (!start?.x || !start?.y || !end?.x || !end?.y) return;

                    ctx.strokeStyle = color;
                    ctx.lineWidth = 10;
                    ctx.fillStyle = color;

                    if (start.id === end.id) {
                        const loopRadius = NODE_RADIUS + 10;
                        ctx.beginPath();
                        ctx.arc(start.x!, start.y! - loopRadius, NODE_RADIUS * 1.5, 0, 2 * Math.PI);
                        ctx.stroke();
                        return;
                    }

                    // Mesmo critério de curvatura
                    const pairLinks = data.links.filter(other => {
                        const os = other.source as CustomNodeObject;
                        const ot = other.target as CustomNodeObject;
                        return (os.id === start.id && ot.id === end.id) || (os.id === end.id && ot.id === start.id);
                    });
                    const isBidirectional = pairLinks.length === 2;
                    const baseCurvature = 0.28;
                    const curve = isBidirectional
                        ? (String(start.id) < String(end.id) ? baseCurvature : -baseCurvature)
                        : 0;

                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    const relX = end.x - start.x;
                    const relY = end.y - start.y;
                    const cpX = midX + curve * relY;
                    const cpY = midY - curve * relX;

                    ctx.beginPath();
                    ctx.moveTo(start.x!, start.y!);
                    if (curve === 0) ctx.lineTo(end.x!, end.y!);
                    else ctx.quadraticCurveTo(cpX, cpY, end.x!, end.y!);
                    ctx.stroke();
                }}
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                onBackgroundClick={handleBackgroundClick}
                onNodeHover={node => setHoveredElement(node as CustomNodeObject)}
                onLinkHover={link => setHoveredElement(link as CustomLinkObject)}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                onNodeDragEnd={(node) => {
                    onPinNode(node.id as string, node.x, node.y);
                }}
                d3AlphaDecay={0.03}
                cooldownTicks={100}
            />
            {popoverState.element && (
                <div
                    style={{ position: 'fixed', left: popoverState.x, top: popoverState.y, zIndex: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <EditElementPopover
                        element={popoverState.element}
                        open={popoverState.element !== null}
                        onOpenChange={(isOpen) => {
                            console.log('Popover open changed:', isOpen);
                            if (!isOpen) setPopoverState({ element: null, x: 0, y: 0 });
                        }}
                        onUpdateName={(newName) => onUpdateNodeName((popoverState.element as CustomNodeObject).id as string, newName)}
                        onUpdateColor={(newColor) => onUpdateNodeColor((popoverState.element as CustomNodeObject).id as string, newColor)}
                        onUpdateWeight={(newWeight) => onUpdateEdgeWeight(popoverState.element as CustomLinkObject, newWeight)}
                        onDelete={() => {
                            console.log('Delete triggered for element:', popoverState.element);
                            if (popoverState.element && 'name' in popoverState.element) {
                                onRemoveNode((popoverState.element as CustomNodeObject).id as string);
                            } else {
                                onRemoveEdge(popoverState.element as CustomLinkObject);
                            }
                        }}
                    >
                        <div style={{ width: 10, height: 10, background: 'transparent' }} />
                    </EditElementPopover>
                </div>
            )}
        </div>
    );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;