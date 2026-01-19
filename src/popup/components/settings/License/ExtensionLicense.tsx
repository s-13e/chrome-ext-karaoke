import React from 'react';
import styles from './styles.module.css';

interface ExtensionLicenseProps {
  isDarkMode: boolean;
}

export const ExtensionLicense: React.FC<ExtensionLicenseProps> = ({ isDarkMode }) => {
  const manifest = chrome.runtime.getManifest();

  return (
    <div className={`${styles.extensionLicenseWrapper} ${isDarkMode ? styles.dark : styles.light}`}>
      <div style={{ color: isDarkMode ? '#ffffff' : '#000000', padding: '18px 15px' }}>
        <h2 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0px', marginBottom: '16px' }}>
          Extension License
        </h2>

        <div
          style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0' }}>YouTube Karaoke Extension</h3>
          <p style={{ color: isDarkMode ? '#cccccc' : '#666666', margin: '8px 0' }}>Version: {manifest.version}</p>
          <p style={{ color: isDarkMode ? '#cccccc' : '#666666', margin: '8px 0' }}>
            Repository:{' '}
            <a
              href="https://github.com/s-13e/chrome-ext-karaoke"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: isDarkMode ? '#4a9eff' : '#0066cc' }}
            >
              github.com/s-13e/chrome-ext-karaoke
            </a>
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>MIT License</h3>
          <pre
            style={{
              backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9',
              color: isDarkMode ? '#cccccc' : '#333333',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              lineHeight: '1.6',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              border: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
            }}
          >
            {`MIT License

Copyright (c) ${new Date().getFullYear()} YouTube Karaoke Extension

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
        </div>
      </div>
    </div>
  );
};
