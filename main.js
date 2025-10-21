// Mind map app/vizualiser. Takes in an object and visualises it as a mind map. Bunch of main nodes that can be expanded/collapsed to show sub-nodes. Each node can have text, images, links, etc.
// Presentation like Obsidian's graph view, but no need for zoom.
// Everything is in one file for simplicity, but should be split into multiple files for a real app.
// use canvas only for lines connecting nodes, everything else is DOM elements, nodes adapt to their content size.
// Nodes can be dragged around, and the layout updates accordingly. Nodes are also randomly positioned initially.

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("container");
const tooltip = document.getElementById("tooltip");

container.style.position = "relative";
container.style.overflow = "hidden";
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "0";

let nodes = [];
let edges = [];
let nodeIdCounter = 0;
let draggingNode = null;
let offsetX, offsetY;
let isPanning = false;
let panStartX, panStartY;
let selectedNode = null;

const nodeWidth = 150;
const nodeHeight = 50;
const nodeMargin = 20;
const canvasPadding = 100;
const edgeColor = "#ccc";
const edgeWidth = 2;

function createNode(content, x, y, parent = null) {
  const node = {
    id: nodeIdCounter++,
    content,
    x,
    y,
    width: nodeWidth,
    height: nodeHeight,
    parent,
    children: [],
    expanded: true,
  };
  nodes.push(node);
  if (parent) {
    parent.children.push(node);
    edges.push({ from: parent.id, to: node.id });
  }
  return node;
}

function createEdge(fromId, toId) {
  edges.push({ from: fromId, to: toId });
}
function getNodeById(id) {
  return nodes.find((node) => node.id === id);
}
function drawNode(node) {
  const div = document.createElement("div");
  div.className = "node";
  div.style.left = `${node.x}px`;
  div.style.top = `${node.y}px`;
  div.style.width = `${node.width}px`;
  div.style.height = `${node.height}px`;
  div.innerHTML = node.content;
  div.onclick = (e) => {
    e.stopPropagation();
    if (selectedNode) {
      selectedNode.element.classList.remove("selected");
    }
    selectedNode = node;
    div.classList.add("selected");
  };
  div.ondblclick = (e) => {
    e.stopPropagation();
    node.expanded = !node.expanded;
    updateLayout();
  };
  div.onmousedown = (e) => {
    e.stopPropagation();
    draggingNode = node;
    offsetX = e.clientX - node.x;
    offsetY = e.clientY - node.y;
  };
  div.onmouseover = (e) => {
    tooltip.style.display = "block";
    tooltip.innerHTML = `Node ID: ${node.id}<br>Content: ${node.content}`;
  };
  div.onmousemove = (e) => {
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY + 10}px`;
  };
  div.onmouseout = (e) => {
    tooltip.style.display = "none";
  };
  container.appendChild(div);
  node.element = div;
}

function drawEdge(edge) {
  const fromNode = getNodeById(edge.from);
  const toNode = getNodeById(edge.to);
  if (!fromNode || !toNode) return;
  ctx.beginPath();
  ctx.moveTo(fromNode.x + fromNode.width / 2, fromNode.y + fromNode.height / 2);
  ctx.lineTo(toNode.x + toNode.width / 2, toNode.y + toNode.height / 2);
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = edgeWidth;
  ctx.stroke();
}

function updateLayout() {
  container.innerHTML = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  nodes.forEach((node) => {
    if (!node.parent || (node.parent && node.parent.expanded)) {
      drawNode(node);
    }
  });
  edges.forEach((edge) => {
    const fromNode = getNodeById(edge.from);
    const toNode = getNodeById(edge.to);
    if (
      fromNode &&
      toNode &&
      (!fromNode.parent || (fromNode.parent && fromNode.parent.expanded)) &&
      (!toNode.parent || (toNode.parent && toNode.parent.expanded))
    ) {
      drawEdge(edge);
    }
  });
}

function randomPosition() {
  const x =
    Math.random() * (canvas.width - nodeWidth - canvasPadding * 2) +
    canvasPadding;
  const y =
    Math.random() * (canvas.height - nodeHeight - canvasPadding * 2) +
    canvasPadding;
  return { x, y };
}

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.style.width = `${window.innerWidth}px`;
  container.style.height = `${window.innerHeight}px`;

  // Example data
  const root1 = createNode("Root 1", ...Object.values(randomPosition()));
  const child1 = createNode(
    "Child 1.1",
    ...Object.values(randomPosition()),
    root1,
  );
  const child2 = createNode(
    "Child 1.2",
    ...Object.values(randomPosition()),
    root1,
  );
  const subChild1 = createNode(
    "SubChild 1.2.1",
    ...Object.values(randomPosition()),
    child2,
  );

  const root2 = createNode("Root 2", ...Object.values(randomPosition()));
  const child3 = createNode(
    "Child 2.1",
    ...Object.values(randomPosition()),
    root2,
  );
  const child4 = createNode(
    "Child 2.2",
    ...Object.values(randomPosition()),
    root2,
  );

  updateLayout();
}

window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.style.width = `${window.innerWidth}px`;
  container.style.height = `${window.innerHeight}px`;
  updateLayout();
};
window.onmousemove = (e) => {
  if (draggingNode) {
    draggingNode.x = e.clientX - offsetX;
    draggingNode.y = e.clientY - offsetY;
    updateLayout();
  } else if (isPanning) {
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    container.style.transform = `translate(${dx}px, ${dy}px)`;
  }
};
window.onmouseup = (e) => {
  draggingNode = null;
  isPanning = false;
  container.style.transform = `translate(0, 0)`;
};

window.onmousedown = (e) => {
  if (e.target === container) {
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    if (selectedNode) {
      selectedNode.element.classList.remove("selected");
      selectedNode = null;
    }
  }
};

init();

//
