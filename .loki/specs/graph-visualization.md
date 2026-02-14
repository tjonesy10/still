# Still - Graph Visualization Strategy

## Library Selection: react-force-graph-2d

**Decision:** Use `react-force-graph-2d` by Vasco Asturiano

**Rationale:**
- Lightweight (~50KB gzipped)
- Force-directed layout built-in
- Canvas-based rendering (high performance)
- Simple API
- Active maintenance
- Good documentation

**Alternatives Considered:**
- **D3.js** - Too low-level, requires custom force simulation
- **vis.js** - Heavy, poor React integration
- **Cytoscape.js** - Overkill for simple graphs
- **react-flow** - Better for flowcharts than knowledge graphs

---

## Implementation

### Installation

```json
{
  "dependencies": {
    "react-force-graph-2d": "^1.25.4",
    "force-graph": "^1.43.4"
  }
}
```

---

### GraphView Component

Location: `src/components/GraphView.tsx`

**Props:**
```typescript
interface GraphViewProps {
  data: { nodes: GraphNode[], edges: GraphEdge[] }
  onNodeClick: (nodeId: string) => void
  selectedNodeId?: string | null
}

interface GraphNode {
  id: string
  title: string
  connections: number
}

interface GraphEdge {
  source: string
  target: string
}
```

**State:**
```typescript
const [hoveredNode, setHoveredNode] = useState<string | null>(null)
const [zoom, setZoom] = useState(1)
```

**Configuration:**
```typescript
<ForceGraph2D
  graphData={{ nodes, links: edges }}
  nodeId="id"
  nodeLabel="title"
  nodeCanvasObject={renderNode}
  linkCanvasObject={renderLink}
  onNodeClick={handleNodeClick}
  onNodeHover={setHoveredNode}
  backgroundColor="#FAFAF8"
  linkColor={() => "#E5E7EB"}
  linkWidth={1}
  nodeRelSize={6}
  d3VelocityDecay={0.3}
  cooldownTicks={100}
  warmupTicks={50}
/>
```

---

## Visual Design

### Color Scheme (Monochrome)

```typescript
const COLORS = {
  node: {
    default: '#1C1C1C',        // Soft charcoal
    hovered: '#7A7A7A',        // Secondary gray
    selected: '#1C1C1C',       // Same as default
    selectedStroke: '#C7CDD6', // Focus color
  },
  edge: {
    default: '#E5E7EB',        // Divider color
    hovered: '#C7CDD6',        // Focus color
  },
  label: {
    default: '#1C1C1C',
    background: 'rgba(250, 250, 248, 0.9)', // Semi-transparent background
  },
  background: '#FAFAF8',
}
```

---

### Node Rendering

**Custom node renderer:**
```typescript
function renderNode(
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  const { x = 0, y = 0, id, title } = node
  const isHovered = hoveredNode === id
  const isSelected = selectedNodeId === id

  // Node size based on connection count
  const size = Math.max(4, Math.min(12, node.connections * 1.5))

  // Draw node circle
  ctx.beginPath()
  ctx.arc(x, y, size, 0, 2 * Math.PI)
  ctx.fillStyle = isHovered ? COLORS.node.hovered : COLORS.node.default
  ctx.fill()

  // Selected node: add stroke
  if (isSelected) {
    ctx.strokeStyle = COLORS.node.selectedStroke
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Label (show on hover or if selected)
  if (isHovered || isSelected) {
    ctx.font = '12px Inter'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Background
    const textWidth = ctx.measureText(title).width
    ctx.fillStyle = COLORS.label.background
    ctx.fillRect(x - textWidth / 2 - 4, y + size + 8, textWidth + 8, 18)

    // Text
    ctx.fillStyle = COLORS.label.default
    ctx.fillText(title, x, y + size + 17)
  }
}
```

---

### Edge Rendering

**Custom link renderer:**
```typescript
function renderLink(
  link: GraphEdge,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  const { source, target } = link

  // Source/target might be objects or IDs depending on force-graph state
  const sx = typeof source === 'object' ? source.x : 0
  const sy = typeof source === 'object' ? source.y : 0
  const tx = typeof target === 'object' ? target.x : 0
  const ty = typeof target === 'object' ? target.y : 0

  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(tx, ty)
  ctx.strokeStyle = COLORS.edge.default
  ctx.lineWidth = 1
  ctx.stroke()
}
```

---

## Interactions

### Click Navigation

```typescript
function handleNodeClick(node: GraphNode) {
  onNodeClick(node.id)
  // Typically navigates to /notes/{nodeId}
}
```

---

### Zoom Controls

```typescript
// Keyboard shortcuts
useKeyboardShortcut('+', () => setZoom(z => Math.min(z + 0.2, 3)))
useKeyboardShortcut('-', () => setZoom(z => Math.max(z - 0.2, 0.5)))
useKeyboardShortcut('0', () => setZoom(1)) // Reset

// Mouse wheel zoom handled by force-graph
```

---

### Hover Previews

On node hover, show:
- Node title (in label)
- Connection count (optional tooltip)

---

## Performance Optimizations

### 1. Limit Visible Nodes

For graphs with 1000+ nodes, show only most connected:

```typescript
function limitNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxNodes: number = 500
): { nodes: GraphNode[], edges: GraphEdge[] } {
  // Sort by connection count
  const sorted = nodes.sort((a, b) => b.connections - a.connections)

  // Take top N
  const topNodes = sorted.slice(0, maxNodes)
  const topNodeIds = new Set(topNodes.map(n => n.id))

  // Filter edges to only include edges between top nodes
  const filteredEdges = edges.filter(
    e => topNodeIds.has(e.source) && topNodeIds.has(e.target)
  )

  return { nodes: topNodes, edges: filteredEdges }
}
```

---

### 2. Debounce Data Updates

```typescript
import { useDebounce } from '@/hooks/useDebounce'

function GraphView({ data }: GraphViewProps) {
  const debouncedData = useDebounce(data, 300)

  return <ForceGraph2D graphData={debouncedData} />
}
```

Prevents graph re-layout on every link change during editing.

---

### 3. Memoize Graph Data

```typescript
import { useMemo } from 'react'

function useGraphData(notes: Note[], links: Link[]) {
  return useMemo(() => {
    const nodes: GraphNode[] = notes.map(n => ({
      id: n.id,
      title: n.title,
      connections: links.filter(
        l => l.sourceNoteId === n.id || l.targetNoteId === n.id
      ).length,
    }))

    const edges: GraphEdge[] = links.map(l => ({
      source: l.sourceNoteId,
      target: l.targetNoteId,
    }))

    return { nodes, edges }
  }, [notes, links])
}
```

---

### 4. Canvas Performance

- Use `requestAnimationFrame` for smooth rendering
- Offload node/edge rendering to Web Workers (advanced)
- Reduce `cooldownTicks` for faster layout convergence

---

## Layout Algorithm

### Force-Directed Configuration

```typescript
const forceConfig = {
  // Charge (repulsion between nodes)
  d3AlphaDecay: 0.0228,
  d3VelocityDecay: 0.4,

  // Link force (spring stiffness)
  linkDistance: 80,
  linkStrength: 0.5,

  // Center force (pull toward center)
  centerStrength: 0.05,

  // Cooldown (layout stabilization)
  cooldownTicks: 100,
  warmupTicks: 50,
}
```

**Behavior:**
- Nodes repel each other (charge force)
- Linked nodes attract (spring force)
- Graph stays centered (center force)
- Layout stabilizes after ~100 iterations

---

## Accessibility

### Keyboard Navigation

```typescript
const [selectedIndex, setSelectedIndex] = useState(0)

useKeyboardShortcut('ArrowRight', () => {
  const nextIndex = (selectedIndex + 1) % nodes.length
  setSelectedIndex(nextIndex)
  onNodeClick(nodes[nextIndex].id)
})

useKeyboardShortcut('ArrowLeft', () => {
  const prevIndex = (selectedIndex - 1 + nodes.length) % nodes.length
  setSelectedIndex(prevIndex)
  onNodeClick(nodes[prevIndex].id)
})

useKeyboardShortcut('Enter', () => {
  // Navigate to selected note
  navigate(`/notes/${nodes[selectedIndex].id}`)
})
```

---

### ARIA Labels

```typescript
<div
  role="img"
  aria-label={`Knowledge graph with ${nodes.length} notes and ${edges.length} connections`}
>
  <ForceGraph2D {...config} />
</div>

<ul className="sr-only">
  {nodes.map(node => (
    <li key={node.id}>
      {node.title} - {node.connections} connections
    </li>
  ))}
</ul>
```

---

## Advanced Features (Future)

### 1. Clustering

Group related notes into visual clusters:
- Use `d3-force` community detection
- Color clusters differently (still monochrome shades)

---

### 2. Temporal View

Show graph evolution over time:
- Timeline slider
- Fade in nodes as they're created
- Animate link creation

---

### 3. Subgraph Focus

Click a node to show only its immediate neighbors:
- Highlight node + 1-hop connections
- Dim other nodes
- "Expand" button to show 2-hop

---

### 4. Export

Export graph as:
- PNG/SVG image
- JSON data
- GraphML/GEXF for external tools

---

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react'
import { GraphView } from './GraphView'

test('renders nodes and edges', () => {
  const data = {
    nodes: [
      { id: '1', title: 'First', connections: 1 },
      { id: '2', title: 'Second', connections: 1 },
    ],
    edges: [
      { source: '1', target: '2' },
    ],
  }

  render(<GraphView data={data} onNodeClick={jest.fn()} />)

  // ForceGraph2D renders to canvas, so test via ARIA label
  expect(screen.getByRole('img')).toHaveAttribute(
    'aria-label',
    'Knowledge graph with 2 notes and 1 connections'
  )
})
```

---

### Visual Regression Tests

Use Playwright or Cypress with image snapshots:
- Capture graph screenshots
- Compare against baseline
- Detect layout regressions

---

## File Structure

```
src/
├── components/
│   ├── GraphView.tsx           # Main graph component
│   └── GraphControls.tsx       # Zoom, filter, export controls
├── hooks/
│   └── useGraphData.ts         # Transform notes/links to graph data
└── lib/
    └── graphUtils.ts           # Helper functions (limitNodes, etc.)
```

---

## Dependencies

```json
{
  "dependencies": {
    "react-force-graph-2d": "^1.25.4"
  }
}
```

**Bundle size:** ~50KB gzipped (acceptable)

---

This graph visualization strategy:
- ✅ Calm, monochrome design (matches Still aesthetic)
- ✅ High performance (canvas rendering)
- ✅ Handles 1000+ nodes with limiting
- ✅ Keyboard-first navigation
- ✅ Accessible (ARIA labels, keyboard shortcuts)
- ✅ Simple API (ForceGraph2D component)
- ✅ Customizable rendering (node/link canvas functions)
