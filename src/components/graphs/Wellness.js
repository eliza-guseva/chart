import React from 'react';
import PropTypes from 'prop-types';
import SleepStagesStack from './sleepGraphs/sleepStagesStack';


const Wellness = ({sleepData}) => {
    return (
        <div>
            {sleepData && <SleepStagesStack sleepData={sleepData} />}
        </div>
    );
};

Wellness.propTypes = {
    sleepData: PropTypes.object,
};

export default Wellness;