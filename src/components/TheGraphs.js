import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SleepStagesStack from './graphs/sleepGraphs/sleepStagesStack';
import { parseFiles, processSleepData } from './graphs/fileAndDataProcessors';


const TabsEnum = Object.freeze({
    WELLNESS: 'wellness',
    PERFORMANCE: 'performance',
    HRV: 'hrv',
    ACTIVITIES: 'activities',
  });


const Tabs = () => {
    const [selectedTab, setSelectedTab] = useState(TabsEnum.WELLNESS);

    return (
        <div>
            <button onClick={() => setSelectedTab(TabsEnum.WELLNESS)}>Wellness</button>
            <button onClick={() => setSelectedTab(TabsEnum.PERFORMANCE)}>Performance</button>
            <button onClick={() => setSelectedTab(TabsEnum.HRV)}>HRV</button>
            <button onClick={() => setSelectedTab(TabsEnum.ACTIVITIES)}>Activities</button>
        </div>
    );
}


const TheGraphs = ({selectFiles}) => {
    const [sleepData, setSleepData] = useState(null);

    useEffect(() => {
        // Process sleep data asynchronously
            const processData = async () => {
                const data = await parseFiles(selectFiles, 'sleep');
                const processedData = processSleepData(data);
                setSleepData(processedData);
            };

            processData();
        }, [selectFiles]);
    return (
        <div>
            <Tabs />
            {sleepData && <SleepStagesStack sleepData={sleepData} />}
        </div>
    );
};


TheGraphs.propTypes = {
    selectFiles: PropTypes.object.isRequired,
};

export default TheGraphs;
