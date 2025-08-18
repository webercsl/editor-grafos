"use client";
import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/graph/Sidebar';
import { AddNodeModal } from '@/components/graph/modals/AddNodeModal';
import { AddEdgeModal } from '@/components/graph/modals/AddEdgeModal';
import { useGraphData } from '@/hooks/useGraphData';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoPanel } from '@/components/graph/InfoPanel';
import { CustomNodeObject, CustomLinkObject, GraphCanvasHandle } from '@/types';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const GraphCanvas = dynamic(() => import('@/components/graph/GraphCanvas'), {
  ssr: false,
  loading: () => <p className="flex items-center justify-center h-screen w-full">Carregando Grafo...</p>,
});

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setInfoPanelOpen] = useState(false);

  const [isAddNodeModalOpen, setAddNodeModalOpen] = useState(false);
  const [isAddEdgeModalOpen, setAddEdgeModalOpen] = useState(false);

  const graphCanvasRef = useRef<GraphCanvasHandle>(null);

  const {
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
  } = useGraphData();

  const handleElementFocus = (element: CustomNodeObject | CustomLinkObject) => {
    graphCanvasRef.current?.zoomToElement(element);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
      setInfoPanelOpen(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-gray-100 relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={isSidebarOpen ? 'hidden' : 'xs:fixed xs:top-4 xs:left-4 xs:z-50 xs:bg-white/70 xs:backdrop-blur-sm'}
      >
        <Menu size={20} className={isSidebarOpen ? 'hidden' : 'visible'} />
      </Button>

      <div
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 bg-black/50 z-30 md:hidden"
        style={{ pointerEvents: isSidebarOpen ? "auto" : "none" }}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddNodeClick={() => setAddNodeModalOpen(true)}
        onAddEdgeClick={() => setAddEdgeModalOpen(true)}
        onRunAlgorithm={runAlgorithm}
        onResetGraph={resetGraph}
        onClearHighlights={clearHighlights}
        nodes={data.nodes}
        traversalResult={traversalResult}
        onToggleInfoPanel={() => setInfoPanelOpen(prev => !prev)}
      />

      <motion.div
        className="flex-grow h-full transition-all duration-300 ease-in-out md:ml-72"
        animate={{ marginRight: isInfoPanelOpen ? '288px' : '0px' }}
        onAnimationComplete={() => graphCanvasRef.current?.resizeCanvas?.()}
      >
        <GraphCanvas
          ref={graphCanvasRef}
          data={data}
          onPinNode={pinNode}
          onBackgroundClick={() => console.log('Background clicked')}
          onAddNode={addNode}
          highlightedElements={highlightedElements}
          onUpdateNodeName={updateNodeName}
          onUpdateNodeColor={updateNodeColor}
          onUpdateEdgeWeight={updateEdgeWeight}
          onRemoveNode={removeNode}
          onRemoveEdge={removeEdge}
        />
      </motion.div>

      <AnimatePresence>
        {isInfoPanelOpen && (
          <motion.div
            className="fixed top-0 right-0 h-screen z-20"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <InfoPanel
              nodes={data.nodes}
              links={data.links}
              onElementFocus={handleElementFocus}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AddNodeModal
        isOpen={isAddNodeModalOpen}
        onClose={() => setAddNodeModalOpen(false)}
        onAddNode={addNode}
      />

      <AddEdgeModal
        isOpen={isAddEdgeModalOpen}
        onClose={() => setAddEdgeModalOpen(false)}
        onAddEdge={addEdge}
        nodes={data.nodes}
      />
    </main>
  );
}