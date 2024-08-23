import React from 'react';
import PropTypes from 'prop-types';
import SleepStagesStack from './sleepGraphs/sleepStagesStack';
import SleepScores from './sleepGraphs/SleepScores';


const Wellness = ({sleepData}) => {
    return (
        <div className='graphdiv'>
            {(sleepData) && (sleepData.length > 0) && <SleepStagesStack sleepData={sleepData} />}
            {(sleepData) && (sleepData.length > 0) && <SleepScores sleepData={sleepData} />}
        </div>
    );
};

Wellness.propTypes = {
    sleepData: PropTypes.object,
};

export default Wellness;