import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomNodeObject } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAddEdge: (source: string, target: string, weight: number) => void;
    nodes: CustomNodeObject[];
}

export const AddEdgeModal = ({ isOpen, onClose, onAddEdge, nodes }: Props) => {
    const [source, setSource] = useState<string | undefined>(undefined);
    const [target, setTarget] = useState<string | undefined>(undefined);
    const [weight, setWeight] = useState('1');

    useEffect(() => {
        if (!isOpen) {
            setSource(undefined);
            setTarget(undefined);
            setWeight('1');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const weightNum = parseFloat(weight);
        if (source && target && !isNaN(weightNum)) {
            onAddEdge(source, target, weightNum);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Aresta</DialogTitle>
                    <DialogDescription>
                        Selecione os nós de origem e destino e defina um peso para a aresta.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="source" className="text-right">Origem</Label>
                        <Select onValueChange={setSource} value={source}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione um nó" />
                            </SelectTrigger>
                            <SelectContent>
                                {nodes.map(node => (
                                    <SelectItem key={node.id} value={node.id as string}>{node.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="target" className="text-right">Destino</Label>
                        <Select onValueChange={setTarget} value={target}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Selecione um nó" />
                            </SelectTrigger>
                            <SelectContent>
                                {nodes.map(node => (
                                    <SelectItem key={node.id} value={node.id as string}>{node.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="weight" className="text-right">Peso</Label>
                        <Input
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Adicionar Aresta</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};