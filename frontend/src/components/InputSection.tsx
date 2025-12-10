import React from 'react';
import { Card, Input, Button, Upload, message, Space, Typography } from 'antd';
import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface InputSectionProps {
  text: string;
  setText: (value: string) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ text, setText }) => {
  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space><FileTextOutlined /> Source Document</Space>
          <Upload 
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                  setText(content);
                  message.success('File loaded successfully');
                }
              };
              reader.readAsText(file);
              return false;
            }}
            showUploadList={false}
            accept=".txt,.md,.json,.csv"
          >
            <Button icon={<UploadOutlined />} size="small">Load File</Button>
          </Upload>
        </div>
      }
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      styles={{ body: { flex: 1, padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      <TextArea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ 
          flex: 1, 
          resize: 'none', 
          border: 'none', 
          padding: '16px', 
          fontSize: '14px',
          borderRadius: 0
        }} 
        placeholder="Paste your text here or load a file..." 
      />
      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {text.length} characters
        </Text>
      </div>
    </Card>
  );
};

export default InputSection;