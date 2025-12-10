import React from 'react';
import { Card, List, Tag, Button, Tooltip, Typography, Space, Spin, message, Input, Checkbox, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { CopyOutlined, ThunderboltOutlined, InfoCircleOutlined, EditOutlined, SaveOutlined, DownloadOutlined, DownOutlined, ClearOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Chunk } from '../types';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OutputSectionProps {
  loading: boolean;
  chunks: Chunk[];
  totalChunks: number;
}

const OutputSection: React.FC<OutputSectionProps> = ({ loading, chunks: initialChunks, totalChunks }) => {
  const [chunks, setChunks] = useState<Chunk[]>(initialChunks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [selectedChunks, setSelectedChunks] = useState<Set<number>>(new Set());
  const [processingChunkIds, setProcessingChunkIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setChunks(initialChunks);
    setSelectedChunks(new Set());
  }, [initialChunks]);

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
      message.success(`Chunk ${action === 'clean' ? 'cleaned' : 'summarized'} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing chunk:`, error);
      message.error(`Failed to ${action} chunk`);
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
    message.success('Chunk updated');
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
      label: 'Export as JSON',
      onClick: () => handleExport('json'),
    },
    {
      key: 'txt',
      label: 'Export as Text',
      onClick: () => handleExport('txt'),
    },
    {
      key: 'md',
      label: 'Export as Markdown',
      onClick: () => handleExport('md'),
    },
  ];
  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <CopyOutlined />
            Processed Chunks
            {selectedChunks.size > 0 && <Tag color="blue">{selectedChunks.size} Selected</Tag>}
          </Space>
          <Space>
            {totalChunks > 0 && (
              <Dropdown menu={{ items: exportMenu }}>
                <Button icon={<DownloadOutlined />}>
                  Export <DownOutlined />
                </Button>
              </Dropdown>
            )}
            {totalChunks > 0 && <Tag color="blue">{totalChunks} Chunks</Tag>}
          </Space>
        </div>
      }
      style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 112px)' }}
      styles={{ body: { flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', background: '#fafafa', height: '100%' } }}
    >
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Spin size="large" />
          <Text type="secondary" style={{ marginTop: 16 }}>Processing...</Text>
        </div>
      ) : chunks.length > 0 ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <List
            dataSource={chunks}
            split={false}
            renderItem={(item, index) => (
              <List.Item style={{ padding: '0 0 16px 0' }}>
                <Card 
                  size="small" 
                  style={{ width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Space>
                        <Checkbox
                          checked={selectedChunks.has(index)}
                          onChange={() => toggleSelect(index)}
                        />
                        <Tag color="blue">#{index + 1}</Tag>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Offset: {item.original_index}</Text>
                      </Space>
                      <Space>
                        {editingId === index ? (
                          <Tooltip title="Save">
                            <Button
                              type="text"
                              icon={<SaveOutlined />}
                              size="small"
                              onClick={() => handleSave(index)}
                            />
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title="Clean Text">
                              <Button
                                type="text"
                                icon={<ClearOutlined />}
                                size="small"
                                loading={processingChunkIds.has(index)}
                                onClick={() => handleProcessChunk(index, 'clean')}
                              />
                            </Tooltip>
                            <Tooltip title="Summarize">
                              <Button
                                type="text"
                                icon={<FileTextOutlined />}
                                size="small"
                                loading={processingChunkIds.has(index)}
                                onClick={() => handleProcessChunk(index, 'summarize')}
                              />
                            </Tooltip>
                            <Tooltip title="Edit">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEdit(index, item.content)}
                              />
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Copy">
                          <Button
                            type="text"
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(item.content);
                              message.success('Copied!');
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  }
                >
                  {editingId === index ? (
                    <TextArea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoSize={{ minRows: 3, maxRows: 10 }}
                      style={{ marginBottom: item.summary ? 12 : 0 }}
                    />
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: item.summary ? 12 : 0 }}>
                      <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                        {item.content}
                      </Paragraph>
                    </div>
                  )}
                  
                  {item.summary && (
                    <div style={{ background: '#fffbe6', padding: '12px', borderRadius: '6px', border: '1px solid #ffe58f', marginTop: 12 }}>
                      <Space align="start">
                        <ThunderboltOutlined style={{ color: '#faad14', marginTop: 4 }} />
                        <div>
                          <Text strong style={{ fontSize: '12px', color: '#d48806' }}>AI Summary</Text>
                          <Paragraph style={{ margin: 0, fontSize: '13px', color: 'rgba(0,0,0,0.65)' }}>{item.summary}</Paragraph>
                        </div>
                      </Space>
                    </div>
                  )}

                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{item.content.length} chars</Text>
                      {item.token_count !== undefined && (
                        <Tag color="purple" style={{ margin: 0 }}>{item.token_count} tokens</Tag>
                      )}
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#ccc' }}>
          <InfoCircleOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
          <Text type="secondary">No chunks generated yet</Text>
        </div>
      )}
    </Card>
  );
};

export default OutputSection;