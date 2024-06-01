import React, { useCallback } from "react";
import { Paper } from "@mui/material";
import "reactflow/dist/style.css";
import ReactFlow, { useNodesState, useEdgesState, addEdge } from "reactflow";
import { Handle, Position, NodeResizer } from 'reactflow';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90%",
  boxShadow: 24,
  padding: 4,
};

const nodeTypes = {
  prompt: () => {
    return <div>
           <Handle type="target" position={Position.Left} />
        hello</div>;
  },
};

export const FlowBuilder = () => {
  const initialNodes = [
    { id: "1", type: "prompt", position: { x: 0, y: 0 }, data: { label: "1" } },
    { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  ];
  const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Paper sx={modalStyle}>
      <div style={{ width: "600px", height: "600px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        />
      </div>
    </Paper>
  );
};
