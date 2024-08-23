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
import { he } from 'date-fns/locale';
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
        let backgroundImage = 'linear-gradient(90deg, #ffffff44 70%, #44aaff 100%), linear-gradient(90deg, #44aaff 0%, #ffffff 80%)';
        
        switch (selectedTab) {
            case TabsEnum.PERFORMANCE:
                leftPosition = '25%';
                backgroundImage = 'linear-gradient(90deg, #ffffff44 70%, #ffa64d 100%), linear-gradient(90deg, #ffa64d 0%, #ffffff 80%)';
                break;
            case TabsEnum.HRV:
                leftPosition = '50%';
                backgroundImage = 'linear-gradient(90deg, #ffffff44 70%, #16c03f 100%), linear-gradient(90deg, #16c03f 0%, #ffffff 80%)';
                break;
            case TabsEnum.ACTIVITIES:
                leftPosition = '75%';
                backgroundImage = 'linear-gradient(90deg, #ffffff44 70%, #f93a67 100%), linear-gradient(90deg, #f93a67 0%, #ffffff 80%)';
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


    return (
        <div className='w-full'>
            <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
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
