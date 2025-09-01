import React from 'react';
import styles from '@popup/components/settings/styles.module.css';
import licenseStyles from './styles.module.css';

const OPEN_SOURCE_LIBS = [
  {
    name: 'get-artist-title',
    author: 'James Kyburz',
    license: 'MIT',
    link: 'https://github.com/goto-bus-stop/get-artist-title/blob/HEAD/LICENSE',
  },
  {
    name: '@daun_jung/korean-romanizer',
    author: 'Daun Jung',
    license: 'MIT',
    link: 'https://github.com/daunJung-dev/korean-romanizer/blob/master/LICENSE',
  },
  {
    name: 'Kuroshiro',
    author: 'Hexen Qi',
    license: 'MIT',
    link: 'https://github.com/hexenq/kuroshiro/blob/master/LICENSE',
  },
  {
    name: 'kuroshiro-analyzer-kuromoji',
    author: 'Hexen Qi',
    license: 'MIT',
    link: 'https://github.com/hexenq/kuroshiro-analyzer-kuromoji/blob/master/LICENSE',
  },
  {
    name: 'pinyin',
    author: 'hotoo',
    license: 'MIT',
    link: 'https://hotoo.mit-license.org/',
  },
  {
    name: 'p-limit',
    author: 'sindresorhus',
    license: 'MIT',
    link: 'https://github.com/sindresorhus/p-limit/blob/main/license',
  },
  {
    name: '@emotion/react',
    author: 'EMOTION TEAM',
    license: 'MIT',
    link: 'https://github.com/emotion-js/emotion/blob/main/LICENSE',
  },
  {
    name: '@emotion/styled',
    author: 'EMOTION TEAM',
    license: 'MIT',
    link: 'https://github.com/emotion-js/emotion/blob/main/LICENSE',
  },
  {
    name: '@mui/material',
    author: 'MUI TEAM',
    license: 'MIT',
    link: 'https://github.com/mui/material-ui/blob/master/LICENSE',
  },
  {
    name: 'react-icons',
    author: 'kamijin_fanta',
    license: 'MIT',
    link: 'https://github.com/react-icons/react-icons/blob/master/LICENSE',
  },
  {
    name: 'react-bits',
    author: 'David Haz',
    license: 'MIT + Commons Clause',
    link: 'https://github.com/davidhdev/react-bits/blob/main/LICENSE.md)',
  },
  {
    name: 'motion',
    author: 'Motion B.V',
    license: 'MIT',
    link: 'https://github.com/motiondivision/motion/blob/main/LICENSE.md',
  },
  {
    name: 'matter-js',
    author: 'Liam Brummitt and contributors',
    license: 'MIT',
    link: 'https://github.com/liabru/matter-js/blob/master/LICENSE',
  },
  {
    name: 'axios',
    author: 'Matt Zabriskie & Collaborators',
    license: 'MIT',
    link: 'https://github.com/axios/axios/blob/v1.x/LICENSE',
  },
  // 필요시 README.md와 package.json 기반 라이브러리 추가
];

export const OpenSourceLicenseList: React.FC = () => {
  return (
    <div className={styles.menuSection}>
      <h4>Open Source Libraries</h4>
      <ul className={licenseStyles.libraryList}>
        {OPEN_SOURCE_LIBS.map((lib, idx) => (
          <li key={idx} className={licenseStyles.libraryItem}>
            <div>
              <strong>{lib.name}</strong> <span style={{ color: '#888' }}>({lib.license} License)</span>
            </div>
            <div style={{ fontSize: '0.93em' }}>
              Author: {lib.author} <br />
              <a href={lib.link} target="_blank" rel="noopener noreferrer">
                License / Project Link
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
