import React, { useState } from 'react';
import {
  Layout,
  Typography,
  message,
  ConfigProvider,
  theme,
  Select,
  Space
} from 'antd';
import { RocketOutlined, GlobalOutlined } from '@ant-design/icons';
import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useTranslation } from 'react-i18next';
import type { ProcessRequest, ProcessResponse, Chunk } from './types';
import ConfigurationPanel from './components/ConfigurationPanel';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [processedChunksCount, setProcessedChunksCount] = useState(0);
  
  // State for inputs
  const [text, setText] = useState('');
  const [method, setMethod] = useState<'fixed_size' | 'semantic' | 'recursive'>('fixed_size');
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [semanticThreshold, setSemanticThreshold] = useState(0.5);
  const [separators, setSeparators] = useState<string[]>(['\\n\\n', '\\n', ' ', '']);
  const [cleanText, setCleanText] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) {
      message.warning(t('app.warnings.inputRequired'));
      return;
    }

    setLoading(true);
    setChunks([]);
    setTotalChunks(0);
    setProcessedChunksCount(0);

    const request: ProcessRequest = {
      text: text,
      chunking_options: {
        method: method,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        semantic_threshold: semanticThreshold,
        separators: separators.map(s => s.replace(/\\n/g, '\n')),
      },
      processing_options: {
        clean_text: cleanText,
        generate_summary: generateSummary,
      },
    };

    const ctrl = new AbortController();
    let finalTotalChunks = 0;

    try {
      await fetchEventSource('/api/v1/process/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: ctrl.signal,
        onmessage(msg) {
          if (msg.data === '[DONE]') {
            ctrl.abort();
            return;
          }
          try {
            const data = JSON.parse(msg.data);
            if (data.type === 'progress') {
              setTotalChunks(data.total_chunks);
              setProcessedChunksCount(data.processed_chunks);
              finalTotalChunks = data.total_chunks;
            } else if (data.type === 'chunk') {
              setChunks(prev => [...prev, data.chunk]);
              setProcessedChunksCount(data.processed_chunks);
              setTotalChunks(data.total_chunks);
              finalTotalChunks = data.total_chunks;
            } else if (data.error) {
              throw new Error(data.error);
            }
          } catch (e) {
            console.error('Error parsing stream message:', e);
          }
        },
        onerror(err) {
          console.error('Stream error:', err);
          message.error(t('app.errors.processFailed'));
          throw err; // rethrow to stop retrying
        },
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        message.success(t('app.success.processed', { count: finalTotalChunks }));
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Header */}
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#001529', 
          padding: '0 24px',
          height: '64px',
          position: 'fixed',
          width: '100%',
          zIndex: 100,
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RocketOutlined style={{ fontSize: '24px', color: '#1677ff', marginRight: '12px' }} />
            <Title level={4} style={{ color: 'white', margin: 0 }}>{t('app.title')}</Title>
          </div>
          <Space>
            <GlobalOutlined style={{ color: 'white' }} />
            <Select
              defaultValue={i18n.language}
              style={{ width: 100 }}
              onChange={(value) => i18n.changeLanguage(value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'zh', label: '中文' },
              ]}
            />
          </Space>
        </Header>

        <Layout style={{ marginTop: 64 }}>
          {/* Fixed Sidebar */}
          <Sider 
            width={320} 
            theme="light" 
            style={{ 
              overflowY: 'auto', 
              height: 'calc(100vh - 64px)', 
              position: 'fixed', 
              left: 0,
              top: 64,
              bottom: 0,
              zIndex: 99,
              borderRight: '1px solid #f0f0f0'
            }}
          >
            <ConfigurationPanel 
              method={method}
              setMethod={setMethod}
              chunkSize={chunkSize}
              setChunkSize={setChunkSize}
              chunkOverlap={chunkOverlap}
              setChunkOverlap={setChunkOverlap}
              semanticThreshold={semanticThreshold}
              setSemanticThreshold={setSemanticThreshold}
              separators={separators}
              setSeparators={setSeparators}
              cleanText={cleanText}
              setCleanText={setCleanText}
              generateSummary={generateSummary}
              setGenerateSummary={setGenerateSummary}
              handleProcess={handleProcess}
              loading={loading}
            />
          </Sider>

          {/* Main Content Area */}
          <Layout style={{ marginLeft: 320, padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <Content style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: 'calc(100vh - 112px)' }}>
                
                {/* Left Column: Input */}
                <InputSection text={text} setText={setText} />

                {/* Right Column: Output */}
                <OutputSection
                  loading={loading}
                  chunks={chunks}
                  totalChunks={totalChunks}
                  processedCount={processedChunksCount}
                />

              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
