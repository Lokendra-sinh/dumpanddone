import { Plate} from '@udecode/plate-common/react';

import { Editor, EditorContainer } from '../../components/plate-ui/editor'
import { useCreateEditor } from '@/components/editor/use-create-editor';


export function Playground() {
  const editor = useCreateEditor()

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="none" />
      </EditorContainer>
    </Plate>
  );
}
