import { createContext, useState } from 'react';

// set up login context
const RunSecondaryMetricContext = createContext(null);

const RunSecondaryMetricProvider = ({ children }) => {
    const [secondaryMetric, setSecondaryMetric] = useState('avgDoubleCadence');

    // The value that will be passed to the context consumers
    const value = { secondaryMetric, setSecondaryMetric };

    return (
        <RunSecondaryMetricContext.Provider value={value}>
            {children}
        </RunSecondaryMetricContext.Provider>
    );
}

export { RunSecondaryMetricProvider, RunSecondaryMetricContext };