import { useState, useCallback } from 'react';
import { CustomNodeObject, CustomLinkObject } from '@/types';
import { bfs, dfs } from '@/lib/graphAlgorithms';
import { toast } from "sonner";

// Estado inicial para demonstração
const initialData = {
    nodes: [
        { id: 'A', name: 'Nó A' },
        { id: 'B', name: 'Nó B' },
    ],
    links: [
        { source: 'A', target: 'B', weight: 5 },
    ],
};

export const useGraphData = () => {
    const [data, setData] = useState<{ nodes: CustomNodeObject[]; links: CustomLinkObject[] }>(initialData);
    const [originalData, _setOriginalData] = useState(JSON.parse(JSON.stringify(initialData)));
    const [highlightedElements, setHighlightedElements] = useState<{ nodes: Set<string>, links: Set<CustomLinkObject> }>({ nodes: new Set(), links: new Set() });
    const [traversalResult, setTraversalResult] = useState<string[]>([]);

    // Funções de manipulação do grafo
    const addNode = useCallback((name: string, id?: string) => {
        setData(prevData => {
            const newNodeId = id || `node-${Date.now()}`;
            if (prevData.nodes.some(node => node.name === name)) {
                toast.error("Erro: Já existe um nó com este nome.");
                return prevData;
            }
            const newNode: CustomNodeObject = { id: newNodeId, name };
            toast.success(`Nó "${name}" adicionado com sucesso!`);
            return { ...prevData, nodes: [...prevData.nodes, newNode] };
        });
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setData(prevData => ({
            nodes: prevData.nodes.filter(n => n.id !== nodeId),
            links: prevData.links.filter(l => (l.source as CustomNodeObject).id !== nodeId && (l.target as CustomNodeObject).id !== nodeId),
        }));
        toast.info("Nó removido.");
    }, []);

    const addEdge = useCallback((source: string, target: string, weight: number) => {
        setData(prevData => {
            const edgeExists = prevData.links.some(
                link =>
                    (link.source as CustomNodeObject).id === source && (link.target as CustomNodeObject).id === target
            );

            if (edgeExists) {
                toast.error("Erro: Esta aresta direcionada já existe.");
                return prevData;
            }
            const newLink: CustomLinkObject = { source, target, weight };
            toast.success("Aresta direcionada adicionada!");
            return { ...prevData, links: [...prevData.links, newLink] };
        });
    }, []);

    const removeEdge = useCallback((linkToRemove: CustomLinkObject) => {
        setData(prevData => ({
            ...prevData,
            links: prevData.links.filter(l => l !== linkToRemove),
        }));
        toast.info("Aresta removida.");
    }, []);

    const updateNodeName = useCallback((nodeId: string, newName: string) => {
        setData(prevData => ({
            ...prevData,
            nodes: prevData.nodes.map(n =>
                n.id === nodeId
                    ? { ...n, name: newName }
                    : n
            )
        }));
        toast.success("Nome do nó atualizado.");
    }, []);

    const updateNodeColor = useCallback((nodeId: string, newColor: string) => {
        setData(prevData => ({
            ...prevData,
            nodes: prevData.nodes.map(n =>
                n.id === nodeId ? { ...n, color: newColor } : n
            )
        }));
        toast.success("Cor do nó atualizado.");
    }, []);

    const updateEdgeWeight = useCallback((linkToUpdate: CustomLinkObject, newWeight: number) => {
        setData(prevData => ({
            ...prevData,
            links: prevData.links.map(l => l === linkToUpdate ? { ...l, weight: newWeight } : l)
        }));
        toast.success("Peso da aresta atualizado.");
    }, []);

    const pinNode = useCallback((nodeId: string, x: number | undefined, y: number | undefined) => {
        setData(prevData => ({
            ...prevData,
            nodes: prevData.nodes.map(n =>
                n.id === nodeId ? { ...n, fx: x, fy: y } : n
            )
        }));
    }, []);

    // Funções de Algoritmos
    const runAlgorithm = (algo: 'bfs' | 'dfs', startNodeId: string) => {
        const { traversalOrder, pathElements } = algo === 'bfs'
            ? bfs(startNodeId, data.nodes, data.links)
            : dfs(startNodeId, data.nodes, data.links);

        setTraversalResult(traversalOrder);

        // Animação de highlight
        const allElements = [...pathElements.nodes, ...Array.from(pathElements.links)];
        let delay = 0;
        allElements.forEach((el) => {
            setTimeout(() => {
                setHighlightedElements(prev => {
                    const newNodes = new Set(prev.nodes);
                    const newLinks = new Set(prev.links);
                    if (typeof el === 'string') {
                        newNodes.add(el);
                    } else {
                        newLinks.add(el as CustomLinkObject);
                    }
                    return { nodes: newNodes, links: newLinks };
                });
            }, delay);
            delay += 150; // Aumenta o delay para cada passo da animação
        });

        toast.info(`Algoritmo ${algo.toUpperCase()} executado.`);
    };

    const resetGraph = () => {
        setHighlightedElements({ nodes: new Set(), links: new Set() });
        setTraversalResult([]);
        setData(JSON.parse(JSON.stringify(originalData))); // Restaura para o estado inicial salvo
        toast.info("Grafo restaurado para o estado original.");
    };

    const clearHighlights = () => {
        setHighlightedElements({ nodes: new Set(), links: new Set() });
        setTraversalResult([]);
    };

    return {
        data,
        addNode,
        removeNode,
        addEdge,
        removeEdge,
        updateNodeName,
        updateNodeColor,
        updateEdgeWeight,
        pinNode,
        runAlgorithm,
        resetGraph,
        clearHighlights,
        highlightedElements,
        traversalResult,
    };
};