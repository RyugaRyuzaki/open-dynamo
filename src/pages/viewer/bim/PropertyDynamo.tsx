"use client";
import * as WEBIFC from "web-ifc";

import * as OBC from "@thatopen/components";
import {signal} from "@preact/signals-react";

function isInputEvent(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "P" ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "BUTTON" ||
    target.isContentEditable
  );
}

import {MouseEvent, DragEvent, useState, useEffect, useCallback} from "react";
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  OnNodeDrag,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  Connection,
  addEdge,
  NodeOrigin,
  Viewport,
  useReactFlow,
} from "@xyflow/react";
import {useSignalEffect, useSignals} from "@preact/signals-react/runtime";
import {INodeType} from "@bim/types";
import {setNotify} from "@components/Notify/baseNotify";
import ExpressID, {INodeExpressID} from "./node-types/ExpressID";
import ElementProperty, {INodeIfcProperty} from "./node-types/ElementProperty";
import {geometriesSignal, propertiesSignal} from "@bim/signals";
import Relation from "./node-types/Relation";

const onNodeDrag: OnNodeDrag = (e: MouseEvent, node: Node, nodes: Node[]) => {
  if (isInputEvent(e)) return;
  console.log("drag ", node, nodes);
};
const onNodeDragStart = (e: MouseEvent, node: Node, nodes: Node[]) => {
  if (isInputEvent(e)) return;
  console.log("drag start", node, nodes);
};

const onNodeDragStop = (e: MouseEvent, node: Node, nodes: Node[]) => {
  if (isInputEvent(e)) return;
  console.log("drag stop", node, nodes);
};
const onNodeClick = (e: MouseEvent, node: Node) => {
  if (isInputEvent(e)) return;
  console.log(node);
};

const printSelectionEvent = (name: string) => (_: MouseEvent, nodes: Node[]) =>
  console.log(name, nodes);

const onDragOver = (event: DragEvent) => {
  if (!event.dataTransfer) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

let id = 0;
export const getId = () => `dndnode_${id++}`;

const nodeTypes = {
  ExpressID,
  ElementProperty,
  Relation,
};

export const addNodeSignal = signal<INodeExpressID | Node<any> | null>(null);
export const addElementSignal = signal<INodeIfcProperty | Node<any> | null>(
  null
);
export const fitViewSignal = signal<boolean>(false);
export const nodeChangeSignal = signal<{id: string; data: any} | null>(null);

const DynamoFlow = () => {
  useSignals();
  const {fitView, screenToFlowPosition} = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData(
      "application/reactflow"
    ) as INodeType;

    if (!(type in nodeTypes)) {
      setNotify(`Can not find ${type}`, false);
      return;
    }

    const categoryId = event.dataTransfer.getData("application/category");

    if (!categoryId || !OBC.IfcCategoryMap[+categoryId]) return;

    const keys: number[] = [];
    for (const key in propertiesSignal.value) {
      const type = propertiesSignal.value[key].type as number;
      if (!type || type !== +categoryId) continue;
      keys.push(+key);
    }
    if (keys.length === 0) {
      setNotify(`Empty List`, false);
      return;
    }
    const id = getId();
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    if (keys.length > 1) {
      const newNode: Node = {
        id,
        type: "Relation",
        position,
        data: {typeName: OBC.IfcCategoryMap[+categoryId], keys},
      };
      setNodes((nds: Node[]) => nds.concat(newNode));
    } else {
      const props = propertiesSignal.value[keys[0]];
      if (!props) return;
      const newNode: Node = {
        id,
        type: "ElementProperty",
        position,
        data: {...props, target: false},
      };
      setNodes((nds) => nds.concat(newNode));
    }
  };

  const onConnectEnd = useCallback((event: any, connectionState: any) => {
    // when a connection is dropped on the pane it's not valid
    const {fromNode, fromHandle} = connectionState;
    if (!connectionState.isValid) {
      const {data, internals} = fromNode;
      if (data.outputId) {
        const props = propertiesSignal.value[+data.outputId];
        if (!props) return;
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const {clientX, clientY} =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode: Node = {
          id,
          type: "ElementProperty",
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: {...props, target: true},
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat({id, source: fromNode.id, target: id}));
        return;
      }
      if (fromHandle.id && internals.handleBounds) {
        if (
          !internals.handleBounds.source ||
          !Array.isArray(internals.handleBounds.source)
        )
          return;
        const props =
          propertiesSignal.value[+fromHandle.id] ||
          geometriesSignal.value[fromHandle.id];
        if (!props) return;
        const id = getId();
        const {clientX, clientY} =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode: Node = {
          id,
          type: "ElementProperty",
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: {...props, target: true},
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat({id, source: fromNode.id, target: id}));
      }
    }
  }, []);
  useSignalEffect(() => {
    const node = addNodeSignal.value;
    if (!node) return;
    const {type} = node;
    if (!type || !(type in nodeTypes)) {
      setNotify(`Can not find ${type}`, false);
      return;
    }
    setNodes((nds: Node[]) => nds.concat(node));
  });
  useSignalEffect(() => {
    const node = addElementSignal.value;
    if (!node) return;
  });
  useSignalEffect(() => {
    (async () => {
      if (!fitViewSignal.value) return;
      await fitView();
      fitViewSignal.value = false;
    })();
  });
  useSignalEffect(() => {
    const nodeChange = nodeChangeSignal.value;
    if (!nodeChange) return;
    setNodes((nds: Node[]) =>
      nds.map((n: Node) => {
        if (nodeChange.id === n.id) {
          return {...n, data: nodeChange.data};
        }
        return n;
      })
    );
    nodeChangeSignal.value = null;
  });
  useEffect(() => {
    return () => {
      addNodeSignal.value = null;
      addElementSignal.value = null;
      fitViewSignal.value = false;
      nodeChangeSignal.value = null;
      setNodes([]);
      setEdges([]);
    };
  }, []);
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onNodeDragStop={onNodeDragStop}
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
      onSelectionDragStart={printSelectionEvent("selection drag start")}
      onSelectionDrag={printSelectionEvent("selection drag")}
      onSelectionDragStop={printSelectionEvent("selection drag stop")}
      fitView
      selectNodesOnDrag={false}
      elevateEdgesOnSelect
      elevateNodesOnSelect={false}
      nodeDragThreshold={0}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      maxZoom={Infinity}
      minZoom={0.1}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={nodeTypes}
    >
      <Background></Background>
    </ReactFlow>
  );
};
const PropertyDynamo = () => {
  return (
    <ReactFlowProvider>
      <DynamoFlow />
    </ReactFlowProvider>
  );
};

export default PropertyDynamo;
