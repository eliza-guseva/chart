import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Wellness from './graphs/Wellness';
import Performance from './graphs/Performance';
import Activities from './graphs/Activities';
import HRV from './graphs/HRV';
import { 
    parseFiles, 
    processSleepData, 
    processActivitiesData,
    processHRVFromTrainingReadiness,
} from './graphs/fileAndDataProcessors';
import { set } from 'date-fns';






const TabsEnum = Object.freeze({
    WELLNESS: 'wellness',
    PERFORMANCE: 'performance',
    HRV: 'hrv',
    ACTIVITIES: 'activities',
  });


const Tabs = ({selectedTab, setSelectedTab}) => {
    const getGliderStyle = () => {
        let leftPosition = 0;
        let backgroundImage = 'linear-gradient(90deg, #0282b744 70%, #00415c 100%), linear-gradient(90deg, #00415c 0%, #0282b7 80%)';
        
        switch (selectedTab) {
            case TabsEnum.PERFORMANCE:
                leftPosition = '25%';
                backgroundImage = 'linear-gradient(90deg, #f18b2f44 70%, #a65707 100%), linear-gradient(90deg, #a25403 0%, #f18b2f 80%)';
                break;
            case TabsEnum.HRV:
                leftPosition = '50%';
                backgroundImage = 'linear-gradient(90deg, #6da36c44 70%, #0a6131 100%), linear-gradient(90deg, #0a6131 0%, #6da36c 80%)';
                break;
            case TabsEnum.ACTIVITIES:
                leftPosition = '75%';
                backgroundImage = 'linear-gradient(90deg, #d4003344 70%, #710015 100%), linear-gradient(90deg, #710015 0%, #d40033 80%)';
                break;
            case TabsEnum.WELLNESS:
            default:
                leftPosition = 0;
                break;
        }

        return {
            width: '25%',
            height: '4px', 
            backgroundImage: `${backgroundImage}`,
            left: `${leftPosition}`,
            transition: 'left 0.35s ease',
            position: 'absolute',
            bottom: 0,
        };
    };


    return (
        <div className='flex flex-col mb-8 relative'>
            <div className='tabs'>
            <button className='atab' onClick={() => setSelectedTab(TabsEnum.WELLNESS)}>Wellness</button>
            <button className='atab' onClick={() => setSelectedTab(TabsEnum.PERFORMANCE)}>Performance</button>
            <button className='atab' onClick={() => setSelectedTab(TabsEnum.HRV)}>HRV</button>
            <button className='atab' onClick={() => setSelectedTab(TabsEnum.ACTIVITIES)}>Activities</button>
            </div>
            <div style={getGliderStyle()}></div>
        </div>
    );
}




const TheGraphs = ({selectFiles}) => {
    console.log('selectFiles', selectFiles);
    const [sleepData, setSleepData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [activitiesData, setActivitiesData] = useState(null);
    const [hrvData, setHrvData] = useState(null);
    const [selectedTab, setSelectedTab] = useState(TabsEnum.WELLNESS);
    console.log('performanceData', performanceData);

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

    useEffect(() => {
        const processData = async () => {
            const data = await parseFiles(selectFiles, 'hrv');
            const processedData = processHRVFromTrainingReadiness(data);
            setHrvData(processedData);
        };

        processData();
    }
    , [selectFiles]);


    return (
        <div className='w-full'>
            <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            {selectedTab === TabsEnum.WELLNESS && <Wellness sleepData={sleepData} />}
            {selectedTab === TabsEnum.PERFORMANCE && <Performance performanceData={performanceData} />}
            {selectedTab === TabsEnum.HRV && <HRV hrvData={hrvData} />}
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
