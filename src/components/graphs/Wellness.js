import React from 'react';
import PropTypes from 'prop-types';
import SleepStagesStack from './wellness/sleepStagesStack';
import SleepScores from './wellness/SleepScores';
import ActiveMinutes from './wellness/ActiveMinutes';
import { processSleepData, processActiveMinutesData } from './fileAndDataProcessors';


const Wellness = ({wellnessData}) => {
    const sleepData = wellnessData['sleep'];
    const activeMinutesData = wellnessData['activeMinutes'];

    return (
        <div className='graphdiv'>
            {activeMinutesData && <ActiveMinutes activeMinutesData={activeMinutesData} />}
             {(sleepData) && (sleepData.length > 0) && <SleepStagesStack sleepData={sleepData} />}
            {(sleepData) && (sleepData.length > 0) && <SleepScores sleepData={sleepData} />}
        </div>
    );
};

Wellness.propTypes = {
    wellnessData: PropTypes.object,
};

export default Wellness;