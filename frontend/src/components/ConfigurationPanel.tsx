import React from 'react';
import { 
  Select,
  InputNumber,
  Switch,
  Button,
  Typography, 
  Card,
  Space,
  Divider,
  Tooltip
} from 'antd';
import { 
  RocketOutlined, 
  SettingOutlined, 
  ScissorOutlined, 
  ThunderboltOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface ConfigurationPanelProps {
  method: 'fixed_size' | 'semantic' | 'recursive';
  setMethod: (value: 'fixed_size' | 'semantic' | 'recursive') => void;
  chunkSize: number;
  setChunkSize: (value: number) => void;
  chunkOverlap: number;
  setChunkOverlap: (value: number) => void;
  semanticThreshold: number;
  setSemanticThreshold: (value: number) => void;
  separators: string;
  setSeparators: (value: string) => void;
  cleanText: boolean;
  setCleanText: (value: boolean) => void;
  generateSummary: boolean;
  setGenerateSummary: (value: boolean) => void;
  handleProcess: () => void;
  loading: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  method,
  setMethod,
  chunkSize,
  setChunkSize,
  chunkOverlap,
  setChunkOverlap,
  semanticThreshold,
  setSemanticThreshold,
  separators,
  setSeparators,
  cleanText,
  setCleanText,
  generateSummary,
  setGenerateSummary,
  handleProcess,
  loading
}) => {
  return (
    <Card 
      title={
        <Space>
          <SettingOutlined />
          <span>Configuration</span>
        </Space>
      }
      bordered={false}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Strategy</Text>
        <Select 
          value={method} 
          onChange={setMethod} 
          style={{ width: '100%' }}
          options={[
            { value: 'fixed_size', label: 'Fixed Size' },
            { value: 'semantic', label: 'Semantic (Embedding)' },
            { value: 'recursive', label: 'Recursive' },
          ]}
        />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {method === 'fixed_size' && 'Splits text into fixed-size chunks with overlap.'}
            {method === 'semantic' && 'Uses embeddings to split text based on semantic meaning.'}
            {method === 'recursive' && 'Recursively splits text using different separators.'}
          </Text>
        </div>
      </div>

      <Divider plain>Chunking Parameters</Divider>
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {method !== 'semantic' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text>Chunk Size</Text>
                  <Tooltip title="The maximum number of characters in each chunk">
                    <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                </Space>
                <InputNumber
                  min={1}
                  value={chunkSize}
                  onChange={(v) => setChunkSize(v || 500)}
                  style={{ width: '120px' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text>Overlap</Text>
                  <Tooltip title="The number of characters to overlap between chunks">
                    <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                </Space>
                <InputNumber
                  min={0}
                  value={chunkOverlap}
                  onChange={(v) => setChunkOverlap(v || 50)}
                  style={{ width: '120px' }}
                />
              </div>
            </>
          )}
          {method === 'semantic' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Text>Threshold</Text>
                <Tooltip title="Similarity threshold for splitting chunks (0.0 - 1.0)">
                  <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                </Tooltip>
              </Space>
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                value={semanticThreshold}
                onChange={(v) => setSemanticThreshold(v || 0.5)}
                style={{ width: '120px' }}
              />
            </div>
          )}
          {method === 'recursive' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text>Chunk Size</Text>
                  <Tooltip title="The maximum number of characters in each chunk">
                    <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                </Space>
                <InputNumber
                  min={1}
                  value={chunkSize}
                  onChange={(v) => setChunkSize(v || 500)}
                  style={{ width: '120px' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text>Overlap</Text>
                  <Tooltip title="The number of characters to overlap between chunks">
                    <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                </Space>
                <InputNumber
                  min={0}
                  value={chunkOverlap}
                  onChange={(v) => setChunkOverlap(v || 50)}
                  style={{ width: '120px' }}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text>Separators</Text>
                    <Tooltip title="Characters to split on (comma separated, e.g. \n\n,\n,., )">
                      <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                    </Tooltip>
                  </Space>
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Select or type separators"
                    value={separators ? separators.split(',') : []}
                    onChange={(values) => setSeparators(values.join(','))}
                    options={[
                      { value: '\\n\\n', label: 'Double Newline (\\n\\n)' },
                      { value: '\\n', label: 'Newline (\\n)' },
                      { value: '.', label: 'Period (.)' },
                      { value: ' ', label: 'Space ( )' },
                      { value: '', label: 'Empty String' },
                    ]}
                  />
                </Space>
              </div>
            </>
          )}
        </Space>
      </div>

      <Divider plain>Enhancement</Divider>
      <div style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <ScissorOutlined />
              <Text>Clean Text</Text>
            </Space>
            <Switch checked={cleanText} onChange={setCleanText} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <ThunderboltOutlined />
              <Text>Summary</Text>
            </Space>
            <Switch checked={generateSummary} onChange={setGenerateSummary} />
          </div>
        </Space>
      </div>

      <Button 
        type="primary" 
        block 
        size="large" 
        icon={<RocketOutlined />} 
        onClick={handleProcess}
        loading={loading}
        style={{ marginTop: 16 }}
      >
        Run Processor
      </Button>
    </Card>
  );
};

export default ConfigurationPanel;