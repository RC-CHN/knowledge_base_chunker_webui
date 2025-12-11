import React from 'react';
import { Card, Input, Button, Upload, message, Space, Typography } from 'antd';
import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Text } = Typography;

interface InputSectionProps {
  text: string;
  setText: (value: string) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ text, setText }) => {
  const { t } = useTranslation();

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space><FileTextOutlined /> {t('input.title')}</Space>
          <Upload
            beforeUpload={async (file) => {
              const isTextFile = file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');
              
              if (isTextFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target?.result;
                  if (typeof content === 'string') {
                    setText(content);
                    message.success(t('input.success.fileLoaded'));
                  }
                };
                reader.readAsText(file);
              } else {
                // For PDF, DOCX, etc., upload to backend for processing
                const formData = new FormData();
                formData.append('file', file);
                
                const hide = message.loading(t('input.loading'), 0);
                
                try {
                  const response = await fetch('http://localhost:8000/api/v1/process/upload_file', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (!response.ok) {
                    throw new Error('File upload failed');
                  }
                  
                  const data = await response.json();
                  setText(data.content);
                  message.success(t('input.success.fileProcessed'));
                } catch (error) {
                  console.error('Error uploading file:', error);
                  message.error(t('input.errors.processFailed'));
                } finally {
                  hide();
                }
              }
              return false;
            }}
            showUploadList={false}
            accept=".txt,.md,.json,.csv,.pdf,.docx"
          >
            <Button icon={<UploadOutlined />} size="small">{t('input.loadFile')}</Button>
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
        placeholder={t('input.placeholder')}
      />
      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {text.length} {t('input.characters')}
        </Text>
      </div>
    </Card>
  );
};

export default InputSection;