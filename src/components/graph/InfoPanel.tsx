import { CustomNodeObject, CustomLinkObject } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Focus } from "lucide-react";

interface Props {
    nodes: CustomNodeObject[];
    links: CustomLinkObject[];
    onElementFocus: (element: CustomNodeObject | CustomLinkObject) => void;
}

export const InfoPanel = ({ nodes, links, onElementFocus }: Props) => {
    return (
        <aside className="fixed top-0 right-0 h-screen w-72 bg-gray-50 border-l border-gray-200 p-4 flex flex-col z-10">
            <h2 className="text-xl font-bold mb-4">Elementos do Grafo</h2>
            <ScrollArea className="flex-grow">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Nós ({nodes.length})</h3>
                        <div className="space-y-1">
                            {nodes.map(node => (
                                <div key={node.id} className="flex items-center justify-between p-2 bg-white rounded-md border text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color || '#4682B4' }} />
                                        <span>{node.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onElementFocus(node)}>
                                        <Focus size={14} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Arestas ({links.length})</h3>
                        <div className="space-y-1">
                            {links.map((link, index) => {
                                const sourceNode = nodes.find(n => n.id === (link.source as CustomNodeObject).id);
                                const targetNode = nodes.find(n => n.id === (link.target as CustomNodeObject).id);
                                return (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-md border text-sm">
                                        <span className="truncate">
                                            {sourceNode?.name || '??'} → {targetNode?.name || '??'} (Peso: {link.weight})
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onElementFocus(link)}>
                                            <Focus size={14} />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    );
};