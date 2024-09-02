import { createContext, useState } from 'react';

// set up login context
const RunSecondaryMetricContext = createContext(null);

const RunSecondaryMetricProvider = ({ children }) => {
    const [secondaryMetric, setSecondaryMetric] = useState('pace');

    // Function to set secondary metric
    const setSecondaryMetricValue = (value) => {
        setSecondaryMetric(value);
    };

    // The value that will be passed to the context consumers
    const value = { secondaryMetric, setSecondaryMetricValue };

    return (
        <RunSecondaryMetricContext.Provider value={value}>
            {children}
        </RunSecondaryMetricContext.Provider>
    );
}