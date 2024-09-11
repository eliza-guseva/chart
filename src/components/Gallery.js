import React, { useState, useEffect } from 'react';
import SleepStagesStack from './graphs/wellness/sleepStagesStack';
import SleepScores from './graphs/wellness/SleepScores';
import { HRVGraph } from './graphs/hrv/HrvStatus';

function DivVisible(divObject) {
    return (
        divObject.top < window.innerHeight
         && divObject.bottom > 0
         && divObject.top + divObject.height / 10 < window.innerHeight
        );
}

function SlideInFromRight(isXVisible) {
    return {
        transform: isXVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s ease-in-out',
        width: '100%',
        height: '100%',
        top: 0,
        right: 0,
    };
}

function SlideInFromLeft(isXVisible) {
    return {
        transform: isXVisible ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.5s ease-in-out',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
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


    const containerStyle = {
        position: 'relative',
        overflow: 'hidden',
    };

    return (
        <>
            <div id="stages-section" style={containerStyle}>
                <div style={stagesStyle}>
                    {sleepData ? (
                        <SleepStagesStack sleepData={sleepData} />
                    ) : (
                        <p>Loading sleep data...</p>
                    )}
                </div>
            </div>
            <div id="scores-section" style={containerStyle}>
                <div style={scoresStyle}>
                    {sleepData ? (
                        <SleepScores sleepData={sleepData} />
                    ) : (
                        <p>Loading sleep data...</p>
                    )}
                </div>
            </div>
            <div id="hrv-section" style={containerStyle}>
                <div style={hrvStyle}>
                    {hrvData ? (
                        <HRVGraph hrvData={hrvData} />
                    ) : (
                        <p>Loading hrv data...</p>
                    )}
                </div>

            </div>
        </>
    );
};

export default Gallery;