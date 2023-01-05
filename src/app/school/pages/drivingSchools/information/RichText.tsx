import { useState } from 'react';
import ReactQuill from 'react-quill';

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    // ['link', 'image'],
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'color',
  'background',
  'font',
  'align',
];

export default function MyEditor(props: { editorState: any; setEditorState: any }) {
  const { editorState, setEditorState } = props;

  return (
    <div style={{ minHeight: '6em', cursor: 'text', color: '#333' }}>
      <ReactQuill
        style={{ height: '16rem' }}
        modules={modules}
        formats={formats}
        value={editorState}
        onChange={(val) => {
          if (val == '<p><br></p>') {
            setEditorState();
          } else {
            setEditorState(val);
          }
        }}
      />
    </div>
  );
}
