import React from 'react';
import styles from './style.module.css';

const ResumeAnalyseLoader = () => {
  return (
    <div className={styles.loader}>
      <svg
        className={styles.container}
        width="100"
        height="100"
        viewBox="0 0 64 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="60"
          height="36"
          rx="4"
          ry="4"
          pathLength="100"
          className={styles.track}
        ></rect>
        <rect
          x="2"
          y="2"
          width="60"
          height="36"
          rx="4"
          ry="4"
          pathLength="100"
          className={styles.car}
        ></rect>

        <g className={styles.lines} strokeLinecap="round">
          <line x1="10" y1="12" x2="30" y2="12"></line>
          <line className={styles.indent} x1="14" y1="19" x2="28" y2="19"></line>
          <line x1="10" y1="26" x2="34" y2="26"></line>
          <line className={styles.indent} x1="14" y1="33" x2="24" y2="33"></line>
        </g>
      </svg>
    </div>
  );
};

export default ResumeAnalyseLoader;