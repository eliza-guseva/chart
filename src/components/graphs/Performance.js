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
    return (
        <div>
            {(endurance_data) && (endurance_data.length > 0) && <EnduranceGraph enduranceData={endurance_data} />}
            {(training_load_data) && (training_load_data.length > 0) && <TrainingLoadTime trainingLoadData={training_load_data} />}
        </div>
    );
}

export default Performance;