import React from 'react';
import PropTypes from 'prop-types';
import RunPaceTime from './activities/RunPaceTime';
import SecondaryRunMetrics from './activities/SecondaryRunMetrics';
import RunSums from './activities/runSums';


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
            {/* <SideBar sections={['section1', 'section2', 'section3']} /> */}
            <div className='w-full flex flex-col'>
            {(activitiesData.running) &&
            (activitiesData.running.length > 0) && 
            <RunPaceTime runningData={activitiesData.running} />}
            {(activitiesData.running) &&
            (activitiesData.running.length > 0) &&
            <SecondaryRunMetrics runningData={activitiesData.running} />}
            {(activitiesData.running) &&
            (activitiesData.running.length > 0) &&
            <RunSums runningData={activitiesData.running} />}
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
