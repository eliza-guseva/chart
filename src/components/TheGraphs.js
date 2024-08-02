import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Wellness from './graphs/Wellness';
import Performance from './graphs/Performance';
import { parseFiles, processSleepData } from './graphs/fileAndDataProcessors';


const TabsEnum = Object.freeze({
    WELLNESS: 'wellness',
    PERFORMANCE: 'performance',
    HRV: 'hrv',
    ACTIVITIES: 'activities',
  });


const Tabs = ({setSelectedTab}) => {

    return (
        <div className='w-full grid grid-cols-2 md:grid-cols-4 mb-4'>
            <button onClick={() => setSelectedTab(TabsEnum.WELLNESS)}>Wellness</button>
            <button onClick={() => setSelectedTab(TabsEnum.PERFORMANCE)}>Performance</button>
            <button onClick={() => setSelectedTab(TabsEnum.HRV)}>HRV</button>
            <button onClick={() => setSelectedTab(TabsEnum.ACTIVITIES)}>Activities</button>
        </div>
    );
}


const TheGraphs = ({selectFiles}) => {
    const [sleepData, setSleepData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(TabsEnum.WELLNESS);

    useEffect(() => {
        const processData = async () => {
            const data = await parseFiles(selectFiles, 'sleep');
            const processedData = processSleepData(data);
            setSleepData(processedData);
        };

            processData();
        }, [selectFiles]);
    return (
        <div className='w-full'>
            <Tabs setSelectedTab={setSelectedTab} />
            {/* conditionally render according to selectedTab */}
            {selectedTab === TabsEnum.WELLNESS && <Wellness sleepData={sleepData} />}
            {selectedTab === TabsEnum.PERFORMANCE && <Performance />}
        </div>
    );
};


TheGraphs.propTypes = {
    selectFiles: PropTypes.object.isRequired,
};


Tabs.propTypes = {
    setSelectedTab: PropTypes.func.isRequired,
};


export default TheGraphs;
