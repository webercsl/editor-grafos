import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CustomNodeObject, CustomLinkObject } from '@/types';
import { Trash2 } from 'lucide-react';

interface Props {
    element: CustomNodeObject | CustomLinkObject | null;
    onUpdateName?: (newName: string) => void;
    onUpdateWeight?: (newWeight: number) => void;
    onUpdateColor?: (newColor: string) => void;
    onDelete: () => void;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditElementPopover = ({
    element,
    onUpdateName,
    onUpdateWeight,
    onUpdateColor,
    onDelete,
    children,
    open,
    onOpenChange,
}: Props) => {
    const isNode = element ? 'name' in element : true; // default true para evitar erro
    const [value, setValue] = useState('');
    const [color, setColor] = useState('#4682B4');

    useEffect(() => {
        if (!element) return;

        if ('name' in element) {
            setValue(element.name);
            setColor((element as CustomNodeObject).color || '#4682B4');
        } else {
            setValue((element as CustomLinkObject).weight.toString());
        }
    }, [element]);

    if (!element) return null; // retorno condicional agora seguro

    const handleUpdate = () => {
        if ('name' in element) {
            const originalNode = element as CustomNodeObject;

            if (value !== originalNode.name) {
                onUpdateName?.(value);
            }

            if (color !== (originalNode.color || '#4682B4')) {
                onUpdateColor?.(color);
            }
        } else {
            const originalLink = element as CustomLinkObject;
            if (parseFloat(value) !== originalLink.weight) {
                onUpdateWeight?.(parseFloat(value));
            }
        }
        onOpenChange(false);
    };

    const handleDelete = () => {
        onDelete();
        onOpenChange(false);
    };

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Editar Elemento</h4>
                        <p className="text-sm text-muted-foreground">
                            {isNode ? "Altere as propriedades do nó." : "Altere o peso da aresta."}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="elementValue">{isNode ? "Nome" : "Peso"}</Label>
                        <Input
                            id="elementValue"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            type={isNode ? 'text' : 'number'}
                        />
                        {isNode && (
                            <div className="grid gap-2 mt-2">
                                <Label htmlFor="nodeColor">Cor</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="nodeColor"
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="p-1 h-10 w-14"
                                    />
                                    <Input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="#4682B4"
                                    />
                                </div>
                            </div>
                        )}
                        <Button onClick={handleUpdate} className="mt-2">Atualizar</Button>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="mt-2 flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Deletar Elemento
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};