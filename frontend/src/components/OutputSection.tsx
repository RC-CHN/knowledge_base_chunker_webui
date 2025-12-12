import React from 'react';
import { Card, List, Tag, Button, Tooltip, Typography, Space, Spin, message, Input, Checkbox, Dropdown, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import { CopyOutlined, ThunderboltOutlined, InfoCircleOutlined, EditOutlined, SaveOutlined, DownloadOutlined, DownOutlined, ClearOutlined, FileTextOutlined, DeleteOutlined, PlusOutlined, DragOutlined, SwapOutlined } from '@ant-design/icons';
import type { Chunk } from '../types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OutputSectionProps {
  loading: boolean;
  chunks: Chunk[];
  totalChunks: number;
  processedCount?: number;
}

interface SortableItemProps {
  id: string;
  chunk: Chunk;
  index: number;
  selected: boolean;
  editing: boolean;
  editContent: string;
  processing: boolean;
  onToggleSelect: () => void;
  onEdit: (content: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onProcess: (action: 'clean' | 'summarize') => void;
  onEditContentChange: (content: string) => void;
  onUseSummary: () => void;
  t: any;
}

const SortableItem = ({
  id,
  chunk,
  index,
  selected,
  editing,
  editContent,
  processing,
  onToggleSelect,
  onEdit,
  onSave,
  onDelete,
  onProcess,
  onEditContentChange,
  onUseSummary,
  t
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    position: isDragging ? 'relative' as const : 'static' as const,
    marginBottom: 16,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{ width: '100%', boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <div {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8, display: 'flex', alignItems: 'center' }}>
                <DragOutlined style={{ color: '#bfbfbf' }} />
              </div>
              <Checkbox
                checked={selected}
                onChange={onToggleSelect}
              />
              <Tag color="blue">#{index + 1}</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>{t('output.chunk.offset')}: {chunk.original_index}</Text>
            </Space>
            <Space>
              {editing ? (
                <Tooltip title={t('output.chunk.save')}>
                  <Button
                    type="text"
                    icon={<SaveOutlined />}
                    size="small"
                    onClick={onSave}
                  />
                </Tooltip>
              ) : (
                <>
                  <Tooltip title={t('output.chunk.clean')}>
                    <Button
                      type="text"
                      icon={<ClearOutlined />}
                      size="small"
                      loading={processing}
                      onClick={() => onProcess('clean')}
                    />
                  </Tooltip>
                  <Tooltip title={t('output.chunk.summarize')}>
                    <Button
                      type="text"
                      icon={<FileTextOutlined />}
                      size="small"
                      loading={processing}
                      onClick={() => onProcess('summarize')}
                    />
                  </Tooltip>
                  <Tooltip title={t('output.chunk.edit')}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => onEdit(chunk.content)}
                    />
                  </Tooltip>
                </>
              )}
              <Tooltip title={t('output.chunk.copy')}>
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(chunk.content);
                    message.success(t('output.messages.copied'));
                  }}
                />
              </Tooltip>
              <Popconfirm
                title={t('output.chunk.delete')}
                description={t('output.chunk.confirmDelete')}
                onConfirm={onDelete}
                okText={t('common.yes') || 'Yes'}
                cancelText={t('common.no') || 'No'}
              >
                <Tooltip title={t('output.chunk.delete')}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Tooltip>
              </Popconfirm>
            </Space>
          </div>
        }
      >
        {editing ? (
          <TextArea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 10 }}
            style={{ marginBottom: chunk.summary ? 12 : 0 }}
          />
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: chunk.summary ? 12 : 0 }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {chunk.content}
            </Paragraph>
          </div>
        )}
        
        {chunk.summary && (
          <div style={{ background: '#fffbe6', padding: '12px', borderRadius: '6px', border: '1px solid #ffe58f', marginTop: 12, position: 'relative' }}>
            <Space align="start">
              <ThunderboltOutlined style={{ color: '#faad14', marginTop: 4 }} />
              <div>
                <Text strong style={{ fontSize: '12px', color: '#d48806' }}>{t('output.chunk.aiSummary')}</Text>
                <Paragraph style={{ margin: 0, fontSize: '13px', color: 'rgba(0,0,0,0.65)' }}>{chunk.summary}</Paragraph>
              </div>
            </Space>
            {!editing && (
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <Popconfirm
                  title={t('output.chunk.useSummary')}
                  description={t('output.chunk.confirmUseSummary')}
                  onConfirm={onUseSummary}
                  okText={t('common.yes') || 'Yes'}
                  cancelText={t('common.no') || 'No'}
                >
                  <Tooltip title={t('output.chunk.useSummary')}>
                    <Button
                      type="text"
                      size="small"
                      icon={<SwapOutlined rotate={90} />}
                      style={{ color: '#faad14' }}
                    />
                  </Tooltip>
                </Popconfirm>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Text type="secondary" style={{ fontSize: '12px' }}>{chunk.content.length} {t('output.chunk.chars')}</Text>
            {chunk.token_count !== undefined && (
              <Tag color="purple" style={{ margin: 0 }}>{chunk.token_count} {t('output.chunk.tokens')}</Tag>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

const OutputSection: React.FC<OutputSectionProps> = ({ loading, chunks: initialChunks, totalChunks, processedCount }) => {
  const { t } = useTranslation();
  const [chunks, setChunks] = useState<Chunk[]>(initialChunks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedChunks, setSelectedChunks] = useState<Set<number>>(new Set());
  const [processingChunkIds, setProcessingChunkIds] = useState<Set<number>>(new Set());

  // Generate unique IDs for drag and drop
  const [chunkIds, setChunkIds] = useState<string[]>([]);

  useEffect(() => {
    setChunks(initialChunks);
    setChunkIds(initialChunks.map((_, i) => `chunk-${i}-${Date.now()}`));
    setSelectedChunks(new Set());
  }, [initialChunks]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChunks((items) => {
        const oldIndex = chunkIds.indexOf(active.id as string);
        const newIndex = chunkIds.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
      
      setChunkIds((ids) => {
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);
        return arrayMove(ids, oldIndex, newIndex);
      });

      // Update selected chunks indices mapping
      const oldIndex = chunkIds.indexOf(active.id as string);
      const newIndex = chunkIds.indexOf(over.id as string);
      
      const newSelected = new Set<number>();
      selectedChunks.forEach(i => {
        if (i === oldIndex) newSelected.add(newIndex);
        else if (i === newIndex) newSelected.add(oldIndex);
        else newSelected.add(i);
      });
      setSelectedChunks(newSelected);
    }
  };

  const handleProcessChunk = async (index: number, action: 'clean' | 'summarize') => {
    const chunk = chunks[index];
    setProcessingChunkIds(prev => new Set(prev).add(index));

    try {
      const response = await axios.post('/api/v1/process/chunk', {
        chunk: chunk,
        action: action
      });

      const updatedChunk = response.data;
      const newChunks = [...chunks];
      newChunks[index] = updatedChunk;
      setChunks(newChunks);
      message.success(action === 'clean' ? t('output.messages.cleaned') : t('output.messages.summarized'));
    } catch (error) {
      console.error(`Error ${action}ing chunk:`, error);
      message.error(action === 'clean' ? t('output.messages.failedToClean') : t('output.messages.failedToSummarize'));
    } finally {
      setProcessingChunkIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleEdit = (index: number, content: string) => {
    setEditingId(index);
    setEditContent(content);
  };

  const handleSave = (index: number) => {
    const newChunks = [...chunks];
    newChunks[index] = { ...newChunks[index], content: editContent };
    setChunks(newChunks);
    setEditingId(null);
    message.success(t('output.messages.updated'));
  };

  const handleDelete = (index: number) => {
    const newChunks = chunks.filter((_, i) => i !== index);
    setChunks(newChunks);
    
    const newChunkIds = chunkIds.filter((_, i) => i !== index);
    setChunkIds(newChunkIds);
    
    // Update selected chunks indices
    const newSelected = new Set<number>();
    selectedChunks.forEach(i => {
      if (i < index) newSelected.add(i);
      else if (i > index) newSelected.add(i - 1);
    });
    setSelectedChunks(newSelected);
    
    message.success(t('output.messages.deleted'));
  };

  const handleUseSummary = (index: number) => {
    const chunk = chunks[index];
    if (chunk.summary) {
      const newChunks = [...chunks];
      newChunks[index] = { ...chunk, content: chunk.summary };
      setChunks(newChunks);
      message.success(t('output.messages.summaryUsed'));
    }
  };

  const handleAddChunk = () => {
    const newChunk: Chunk = {
      content: '',
      original_index: chunks.length > 0 ? chunks[chunks.length - 1].original_index + 1 : 0,
    };
    setChunks([...chunks, newChunk]);
    setChunkIds([...chunkIds, `chunk-${chunks.length}-${Date.now()}`]);
    
    // Automatically enter edit mode for the new chunk
    setEditingId(chunks.length);
    setEditContent('');
    
    // Scroll to bottom
    setTimeout(() => {
      const listContainer = document.querySelector('.ant-list-items');
      if (listContainer) {
        listContainer.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedChunks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedChunks(newSelected);
  };

  const handleExport = (format: 'json' | 'txt' | 'md') => {
    const chunksToExport = selectedChunks.size > 0
      ? chunks.filter((_, index) => selectedChunks.has(index))
      : chunks;

    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'json') {
      content = JSON.stringify(chunksToExport, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else if (format === 'txt') {
      content = chunksToExport.map(c => c.content).join('\n\n---\n\n');
      mimeType = 'text/plain';
      extension = 'txt';
    } else if (format === 'md') {
      content = chunksToExport.map((c, i) => `## Chunk ${i + 1}\n\n${c.content}`).join('\n\n');
      mimeType = 'text/markdown';
      extension = 'md';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chunks.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMenu: MenuProps['items'] = [
    {
      key: 'json',
      label: t('output.exportOptions.json'),
      onClick: () => handleExport('json'),
    },
    {
      key: 'txt',
      label: t('output.exportOptions.txt'),
      onClick: () => handleExport('txt'),
    },
    {
      key: 'md',
      label: t('output.exportOptions.md'),
      onClick: () => handleExport('md'),
    },
  ];
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CopyOutlined />
            {t('output.title')}
            {selectedChunks.size > 0 && <Tag color="blue">{selectedChunks.size} {t('output.selected')}</Tag>}
          </Space>
          <Space>
            <Button icon={<PlusOutlined />} onClick={handleAddChunk}>
              {t('output.addChunk')}
            </Button>
            {chunks.length > 0 && (
              <Dropdown menu={{ items: exportMenu }} trigger={['click']}>
                <Button icon={<DownloadOutlined />}>
                  {t('output.export')} <DownOutlined />
                </Button>
              </Dropdown>
            )}
            {chunks.length > 0 && <Tag color="blue">{chunks.length} {t('output.chunks')}</Tag>}
          </Space>
        </div>
      }
      style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 112px)' }}
      styles={{ body: { flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', background: '#fafafa', height: '100%' } }}
    >
      {loading && chunks.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16 }}>{t('output.processing')}</Text>
          {processedCount !== undefined && totalChunks > 0 && (
             <Text type="secondary" style={{ marginTop: 8 }}>{processedCount} / {totalChunks}</Text>
          )}
        </div>
      ) : chunks.length > 0 ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={chunkIds}
              strategy={verticalListSortingStrategy}
            >
              {chunks.map((chunk, index) => (
                <SortableItem
                  key={chunkIds[index]}
                  id={chunkIds[index]}
                  chunk={chunk}
                  index={index}
                  selected={selectedChunks.has(index)}
                  editing={editingId === index}
                  editContent={editContent}
                  processing={processingChunkIds.has(index)}
                  onToggleSelect={() => toggleSelect(index)}
                  onEdit={handleEdit.bind(null, index)}
                  onSave={() => handleSave(index)}
                  onDelete={() => handleDelete(index)}
                  onProcess={(action) => handleProcessChunk(index, action)}
                  onEditContentChange={setEditContent}
                  onUseSummary={() => handleUseSummary(index)}
                  t={t}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#ccc' }}>
          <InfoCircleOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
          <Text type="secondary">{t('output.noChunks')}</Text>
        </div>
      )}
    </Card>
  );
};

export default OutputSection;