import React, { useState, useEffect } from 'react';
import SleepStagesStack from './graphs/wellness/sleepStagesStack';
import SleepScores from './graphs/wellness/SleepScores';
import { HRVGraph } from './graphs/hrv/HrvStatus';

function DivVisible(divObject) {
    return (
        divObject.top < window.innerHeight
        //  && divObject.bottom > 0
         && divObject.top + divObject.height / 10 < window.innerHeight
        );
}

function SlideInFromRight(isXVisible) {
    return {
        transform: isXVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.7s ease-in-out',
        width: '100%',
        height: '100%',
        top: 0,
        right: 0,
    };
}

function SlideInFromLeft(isXVisible) {
    return {
        transform: isXVisible ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.7s ease-in-out',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    };
}

function containerStyle(isXVisible) {
    return {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: isXVisible ? '#00000022' : 'transparent',
        margin: '2rem',
        borderRadius: '0.5rem',
        paddingRight: '1rem',
        width: '70%',
    };
}


const Gallery = () => {
    const [sleepData, setSleepData] = useState(null);
    const [hrvData, setHrvData] = useState(null);
    const [isStagesVisible, setStagesVisible] = useState(true);
    const [isScoresVisible, setScoresVisible] = useState(false);
    const [isHrvVisible, setHrvVisible] = useState(false);

    useEffect(() => {
        fetch('/sample_sleep_data.json')
            .then(response => response.json())
            .then(jsonData => setSleepData(jsonData))
            .catch(error => console.error('Error loading sleep data:', error));
    }, []);

    useEffect(() => {
        fetch('/sample_hrv_data.json')
            .then(response => response.json())
            .then(jsonData => setHrvData(jsonData))
            .catch(error => console.error('Error loading hrv data:', error));
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const stagesSection = document.getElementById('stages-section');
            const scoresSection = document.getElementById('scores-section');
            const hrvSection = document.getElementById('hrv-section');

            if (stagesSection && scoresSection && hrvSection) {
                const stagesRect = stagesSection.getBoundingClientRect();
                const scoresRect = scoresSection.getBoundingClientRect();
                const hrvRect = hrvSection.getBoundingClientRect();

                const stagesVisible = DivVisible(stagesRect);
                const scoresVisible = DivVisible(scoresRect);
                const hrvVisible = DivVisible(hrvRect);
                // Set state directly based on conditions
                setStagesVisible(stagesVisible);
                setScoresVisible(scoresVisible);
                setHrvVisible(hrvVisible);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    // CSS styles defined within the component
    const stagesStyle = SlideInFromRight(isStagesVisible);
    const scoresStyle = SlideInFromLeft(isScoresVisible);
    const hrvStyle = SlideInFromRight(isHrvVisible);

    return (
        <div className='flex flex-col items-center justify-center w-full'>
            <div className="text-center text-xl font-nixie font-extrabold mt-10 mb-10 sm:w-4/5">
                <p>What if it was possible to securily get the data
                that health apps gather about you, but aren't always sharing?</p>
                <p>What could you learn?</p>
                <p>What could you do?</p>
            </div>
            <div className='text-center text-md mb-10 sm:w-4/5'>
                <p>Data below is sample data, based on a Garmin user data.
                    If you are a Garmin user, you can download your data from
                <strong> <a href="https://www.garmin.com/en-US/account/datamanagement/"> Garmin Website </a></strong>
                and see a detailed view of your wellness and performance data
                <strong> <a href="/mydata"> HERE</a></strong>.
                </p>
            </div>
            <div id="stages-section" style={containerStyle(isStagesVisible)}>
                <p className='m-2'>Do you want to know if darknenning your room at night improves your deep sleep?</p>
                <p className='m-2'>You can see the full history of your sleep stages. </p>
                <p className='m-2 text-sm'>Hint: You lower small graph to adjust the time period. </p>
                <div style={stagesStyle}>
                    {sleepData ? (
                        <SleepStagesStack sleepData={sleepData} />
                    ) : (
                        <p>Loading sleep data...</p>
                    )}
                </div>
            </div>
            <div id="scores-section" style={containerStyle(isScoresVisible)}>
                <div style={scoresStyle}>
                    {sleepData ? (
                        <SleepScores sleepData={sleepData} />
                    ) : (
                        <p>Loading sleep data...</p>
                    )}
                </div>
            </div>
            <div id="hrv-section" style={containerStyle(isHrvVisible)}>
                <div style={hrvStyle}>
                    {hrvData ? (
                        <HRVGraph hrvData={hrvData} />
                    ) : (
                        <p>Loading hrv data...</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Gallery;