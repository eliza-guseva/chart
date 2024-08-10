import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Wellness from './graphs/Wellness';
import Performance from './graphs/Performance';
import Activities from './graphs/Activities';
import { 
    parseFiles, 
    processSleepData, 
    processActivitiesData 
} from './graphs/fileAndDataProcessors';






const TabsEnum = Object.freeze({
    WELLNESS: 'wellness',
    PERFORMANCE: 'performance',
    HRV: 'hrv',
    ACTIVITIES: 'activities',
  });


const Tabs = ({setSelectedTab}) => {

    return (
        <div className='w-full grid grid-cols-2 md:grid-cols-4 mb-4'>
            <button className='btnboring' onClick={() => setSelectedTab(TabsEnum.WELLNESS)}>Wellness</button>
            <button className='btn' onClick={() => setSelectedTab(TabsEnum.PERFORMANCE)}>Performance</button>
            <button className='btn' onClick={() => setSelectedTab(TabsEnum.HRV)}>HRV</button>
            <button className='btnboring' onClick={() => setSelectedTab(TabsEnum.ACTIVITIES)}>Activities</button>
        </div>
    );
}




const TheGraphs = ({selectFiles}) => {
    const [sleepData, setSleepData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [activitiesData, setActivitiesData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(TabsEnum.WELLNESS);

    useEffect(() => {
        const processData = async () => {
            const data = await parseFiles(selectFiles, 'sleep');
            const processedData = processSleepData(data);
            setSleepData(processedData);
        };

        processData();
        }, [selectFiles]);

    useEffect(() => {
        const processData = async () => {
            const data = await parseFiles(selectFiles, 'activities');
            const processedData = processActivitiesData(data);
            setActivitiesData(processedData);
        };

        processData();
    }, [selectFiles]);

    useEffect(() => {
        const processData = async () => {
            let data = {};
            for (let key in selectFiles['performance']) {
                let this_data = await parseFiles(selectFiles['performance'], key);
                data[key] = this_data;
            }
            setPerformanceData(data);
        };

        processData();
    }, [selectFiles]);


    return (
        <div className='w-full'>
            <Tabs setSelectedTab={setSelectedTab} />
            {selectedTab === TabsEnum.WELLNESS && <Wellness sleepData={sleepData} />}
            {selectedTab === TabsEnum.PERFORMANCE && <Performance performanceData={performanceData} />}
            {selectedTab === TabsEnum.HRV && <div>HRV</div>}
            {selectedTab === TabsEnum.ACTIVITIES && <Activities activitiesData={activitiesData} />}
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
