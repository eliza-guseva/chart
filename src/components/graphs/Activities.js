import React from 'react';
import RunPaceTime from './activities/RunPaceTime';

const Activities = ({activitiesData}) => {
    return (
        <div>
            <RunPaceTime runningData={activitiesData.running} />
        </div>
    );
}
export default Activities;
