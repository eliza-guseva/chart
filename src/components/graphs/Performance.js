import React from 'react';
import EnduranceGraph from './performanceGraphs/EnduranceGraph';

const Performance = ({performanceData}) => {
    return (
        <div>
            Performance
            <EnduranceGraph enduranceData={performanceData} />
        </div>
    );
}

export default Performance;