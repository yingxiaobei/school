import React, { memo, useState } from 'react';
import { Tag, Input, Tooltip, message, InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useVisible } from 'hooks';
import styles from './index.module.css';
import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  tags: string[];
  editTags: (newTags: string[]) => void;
}

type EditInput = {
  editInputIndex: number;
  editInputValue: Tags;
};

type Tags = {
  _id: string;
  value: string;
};

function ClassTagsShow({ tags, editTags }: Props) {
  const [showTags, setShowTags] = useState<Tags[]>(() => {
    return tags.map((tag) => ({
      _id: uuidv4(),
      value: tag,
    }));
  });
  const saveInputRef = useRef<InputRef>(null);
  const saveEditInputRef = useRef<InputRef>(null);

  const [editInput, setEditInput] = useState<EditInput>({ editInputIndex: -1, editInputValue: { _id: '', value: '' } });
  const [inputVisible, setInputVisible] = useVisible();
  const [inputValue, setInputValue] = useState('');
  const timer = useRef<number | null>(null);

  const showInput = () => {
    setInputVisible();
    timer.current = setTimeout(() => {
      saveInputRef.current?.focus();
    });
  };

  const handleClose = (removedTag: Tags) => {
    const tags = showTags.filter((tag) => tag._id !== removedTag._id);
    setShowTags(tags);
    editTags(tags.map((tag) => tag.value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputConfirm = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const tags = showTags.map((tag) => tag.value);
    if (inputValue.length > 5) {
      return message.error('每个标签不超过5个字');
    }

    if (inputValue.trim()) {
      setShowTags([...showTags, { _id: uuidv4(), value: inputValue.trim() }]);
      editTags([...tags, inputValue]);
    }

    setInputValue('');
    setInputVisible();
  };

  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditInput({
      ...editInput,
      editInputValue: { _id: uuidv4(), value: event.target.value },
    });
  };

  const handleEditInputConfirm = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const newShowTags = [...showTags];
    if (editInput.editInputValue.value.length > 5) {
      return message.error('每个标签不超过5个字');
    }
    if (editInput.editInputValue.value.trim()) {
      newShowTags[editInput.editInputIndex] = {
        ...editInput.editInputValue,
        value: editInput.editInputValue.value.trim(),
      };
      setShowTags(newShowTags);
      editTags(newShowTags.map((tag) => tag.value));
      setEditInput({ editInputIndex: -1, editInputValue: { _id: '', value: '' } });
    } else {
      handleClose(newShowTags[editInput.editInputIndex]);
    }
  };

  const isLongTag = (showTag: Tags) => showTag.value.length > 20;

  const tagElem = (showTag: Tags, index: number) => (
    <Tag className={styles['editTag']} key={showTag._id} closable onClose={() => handleClose(showTag)}>
      <span
        onDoubleClick={(e) => {
          setEditInput({
            editInputIndex: index,
            editInputValue: showTag,
          });
          timer.current = setTimeout(() => {
            saveEditInputRef.current?.focus();
          });

          e.preventDefault();
        }}
      >
        {isLongTag(showTag) ? `${showTag.value.slice(0, 20)}...` : showTag.value}
      </span>
    </Tag>
  );

  return (
    <>
      {showTags.map((showTag, index) => {
        if (editInput.editInputIndex === index) {
          return (
            <Input
              ref={saveEditInputRef}
              key={index}
              size="small"
              className={styles['tagInput']}
              value={editInput.editInputValue.value}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }

        return isLongTag(showTag) ? (
          <Tooltip title={showTag} key={index}>
            {tagElem(showTag, index)}
          </Tooltip>
        ) : (
          tagElem(showTag, index)
        );
      })}

      {inputVisible && (
        <Input
          ref={saveInputRef}
          type="text"
          size="small"
          className={styles['tagInput']}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}

      {!inputVisible && showTags.length < 3 && (
        <Tag className={styles['siteTagPlus']} onClick={showInput}>
          <PlusOutlined /> 新增标签
        </Tag>
      )}
    </>
  );
}

export default memo(ClassTagsShow);
