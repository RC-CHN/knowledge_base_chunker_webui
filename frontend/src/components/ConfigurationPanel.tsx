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
import { useTranslation } from 'react-i18next';

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
  separators: string[];
  setSeparators: (value: string[]) => void;
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
  const { t } = useTranslation();

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>{t('config.title')}</span>
        </Space>
      }
      bordered={false}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t('config.strategy.label')}</Text>
        <Select
          value={method}
          onChange={setMethod}
          style={{ width: '100%' }}
          options={[
            { value: 'fixed_size', label: t('config.strategy.options.fixed_size') },
            { value: 'semantic', label: t('config.strategy.options.semantic') },
            { value: 'recursive', label: t('config.strategy.options.recursive') },
          ]}
        />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {method === 'fixed_size' && t('config.strategy.description.fixed_size')}
            {method === 'semantic' && t('config.strategy.description.semantic')}
            {method === 'recursive' && t('config.strategy.description.recursive')}
          </Text>
        </div>
      </div>

      <Divider plain>{t('config.chunkingParams')}</Divider>
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {method !== 'semantic' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text>{t('config.chunkSize.label')}</Text>
                  <Tooltip title={t('config.chunkSize.tooltip')}>
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
                  <Text>{t('config.overlap.label')}</Text>
                  <Tooltip title={t('config.overlap.tooltip')}>
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
                <Text>{t('config.threshold.label')}</Text>
                <Tooltip title={t('config.threshold.tooltip')}>
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
                  <Text>{t('config.chunkSize.label')}</Text>
                  <Tooltip title={t('config.chunkSize.tooltip')}>
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
                  <Text>{t('config.overlap.label')}</Text>
                  <Tooltip title={t('config.overlap.tooltip')}>
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
                    <Text>{t('config.separators.label')}</Text>
                    <Tooltip title={t('config.separators.tooltip')}>
                      <QuestionCircleOutlined style={{ color: '#bfbfbf' }} />
                    </Tooltip>
                  </Space>
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{t('config.separators.hint')}</Text>
                  </div>
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder={t('config.separators.placeholder')}
                    value={separators}
                    onChange={(values) => setSeparators(values)}
                    tokenSeparators={[',']}
                    options={[
                      { value: '\\n\\n', label: t('config.separators.options.doubleNewline') },
                      { value: '\\n', label: t('config.separators.options.newline') },
                      { value: '.', label: t('config.separators.options.period') },
                      { value: ' ', label: t('config.separators.options.space') },
                      { value: '', label: t('config.separators.options.empty') },
                    ]}
                  />
                </Space>
              </div>
            </>
          )}
        </Space>
      </div>

      <Divider plain>{t('config.enhancement')}</Divider>
      <div style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <ScissorOutlined />
              <Text>{t('config.cleanText')}</Text>
            </Space>
            <Switch checked={cleanText} onChange={setCleanText} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <ThunderboltOutlined />
              <Text>{t('config.summary')}</Text>
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
        {t('config.runProcessor')}
      </Button>
    </Card>
  );
};

export default ConfigurationPanel;