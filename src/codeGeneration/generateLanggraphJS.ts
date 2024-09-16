import { type CustomNodeType } from '@/components/nodes'
import { type CustomEdgeType } from '@/components/edges'

export function generateLanggraphJS(
  nodes: CustomNodeType[],
  edges: CustomEdgeType[],
  buttonTexts: { [key: string]: string },
  edgeLabels: { [key: string]: string },
): string {
  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    const buttonText = buttonTexts[nodeId]
    return (buttonText || (node?.data?.label as string) || nodeId).replace(/\s+/g, '_')
  }

  const imports = [
    "import { StateGraph, END, Annotation } from '@langchain/langgraph';",
    "import { StateAnnotation } from './State';",
    '',
  ]

  const classDefinition = [
    'export class WorkflowManager {',
    '  constructor() {',
    '    this.create_workflow = this.create_workflow.bind(this);',
    '    this.returnGraph = this.returnGraph.bind(this);',
    '    this.run_workflow = this.run_workflow.bind(this);',
    '  }',
    '',
  ]

  const functions = nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .map((node) => {
      const functionName = (buttonTexts[node.id] || (node?.data?.label as string) || node.id).replace(/\s+/g, '_')
      return `function ${functionName}(state) {\n    return {};\n  }\n`
    })

  const conditionalFunctions = new Map()
  edges
    .filter((edge) => edge.animated)
    .forEach((edge) => {
      const sourceLabel = getNodeLabel(edge.source)
      const targetLabel = getNodeLabel(edge.target)
      const edgeLabel = edgeLabels[edge.id] || `conditional_${sourceLabel}`
      if (!conditionalFunctions.has(edgeLabel)) {
        conditionalFunctions.set(edgeLabel, { source: sourceLabel, targets: new Set() })
      }
      conditionalFunctions.get(edgeLabel).targets.add(targetLabel)
    })

  const conditionalFunctionStrings = Array.from(conditionalFunctions.entries()).map(
    ([edgeLabel, { source, targets }]) => {
      const targetStrings = Array.from(targets)
        .map((target) => `    // return "${target}";`)
        .join('\n')
      return `function ${edgeLabel}(state) {\n${targetStrings}\n  }\n`
    },
  )

  const workflowFunction = ['function create_workflow() {', '    const workflow = new StateGraph(StateAnnotation)']

  nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .forEach((node) => {
      const nodeLabel = (buttonTexts[node.id] || (node?.data?.label as string) || node.id).replace(/\s+/g, '_')
      workflowFunction.push(`      .addNode("${nodeLabel}", ${nodeLabel})`)
    })

  workflowFunction.push('')

  const processedConditionalEdges = new Set()

  edges.forEach((edge) => {
    const sourceLabel = getNodeLabel(edge.source)
    const targetLabel = getNodeLabel(edge.target)
    if (edge.animated) {
      const edgeLabel = edgeLabels[edge.id] || `conditional_${sourceLabel}`
      if (!processedConditionalEdges.has(edgeLabel)) {
        workflowFunction.push(`      .addConditionalEdges("${sourceLabel}", ${edgeLabel})`)
        processedConditionalEdges.add(edgeLabel)
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

  const graph = `\nconst workflow = create_workflow();\nconst graph = workflow.compile();\nexport { graph };\n`

  const codeParts = [
    ...imports,
    '',
    // ...classDefinition,
    ...functions,
    ...conditionalFunctionStrings,
    ...workflowFunction,
    // ...utilityFunctions,
    graph,
  ]

  return codeParts.join('\n')
}
