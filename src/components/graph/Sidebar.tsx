import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomNodeObject } from "@/types";
import { GitCommit, GitMerge, Plus, RotateCcw, Search, Trash2, PanelRightOpen, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAddNodeClick: () => void;
    onAddEdgeClick: () => void;
    onRunAlgorithm: (algo: 'bfs' | 'dfs', startNodeId: string) => void;
    onResetGraph: () => void;
    onClearHighlights: () => void;
    onToggleInfoPanel: () => void;
    nodes: CustomNodeObject[];
    traversalResult: string[];
}

export const Sidebar = ({
    isOpen,
    onClose,
    onAddNodeClick,
    onAddEdgeClick,
    onRunAlgorithm,
    onResetGraph,
    onClearHighlights,
    onToggleInfoPanel,
    nodes,
    traversalResult
}: Props) => {
    const [startNode, setStartNode] = useState<string | undefined>();

    return (
        <aside className={cn(
            "fixed top-0 left-0 h-screen w-72 bg-gray-50 border-r border-gray-200 p-4 flex flex-col z-40",
            "transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0"
        )}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Editor de Grafos</h1>
                <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                    <X size={20} />
                </Button>
            </div>

            <div className="space-y-3 flex-grow overflow-y-auto">
                <h2 className="text-lg font-semibold">Controles</h2>
                <Button onClick={onAddNodeClick} className="w-full justify-start gap-2"><Plus size={18} /> Adicionar Nó</Button>
                <Button onClick={onAddEdgeClick} className="w-full justify-start gap-2"><GitMerge size={18} /> Adicionar Aresta</Button>

                <hr className="my-4" />

                <h2 className="text-lg font-semibold">Algoritmos</h2>
                <div className="space-y-2">
                    <Label>Nó Inicial</Label>
                    <Select onValueChange={setStartNode} value={startNode}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o início" />
                        </SelectTrigger>
                        <SelectContent>
                            {nodes.map(node => (
                                <SelectItem key={node.id} value={node.id as string}>{node.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button disabled={!startNode} onClick={() => onRunAlgorithm('bfs', startNode!)} className="w-full justify-start gap-2"><Search size={18} /> Rodar BFS</Button>
                    <Button disabled={!startNode} onClick={() => onRunAlgorithm('dfs', startNode!)} className="w-full justify-start gap-2"><GitCommit size={18} /> Rodar DFS</Button>
                </div>

                <AnimatePresence>
                    {traversalResult.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 p-3 bg-gray-100 rounded-lg"
                        >
                            <h3 className="font-semibold mb-2">Ordem de Visitação:</h3>
                            <p className="text-sm font-mono break-words">{traversalResult.join(' → ')}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <div className="space-y-2">
                <Button onClick={onToggleInfoPanel} variant="outline" className="w-full justify-start gap-2"><PanelRightOpen size={18} /> Ver Elementos</Button>
                <hr className="my-2" />
                <Button onClick={onClearHighlights} variant="secondary" className="w-full justify-start gap-2"><Trash2 size={18} /> Limpar Destaques</Button>
                <Button onClick={onResetGraph} variant="outline" className="w-full justify-start gap-2"><RotateCcw size={18} /> Resetar Grafo</Button>
            </div>
        </aside>
    );
};