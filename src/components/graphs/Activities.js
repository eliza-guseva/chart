import React from 'react';
import PropTypes from 'prop-types';
import RunPaceTime from './activities/RunPaceTime';
import SecondaryRunMetrics from './activities/SecondaryRunMetrics';
import RunSums from './activities/runSums';
import { isData } from './graphHelpers';


/**
 * Renders the Activities component.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.activitiesData - The data for different activities.
 * @param {Array} props.activitiesData.running - The data for running activities.
 * @param {Array} props.activitiesData.cycling - The data for cycling activities.
 * @param {Array} props.activitiesData.swimming - The data for swimming activities.
 * @returns {JSX.Element} The rendered Activities component.
 */
const Activities = ({activitiesData}) => {
    return (
        <div className='w-full flex'>
            <div className='w-full flex flex-col'>
            {isData(activitiesData.running) && 
            <>
            <RunPaceTime runningData={activitiesData.running} />
            <SecondaryRunMetrics runningData={activitiesData.running} />
            <RunSums runningData={activitiesData.running} />
            </>
            }
            </div>
        </div>
    );
}

Activities.propTypes = {
    activitiesData: PropTypes.shape({
        running: PropTypes.array,
        cycling: PropTypes.array,
        swimming: PropTypes.array,
    }),
};

export default Activities;
