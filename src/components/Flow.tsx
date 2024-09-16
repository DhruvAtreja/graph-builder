import { useCallback, useState, useRef, useEffect } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  OnConnectStart,
  type OnConnect,
  useOnSelectionChange,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
} from '@xyflow/react'
import { MarkerType } from 'reactflow'
import '@xyflow/react/dist/style.css'

import { initialNodes, nodeTypes, type CustomNodeType } from './nodes'
import { initialEdges, edgeTypes, type CustomEdgeType } from './edges'
import { generateLanggraphCode } from '../codeGeneration/generateLanggraph'
import { generateLanggraphJS } from '../codeGeneration/generateLanggraphJS'
import { CodeGenerationResult } from '../codeGeneration/types'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { useButtonText } from '@/contexts/ButtonTextContext'
import Modal from './Modal'
import { useEdgeLabel } from '@/contexts/EdgeLabelContext'
import EdgeLabelModal from './EdgeLabelModal'

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeType>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdgeType>(initialEdges)
  const reactFlowWrapper = useRef<any>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [generatedCode, setGeneratedCode] = useState<CodeGenerationResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [codeType, setCodeType] = useState<'js' | 'python' | null>(null)
  const { buttonTexts } = useButtonText()

  const { edgeLabels, updateEdgeLabel } = useEdgeLabel()

  const [isEdgeLabelModalOpen, setIsEdgeLabelModalOpen] = useState(false)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const handleEdgeLabelClick = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId)
    setIsEdgeLabelModalOpen(true)
  }, [])

  const handleEdgeLabelSave = useCallback(
    (newLabel: string) => {
      if (selectedEdgeId) {
        updateEdgeLabel(selectedEdgeId, newLabel)
      }
      setIsEdgeLabelModalOpen(false)
    },
    [selectedEdgeId, updateEdgeLabel],
  )

  const onConnectStart: OnConnectStart = useCallback(
    (connection) => {
      console.log('onConnectStart', connection)
      setIsConnecting(true)
    },
    [nodes, setIsConnecting],
  )

  const onConnect: OnConnect = useCallback(
    (connection) => {
      console.log('onConnect', connection)
      const edgeId = `edge-${edges.length + 1}`
      const defaultLabel = `conditional_${buttonTexts[connection.source] ? buttonTexts[connection.source].replace(/\s+/g, '_') : 'default'}`
      const newEdge: CustomEdgeType = {
        ...connection,
        id: edgeId,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'self-connecting-edge',
        animated: connection.source === connection.target,
        label: defaultLabel,
      }
      setEdges((edges) => addEdge(newEdge, edges))
    },
    [setEdges, edges, buttonTexts],
  )

  const onChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      console.log('Flow changed:', nodes, edges)
      if (edges.length == 0) return

      const currentTime = new Date().getTime()
      if (currentTime - lastClickTime < 300) {
        // Double-click detected (300ms threshold)
        setEdges((edgs) =>
          applyEdgeChanges(
            [
              {
                type: 'remove',
                id: edges[0].id,
              },
            ],
            edgs,
          ),
        )
      } else {
        setEdges((edgs) => {
          const defaultLabel = `conditional_${buttonTexts[edges[0].source] ? buttonTexts[edges[0].source].replace(/\s+/g, '_') : 'default'}`
          const label = edgeLabels[edges[0].id] || defaultLabel
          // updateEdgeLabel(edges[0].id, label)
          return applyEdgeChanges(
            [
              {
                type: 'replace',
                id: edges[0].id,
                item: {
                  ...edges[0],
                  source: edges[0].source,
                  target: edges[0].target,
                  animated: !edges[0].animated,
                  selected: false,
                  label: label,
                },
              },
            ],
            edgs,
          )
        })
      }
      setLastClickTime(currentTime)
    },
    [edges, setEdges, lastClickTime],
  )

  useOnSelectionChange({ onChange })

  const addNode = useCallback(
    (event: React.MouseEvent) => {
      if (isConnecting) {
        setIsConnecting(false)
        return
      }
      event.preventDefault()
      if (reactFlowWrapper) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        const newNode: CustomNodeType = {
          id: `node-${nodes.length + 1}`,
          type: 'custom',
          position,
          selected: true,
          data: { label: `Node ${nodes.length + 1}` },
        }

        setNodes((nodes) =>
          applyNodeChanges(
            [
              {
                type: 'add',
                item: newNode,
              },
            ],
            nodes,
          ),
        )
      }
    },
    [nodes, setNodes, reactFlowInstance, reactFlowWrapper, isConnecting, applyNodeChanges],
  )

  const generateCode = useCallback(() => {
    const workflowCode = generateLanggraphJS(nodes, edges, buttonTexts, edgeLabels)
    setGeneratedCode({ code: workflowCode, nodes, edges })
  }, [nodes, edges, buttonTexts, edgeLabels])

  const downloadZip = useCallback(() => {
    if (!generatedCode) return

    const zip = new JSZip()
    const myAgent = zip.folder('my_agent')

    myAgent!.file('WorkFlow.py', generatedCode.code)
    myAgent!.file('LLMManager.py', `# LLMManager.py content`)

    zip.file('.env.example', `OPENAI_API_KEY=your_openai_api_key_here`)
    zip.file('langgraph.json', `Langgraph JSON content`)
    zip.file('requirements.txt', `langgraph\nlangchain\nopenai\npython-dotenv`)

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'project.zip')
    })
  }, [generatedCode, nodes, edges])

  const handleGenerateCode = () => {
    setShowModal(true)
  }

  const handleCodeTypeSelection = (type: 'js' | 'python') => {
    setCodeType(type)
    setShowModal(false)

    let generatedCode
    if (type === 'js') {
      generatedCode = generateLanggraphJS(nodes, edges, buttonTexts, edgeLabels)
    } else {
      generatedCode = generateLanggraphCode(nodes, edges, buttonTexts, edgeLabels)
    }

    setGeneratedCode({ code: generatedCode, nodes, edges })
  }

  console.log(nodes)
  console.log(edges)

  return (
    <div ref={reactFlowWrapper} className='z-10 no-scrollbar' style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow<CustomNodeType, CustomEdgeType>
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges.map((edge) => ({
          ...edge,
          label: edgeLabels[edge.id] || edge.label,
          data: { ...edge.data, onLabelClick: handleEdgeLabelClick },
        }))}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        fitView
        onConnectStart={onConnectStart}
        onPaneClick={addNode}
        className='z-10 bg-[#1a1c24]'
        style={{
          backgroundColor: '#1a1c24',
        }}
      >
        <Background />
      </ReactFlow>
      <button
        onClick={handleGenerateCode}
        className='absolute bottom-4 right-4 bg-[#246161] hover:bg-[#195656] text-white font-bold py-2 px-4 rounded'
      >
        Generate Code
      </button>

      {showModal && <Modal onClose={() => setShowModal(false)} onSelect={handleCodeTypeSelection} />}

      {generatedCode && (
        <div className='absolute top-4 right-4 bg-white h-full overflow-y-scroll no-scrollbar p-4 rounded shadow-lg'>
          <div className='absolute top-0 right-0 p-2 flex flex-row gap-2'>
            <button
              onClick={downloadZip}
              className='bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded'
            >
              Download
            </button>
            <button
              onClick={() => setGeneratedCode(null)}
              className=' bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded'
            >
              Hide
            </button>
          </div>
          <h3 className='text-lg font-bold mb-2'>Generated Code:</h3>
          <pre className='bg-gray-100 p-2 rounded'>
            <code>{generatedCode.code}</code>
          </pre>
        </div>
      )}
      <EdgeLabelModal
        isOpen={isEdgeLabelModalOpen}
        onClose={() => setIsEdgeLabelModalOpen(false)}
        onSave={handleEdgeLabelSave}
        initialLabel={selectedEdgeId ? edgeLabels[selectedEdgeId] || '' : ''}
      />
    </div>
  )
}
