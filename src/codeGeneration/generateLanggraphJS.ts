import { type CustomNodeType } from '@/components/nodes'
import { type CustomEdgeType } from '@/components/edges'

export function generateLanggraphJS(
  nodes: CustomNodeType[],
  edges: CustomEdgeType[],
  buttonTexts: { [key: string]: string },
): string {
  // Helper function to get node label
  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    const buttonText = buttonTexts[nodeId]
    return (buttonText || (node?.data?.label as string) || nodeId).replace(/\s+/g, '_')
  }

  // JavaScript code generation
  // Generate imports
  const imports = [
    "import { StateGraph, END, Annotation } from '@langchain/langgraph';",
    "import { State, StateAnnotation } from './State';",
    '',
  ]

  // Generate class definition
  const classDefinition = [
    'export class WorkflowManager {',
    '  constructor() {',
    '    this.create_workflow = this.create_workflow.bind(this);',
    '    this.returnGraph = this.returnGraph.bind(this);',
    '    this.run_workflow = this.run_workflow.bind(this);',
    '  }',
    '',
  ]

  // Generate function definitions
  const functions = nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .map((node) => {
      const functionName = (node.data.label as string).replace(/\s+/g, '_')
      return `  ${functionName}(args) {\n    return args;\n  }\n`
    })

  // Generate conditional functions
  const conditionalFunctions = new Map()
  edges
    .filter((edge) => edge.animated)
    .forEach((edge) => {
      const sourceLabel = getNodeLabel(edge.source)
      const targetLabel = getNodeLabel(edge.target)
      if (!conditionalFunctions.has(sourceLabel)) {
        conditionalFunctions.set(sourceLabel, new Set())
      }
      conditionalFunctions.get(sourceLabel).add(targetLabel)
    })

  const conditionalFunctionStrings = Array.from(conditionalFunctions.entries()).map(([sourceLabel, targets]) => {
    const targetStrings = Array.from(targets)
      .map((target) => `    // return "${target}";`)
      .join('\n')
    return `  conditional_${sourceLabel}(args) {\n${targetStrings}\n    return END;\n  }\n`
  })

  // Generate create_workflow function
  const workflowFunction = ['  create_workflow() {', '    const workflow = new StateGraph(StateAnnotation)']

  nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .forEach((node) => {
      const nodeLabel = (node.data.label as string).replace(/\s+/g, '_')
      workflowFunction.push(`      .addNode("${nodeLabel}", this.${nodeLabel})`)
    })

  workflowFunction.push('')

  const processedConditionalEdges = new Set()

  edges.forEach((edge) => {
    const sourceLabel = getNodeLabel(edge.source)
    const targetLabel = getNodeLabel(edge.target)
    if (edge.animated) {
      if (!processedConditionalEdges.has(sourceLabel)) {
        workflowFunction.push(`      .addConditionalEdges("${sourceLabel}", this.conditional_${sourceLabel})`)
        processedConditionalEdges.add(sourceLabel)
      }
    } else {
      if (targetLabel === 'end') {
        workflowFunction.push(`      .addEdge("${sourceLabel}", END)`)
      } else {
        if (sourceLabel !== 'source') workflowFunction.push(`      .addEdge("${sourceLabel}", "${targetLabel}")`)
      }
    }
  })

  const startNode = nodes.find((node) => {
    const sourceNode = nodes.find((n) => n.type === 'source')
    return edges.some((edge) => edge.source === sourceNode?.id && edge.target === node.id)
  })
  if (startNode) {
    workflowFunction.push(`      .setEntryPoint("${getNodeLabel(startNode.id)}")`)
  }

  workflowFunction.push('\n    return workflow;', '  }')

  // Generate additional utility functions
  const utilityFunctions = [
    '  returnGraph() {',
    '    return this.create_workflow().compile();',
    '  }',
    '',
    '  async run_workflow(args) {',
    '    const app = this.create_workflow().compile();',
    '    const result = await app.invoke(args);',
    '    return result;',
    '  }',
  ]

  // Combine all parts
  const codeParts = [
    ...imports,
    '',
    ...classDefinition,
    ...functions,
    ...conditionalFunctionStrings,
    ...workflowFunction,
    '',
    ...utilityFunctions,
    '}',
  ]

  return codeParts.join('\n')
}
