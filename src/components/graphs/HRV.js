import React from 'react';
import { HRVGraph } from './hrv/HrvStatus';

const HRV = ({
    hrvData,
}) => {
    console.log('hrvData', hrvData);
    return (
    <div className='w-full flex'>
            <div className='w-full flex flex-col'>
                <HRVGraph hrvData={hrvData} />
            </div>
        </div>
    )
}

export default HRV;