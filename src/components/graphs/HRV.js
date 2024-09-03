import React from 'react';
import { HRVGraph } from './hrv/HrvStatus';

const HRV = ({
    hrvData,
}) => {
    return (
    <div className='w-full flex'>
            <div className='w-full flex flex-col'>
                {(hrvData) && (hrvData.length > 0) && <HRVGraph hrvData={hrvData} />}
            </div>
        </div>
    )
}

export default HRV;