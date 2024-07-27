import React, { createContext, useState } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const [files, setFiles] = useState(null);

    return (
        <FileContext.Provider value={{ files, setFiles }}>
            {children}
        </FileContext.Provider>
    );
};

export default FileProvider;