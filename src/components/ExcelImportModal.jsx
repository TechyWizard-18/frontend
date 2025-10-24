// ===== NEW FEATURE: Excel Import Modal for Customers =====
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: 'white'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer'
    },
    fileInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '5px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        background: 'rgba(0, 0, 0, 0.2)',
        color: 'white'
    },
    button: {
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: '10px'
    },
    uploadButton: {
        backgroundColor: '#28a745',
        color: 'white'
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white'
    },
    infoBox: {
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9em'
    },
    resultBox: {
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '15px',
        maxHeight: '200px',
        overflowY: 'auto'
    }
};

const ExcelImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);

    // ===== NEW: Don't render if not open =====
    if (!isOpen) return null;
    // ===== END NEW =====

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResults(null);
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setImporting(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Transform Excel data to match our API format
            const customers = jsonData.map(row => ({
                name: row.name || row.Name || row.NAME,
                phone: String(row.phone || row.Phone || row.PHONE || ''),
                address: row.address || row.Address || row.ADDRESS || '',
                poValue: row.poValue || row['PO Value'] || row['po_value'] || 0,
                poType: row.poType || row['PO Type'] || row['po_type'] || '',
                poDescription: row.poDescription || row['PO Description'] || row['po_description'] || '',
                status: row.status || row.Status || row.STATUS || 'Pending'
            }));

            // Send to backend
            const response = await axios.post('/api/customers/bulk-import', { customers });

            setResults(response.data);
            toast.success(`Import completed! ${response.data.successCount} customers added successfully.`);

            if (response.data.failedCount > 0) {
                toast.warning(`${response.data.failedCount} entries failed. Check details below.`);
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Failed to import data. Please check the file format.');
        } finally {
            setImporting(false);
        }
    };

    const downloadSampleFile = () => {
        // Create sample data
        const sampleData = [
            {
                name: 'John Doe',
                phone: '1234567890',
                address: '123 Main St, Dubai',
                poValue: 5000,
                poType: 'Product A',
                poDescription: 'Sample PO description',
                status: 'Pending'
            },
            {
                name: 'Jane Smith',
                phone: '9876543210',
                address: '456 Business Ave, Abu Dhabi',
                poValue: 7500,
                poType: 'Product B',
                poDescription: 'Another sample PO',
                status: 'Pending'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
        XLSX.writeFile(workbook, 'customer_import_template.xlsx');
        toast.success('Sample template downloaded!');
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2>📥 Import Customers from Excel</h2>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div style={styles.infoBox}>
                    <h4>📋 Required Excel Columns:</h4>
                    <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                        <li><strong>name</strong> - Customer name (required)</li>
                        <li><strong>phone</strong> - Phone number (required, 10-15 digits)</li>
                        <li><strong>address</strong> - Customer address (optional)</li>
                        <li><strong>poValue</strong> - PO value in AED (optional)</li>
                        <li><strong>poType</strong> - Type of PO (optional)</li>
                        <li><strong>poDescription</strong> - PO description (optional)</li>
                        <li><strong>status</strong> - Pending or Dispatched (optional, default: Pending)</li>
                    </ul>
                    <p style={{ marginTop: '10px', fontSize: '0.85em', fontStyle: 'italic' }}>
                        💡 Column names are case-insensitive. You can also use spaces or underscores.
                    </p>
                    <button
                        onClick={downloadSampleFile}
                        style={{...styles.button, ...styles.uploadButton, marginTop: '10px'}}
                    >
                        📥 Download Sample Template
                    </button>
                </div>

                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                />

                <div>
                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        style={{
                            ...styles.button,
                            ...styles.uploadButton,
                            opacity: (!file || importing) ? 0.5 : 1
                        }}
                    >
                        {importing ? '⏳ Importing...' : '📤 Upload & Import'}
                    </button>
                    <button
                        onClick={onClose}
                        style={{...styles.button, ...styles.cancelButton}}
                    >
                        ✖ Cancel
                    </button>
                </div>

                {results && (
                    <div style={styles.resultBox}>
                        <h4>Import Results:</h4>
                        <p>✅ Success: {results.successCount} customers</p>
                        <p>❌ Failed: {results.failedCount} entries</p>
                        {results.failed && results.failed.length > 0 && (
                            <div>
                                <h5>Failed Entries:</h5>
                                {results.failed.map((fail, index) => (
                                    <p key={index} style={{ fontSize: '0.85em', color: '#ff6b6b' }}>
                                        {fail.data.name || 'Unknown'}: {fail.error}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExcelImportModal;
// ===== END NEW FEATURE =====
