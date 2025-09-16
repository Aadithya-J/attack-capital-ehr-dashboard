'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Credentials {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

interface CredentialsSectionProps {
  onCredentialsChange: (credentials: Credentials) => void;
}

export default function CredentialsSection({ onCredentialsChange }: CredentialsSectionProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    baseUrl: 'https://stage.ema-api.com/ema-dev',
    firmUrlPrefix: 'firm/entpmsandbox393',
    apiKey: '',
    username: '',
    password: ''
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof Credentials, value: string) => {
    const updated = { ...credentials, [field]: value };
    setCredentials(updated);
    onCredentialsChange(updated);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/patients?_count=1', {
        headers: {
          'X-API-Key': credentials.apiKey,
          'X-Base-URL': credentials.baseUrl,
          'X-Firm-Prefix': credentials.firmUrlPrefix
        }
      });
      
      if (response.ok) {
        setIsConnected(true);
        alert('Connection successful!');
      } else {
        setIsConnected(false);
        alert('Connection failed. Please check your credentials.');
      }
    } catch (error) {
      setIsConnected(false);
      alert('Connection failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="ModMed API Credentials">
        <div className="space-y-4">
          <Input
            label="Base URL"
            value={credentials.baseUrl}
            onChange={(value) => handleInputChange('baseUrl', value)}
            placeholder="https://stage.ema-api.com/ema-dev"
            required
          />
          
          <Input
            label="Firm URL Prefix"
            value={credentials.firmUrlPrefix}
            onChange={(value) => handleInputChange('firmUrlPrefix', value)}
            placeholder="firm/entpmsandbox393"
            required
          />
          
          <Input
            label="API Key"
            type="password"
            value={credentials.apiKey}
            onChange={(value) => handleInputChange('apiKey', value)}
            placeholder="Enter your ModMed API key"
            required
          />
          
          <Input
            label="Username"
            value={credentials.username}
            onChange={(value) => handleInputChange('username', value)}
            placeholder="Enter your username"
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(value) => handleInputChange('password', value)}
            placeholder="Enter your password"
            required
          />
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={testConnection}
              disabled={isLoading || !credentials.apiKey}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {isConnected && (
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Connected
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
