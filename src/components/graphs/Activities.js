import React from 'react';
import RunPaceTime from './activities/RunPaceTime';
import SideBar from '../SideBar';

const Activities = ({activitiesData}) => {
    return (
        <div className='w-full flex'>
            <SideBar sections={['section1', 'section2', 'section3']} />
            <div className='w-full flex flex-col'>
            <RunPaceTime runningData={activitiesData.running} />
            </div>
        </div>
    );
}
export default Activities;
