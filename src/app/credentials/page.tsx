'use client';

import { saveCredsBrowser, loadCredsBrowser, clearCredsBrowser } from '@/lib/runtimeConfig';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ModMedCreds {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

export default function CredentialsPage() {
  const [creds, setCreds] = useState<ModMedCreds>({
    baseUrl: '',
    firmUrlPrefix: '',
    apiKey: '',
    username: '',
    password: '',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing credentials on mount
  useEffect(() => {
    const loadCreds = () => {
      try {
        const stored = loadCredsBrowser();
        if (stored) {
          setCreds(stored);
        }
      } catch (error) {
        console.error('Failed to load credentials:', error);
      }
    };

    loadCreds();
  }, []);

  const handleSave = () => {
    try {
      saveCredsBrowser(creds);
      alert('Credentials saved successfully!');
    } catch (error) {
      alert('Failed to save credentials');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Network error occurred' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setCreds({
      baseUrl: '',
      firmUrlPrefix: '',
      apiKey: '',
      username: '',
      password: '',
    });
    clearCredsBrowser();
    alert('Credentials cleared');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">ModMed Credentials</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Runtime Credentials">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Configure your ModMed API credentials. These will be stored locally and used for API calls.
                  </p>

                  <Input
                    label="Base URL"
                    value={creds.baseUrl}
                    onChange={(value) => setCreds(prev => ({ ...prev, baseUrl: value }))}
                    placeholder="https://stage.ema-api.com/ema-dev/firm"
                  />

                  <Input
                    label="Firm URL Prefix"
                    value={creds.firmUrlPrefix}
                    onChange={(value) => setCreds(prev => ({ ...prev, firmUrlPrefix: value }))}
                    placeholder="entpmsandbox393"
                  />

                  <Input
                    label="API Key"
                    value={creds.apiKey}
                    onChange={(value) => setCreds(prev => ({ ...prev, apiKey: value }))}
                    placeholder="your-api-key"
                    type="password"
                  />

                  <Input
                    label="Username"
                    value={creds.username}
                    onChange={(value) => setCreds(prev => ({ ...prev, username: value }))}
                    placeholder="fhir_pmOYS"
                  />

                  <Input
                    label="Password"
                    value={creds.password}
                    onChange={(value) => setCreds(prev => ({ ...prev, password: value }))}
                    placeholder="your-password"
                    type="password"
                  />

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>Save Credentials</Button>
                    <Button onClick={handleTest} disabled={isTesting} variant="secondary">
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button onClick={handleClear} variant="danger">Clear</Button>
                  </div>
                </div>
              </Card>
            </div>

            {testResult && (
              <Card title="Connection Test Result" className="mt-6">
                <div className={`p-4 rounded ${
                  testResult.success
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <p className="font-medium">{testResult.success ? '✓ Success' : '✗ Failed'}</p>
                  <p className="mt-1">{testResult.message}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
