import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

const DialogContext = createContext();

const DialogModal = ({ dialog, onClose }) => {
  if (!dialog) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <div className="dialog-header">
          <h3>{dialog.title || '알림'}</h3>
        </div>
        <div className="dialog-content">
          <p>{dialog.message}</p>
        </div>
        <div className="dialog-actions">
          {dialog.type === 'confirm' ? (
            <>
              <button className="dialog-button dialog-button-secondary" onClick={() => onClose(false)}>
                취소
              </button>
              <button className="dialog-button dialog-button-primary" onClick={() => onClose(true)}>
                확인
              </button>
            </>
          ) : (
            <button className="dialog-button dialog-button-primary" onClick={() => onClose(true)}>
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const closeDialog = useCallback((value) => {
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
    setDialog(null);
  }, []);

  const alert = useCallback((message, title = '알림') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ type: 'alert', title, message });
    });
  }, []);

  const confirm = useCallback((message, title = '확인') => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ type: 'confirm', title, message });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <DialogModal dialog={dialog} onClose={closeDialog} />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
