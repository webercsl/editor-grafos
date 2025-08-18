import { CustomNodeObject, CustomLinkObject } from '@/types';

type AdjacencyList = Map<string, string[]>;

/**
 * Constrói uma lista de adjacência a partir dos nós e arestas do grafo.
 * @param links - Array de arestas.
 * @returns A lista de adjacência.
 */
const buildAdjacencyList = (links: CustomLinkObject[]): AdjacencyList => {
    const adjList: AdjacencyList = new Map();

    // Garante que todos os nós estejam na lista, mesmo que não tenham arestas saindo
    const allNodeIds = new Set<string>();
    links.forEach(link => {
        allNodeIds.add((typeof link.source === 'object' ? link.source.id : link.source) as string);
        allNodeIds.add((typeof link.target === 'object' ? link.target.id : link.target) as string);
    });
    allNodeIds.forEach(id => adjList.set(id, []));

    links.forEach(link => {
        const sourceId = (typeof link.source === 'object' ? link.source.id : link.source) as string;
        const targetId = (typeof link.target === 'object' ? link.target.id : link.target) as string;

        adjList.get(sourceId)?.push(targetId);

    });
    return adjList;
};

/**
 * Executa a Busca em Largura (BFS) em um grafo.
 * @param startNodeId - O ID do nó inicial.
 * @param nodes - Array de todos os nós.
 * @param links - Array de todas as arestas.
 * @returns Um objeto contendo a ordem de visitação e os elementos (nós e arestas) do percurso.
 */
export const bfs = (startNodeId: string, nodes: CustomNodeObject[], links: CustomLinkObject[]) => {
    const adjList = buildAdjacencyList(links);
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    const traversalOrder: string[] = [];
    const pathElements: { nodes: Set<string>; links: Set<CustomLinkObject> } = {
        nodes: new Set(),
        links: new Set(),
    };

    if (!adjList.has(startNodeId)) return { traversalOrder, pathElements };

    visited.add(startNodeId);
    traversalOrder.push(nodes.find(n => n.id === startNodeId)?.name || startNodeId);
    pathElements.nodes.add(startNodeId);

    while (queue.length > 0) {
        const currentNodeId = queue.shift()!;
        const neighbors = adjList.get(currentNodeId) || [];

        for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push(neighborId);
                traversalOrder.push(nodes.find(n => n.id === neighborId)?.name || neighborId);
                pathElements.nodes.add(neighborId);
                const link = links.find(
                    l => (l.source as CustomNodeObject).id === currentNodeId && (l.target as CustomNodeObject).id === neighborId
                );
                if (link) pathElements.links.add(link);
            }
        }
    }
    return { traversalOrder, pathElements };
};

/**
 * Executa a Busca em Profundidade (DFS) em um grafo.
 * @param startNodeId - O ID do nó inicial.
 * @param nodes - Array de todos os nós.
 * @param links - Array de todas as arestas.
 * @returns Um objeto contendo a ordem de visitação e os elementos (nós e arestas) do percurso.
 */
export const dfs = (startNodeId: string, nodes: CustomNodeObject[], links: CustomLinkObject[]) => {
    const adjList = buildAdjacencyList(links);
    const visited = new Set<string>();
    const traversalOrder: string[] = [];
    const pathElements: { nodes: Set<string>; links: Set<CustomLinkObject> } = {
        nodes: new Set(),
        links: new Set(),
    };

    const dfsRecursive = (nodeId: string) => {
        visited.add(nodeId);
        traversalOrder.push(nodes.find(n => n.id === nodeId)?.name || nodeId);
        pathElements.nodes.add(nodeId);

        const neighbors = adjList.get(nodeId) || [];
        for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
                const link = links.find(
                    l => (l.source as CustomNodeObject).id === nodeId && (l.target as CustomNodeObject).id === neighborId
                );
                if (link) pathElements.links.add(link);
                dfsRecursive(neighborId);
            }
        }
    };

    if (adjList.has(startNodeId)) {
        dfsRecursive(startNodeId);
    }

    return { traversalOrder, pathElements };
};