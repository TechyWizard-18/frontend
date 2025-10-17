// client/src/components/Spinner.js

import React from 'react';

const styles = {
    spinnerOverlay: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' },
    spinner: { width: '60px', height: '60px', border: '5px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s ease-in-out infinite' },
};

const keyframes = `
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

const Spinner = () => {
    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.spinnerOverlay}>
                <div style={styles.spinner}></div>
            </div>
        </>
    );
};

export default Spinner;