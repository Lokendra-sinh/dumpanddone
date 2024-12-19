// src/lib/loading-node.tsx
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'

import styled from 'styled-components';

const Spinner = styled.div`
  width: 24px;
  aspect-ratio: 1;
  display: grid;
  border-radius: 50%;
  background: linear-gradient(0deg, rgba(147, 51, 234, 0.5) 30%, #0000 0 70%, rgba(147, 51, 234, 1) 0) 50%/8% 100%,
              linear-gradient(90deg, rgba(147, 51, 234, 0.25) 30%, #0000 0 70%, rgba(147, 51, 234, 0.75) 0) 50%/100% 8%;
  background-repeat: no-repeat;
  animation: spinLoader 1s infinite steps(12);

  &::before,
  &::after {
    content: "";
    grid-area: 1/1;
    border-radius: 50%;
    background: inherit;
    opacity: 0.915;
    transform: rotate(30deg);
  }

  &::after {
    opacity: 0.83;
    transform: rotate(60deg);
  }

  @keyframes spinLoader {
    100% { transform: rotate(1turn) }
  }
`;

const LoadingComponent = ({ node }) => {
  return (
    <NodeViewWrapper 
      className="react-loading-node-view my-6"
      contentEditable={false}
    >
      <div className="flex items-center gap-3 border border-purple-200 rounded-lg p-3 bg-purple-50/50">
        <Spinner />
        <span className="text-muted-foreground text-sm">
          {node.attrs.message || 'Processing your content...'}
        </span>
      </div>
    </NodeViewWrapper>
  )
}

export const LoadingNode = Node.create({
  name: 'loadingNode',
  
  group: 'block',
  
  atom: true,
  
  draggable: false,
  
  inline: false, // Force block-level to prevent bubble menu issues
  
  selectable: false,

  addAttributes() {
    return {
      message: {
        default: 'Loading...'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-loading-node]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-loading-node': '', ...HTMLAttributes }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(LoadingComponent)
  },
})