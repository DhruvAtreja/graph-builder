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
import { MarkerType } from '@xyflow/react'
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
      setEdges((edges) =>
        addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed, width: 30, height: 30 } }, edges),
      )
    },
    [setEdges, nodes],
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
        setEdges((edgs) =>
          applyEdgeChanges(
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
                },
              },
            ],
            edgs,
          ),
        )
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

  const { buttonTexts } = useButtonText()

  const generateCode = useCallback(() => {
    const workflowCode = generateLanggraphJS(nodes, edges, buttonTexts)
    setGeneratedCode({ code: workflowCode, nodes, edges })
  }, [nodes, edges, buttonTexts])

  const downloadZip = useCallback(() => {
    if (!generatedCode) return

    const zip = new JSZip()
    const myAgent = zip.folder('my_agent')

    myAgent!.file('WorkFlow.py', generatedCode.code)
    myAgent!.file('main.py', `# main.py content`) // Add the content for main.py
    myAgent!.file('LLMManager.py', `# LLMManager.py content`) // Add the content for LLMManager.py

    zip.file('.env.example', `OPENAI_API_KEY=your_openai_api_key_here`)
    zip.file('langgraph.json', JSON.stringify({ nodes, edges }, null, 2))
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
      generatedCode = generateLanggraphJS(nodes, edges, buttonTexts)
    } else {
      generatedCode = generateLanggraphCode(nodes, edges, buttonTexts)
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
        edges={edges}
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
        <Controls />
      </ReactFlow>
      <button
        onClick={handleGenerateCode}
        className='absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
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
    </div>
  )
}
