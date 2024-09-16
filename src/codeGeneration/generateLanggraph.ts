import { type CustomNodeType } from '@/components/nodes'
import { type CustomEdgeType } from '@/components/edges'
import { useEdgeLabel } from '@/contexts/EdgeLabelContext'

export function generateLanggraphCode(
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

  const imports = ['from langgraph.graph import StateGraph, END', 'from typing import TypedDict, Literal', '\n']

  const functions = nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .map(
      (node) =>
        `def ${(buttonTexts[node.id] || (node?.data?.label as string) || node.id).replace(/\s+/g, '_')}(state: State, config: dict) -> State:\n    return {} \n`,
    )

  const conditionalFunctions = new Map()
  edges
    .filter((edge) => edge.animated)
    .forEach((edge) => {
      const sourceLabel = getNodeLabel(edge.source)
      const targetLabel = getNodeLabel(edge.target)
      const edgeLabel = edgeLabels[edge.source] || `conditional_${sourceLabel}`
      if (!conditionalFunctions.has(edgeLabel)) {
        conditionalFunctions.set(edgeLabel, { source: sourceLabel, targets: new Set() })
      }
      conditionalFunctions.get(edgeLabel).targets.add(targetLabel)
    })

  const conditionalFunctionStrings = Array.from(conditionalFunctions.entries()).map(
    ([edgeLabel, { source, targets }]) => {
      const targetStrings = Array.from(targets)
        .map((target) => (target === 'end' ? '    # return END' : `    # return "${target}"`))
        .join('\n')
      const literalTypes = Array.from(targets)
        .map((target) => (target === 'end' ? 'END' : `'${target}'`))
        .join(', ')
      return `def ${edgeLabel}(state: State, config: dict) -> Literal[${literalTypes}]:\n    """Function to handle conditional edges for ${source}"""\n${targetStrings}\n`
    },
  )

  const stateClass = [
    'class State(TypedDict): \n    """State class for the agent"""\n    # Add your state variables here\n',
  ]

  const workflowFunction = ['workflow = StateGraph(State)', '', '# Add nodes to the graph']

  nodes
    .filter((node) => node.type !== 'source' && node.type !== 'end')
    .forEach((node) => {
      workflowFunction.push(
        `workflow.add_node("${(buttonTexts[node.id] || (node?.data?.label as string) || node.id).replace(/\s+/g, '_')}", ${(
          buttonTexts[node.id] ||
          (node?.data?.label as string) ||
          node.id
        ).replace(/\s+/g, '_')})`,
      )
    })

  workflowFunction.push('', '# Define edges')

  const processedConditionalEdges = new Set()

  edges.forEach((edge) => {
    const sourceLabel = getNodeLabel(edge.source)
    const targetLabel = getNodeLabel(edge.target)
    if (edge.animated) {
      const edgeLabel = edgeLabels[edge.source] || `conditional_${sourceLabel}`
      if (!processedConditionalEdges.has(edgeLabel)) {
        workflowFunction.push(`workflow.add_conditional_edges("${sourceLabel}", ${edgeLabel})`)
        processedConditionalEdges.add(edgeLabel)
      }
    } else {
      if (targetLabel === 'end') {
        workflowFunction.push(`workflow.add_edge("${sourceLabel}", END)`)
      } else {
        if (sourceLabel != 'source') workflowFunction.push(`workflow.add_edge("${sourceLabel}", "${targetLabel}")`)
      }
    }
  })

  const startNode = nodes.find((node) => {
    const sourceNode = nodes.find((n) => n.type === 'source')
    return edges.some((edge) => edge.source === sourceNode?.id && edge.target === node.id)
  })
  if (startNode) {
    workflowFunction.push(`workflow.set_entry_point("${getNodeLabel(startNode.id)}")`)
  }

  const graph = `\ngraph=workflow.compile()`

  const codeParts = [...imports, ...stateClass, ...functions, ...conditionalFunctionStrings, ...workflowFunction, graph]

  return codeParts.join('\n')
}
