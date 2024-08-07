import React from 'react';
import EnduranceGraph from './performanceGraphs/EnduranceGraph';
import TrainingLoadTime from './performanceGraphs/TrainingLoadTime';
import { 
    processEnduranceData,
    processTrainingLoadData,
 } from './fileAndDataProcessors';

const Performance = ({performanceData}) => {
    const endurance_data = processEnduranceData(performanceData['endurance']);
    const training_load_data = processTrainingLoadData(performanceData['trainingLoad']);
    console.log('performanceData', performanceData);
    return (
        <div>
            <EnduranceGraph enduranceData={endurance_data} />
            <TrainingLoadTime trainingLoadData={training_load_data} />
        </div>
    );
}

export default Performance;