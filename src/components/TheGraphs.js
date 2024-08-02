import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SleepStagesStack from './graphs/sleepGraphs/sleepStagesStack';
import { parseFiles, processSleepData } from './graphs/fileAndDataProcessors';


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
            <h1>The Graphs</h1>
            {sleepData && <SleepStagesStack sleepData={sleepData} />}
        </div>
    );
};


TheGraphs.propTypes = {
    selectFiles: PropTypes.object.isRequired,
};

export default TheGraphs;
