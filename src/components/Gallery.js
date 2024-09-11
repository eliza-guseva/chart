import React, { useState, useEffect } from 'react';
import SleepStagesStack from './graphs/wellness/sleepStagesStack';
import SleepScores from './graphs/wellness/SleepScores';




const Gallery = () => {
    const [sleepData, setSleepData] = useState(null);
    const [isStagesVisible, setStagesVisible] = useState(false);
    const [isScoresVisible, setScoresVisible] = useState(false);

    useEffect(() => {
        fetch('/sample_sleep_data.json')
            .then(response => response.json())
            .then(jsonData => setSleepData(jsonData))
            .catch(error => console.error('Error loading sleep data:', error));
    }, []);


    useEffect(() => {
        const handleScroll = () => {
            const stagesSection = document.getElementById('stages-section');
            const scoresSection = document.getElementById('scores-section');

            if (stagesSection && scoresSection) {
                const stagesRect = stagesSection.getBoundingClientRect();
                const scoresRect = scoresSection.getBoundingClientRect();

                const stagesVisible = (
                    stagesRect.top < window.innerHeight
                     && stagesRect.bottom > 0
                     && stagesRect.top + stagesRect.height / 6 < window.innerHeight
                     && stagesRect.top + stagesRect.height * 5 / 6 > 0
                    );
                const scoresVisible = (
                    scoresRect.top < window.innerHeight
                    && scoresRect.bottom > 0
                    && scoresRect.top + scoresRect.height / 6 < window.innerHeight
                    && scoresRect.top + scoresRect.height * 5 / 6 > 0
                );
                // Set state directly based on conditions
                setStagesVisible(stagesVisible);
                setScoresVisible(scoresVisible);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Debugging: Log state changes
        console.log('isStagesVisible:', isStagesVisible);
        console.log('isScoresVisible:', isScoresVisible);
    }, [isStagesVisible, isScoresVisible]); 


    // CSS styles defined within the component
    const slideInFromRight = {
        transform: isStagesVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s ease-in-out',
        width: '100%', // Ensure full width
        height: '100%', // Ensure full height
        // position: 'absolute', // Positioned absolutely within relative parent
        top: 0,
        right: 0,
    };

    const slideInFromLeft = {
        transform: isScoresVisible ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.5s ease-in-out',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    };

    const containerStyle = {
        position: 'relative',
        overflow: 'hidden',
    };

    return (
        <>
            <div id="stages-section" style={containerStyle}>
                <div style={slideInFromRight}>
                    {sleepData ? (
                        <SleepStagesStack sleepData={sleepData} />
                    ) : (
                        <p>Loading sleep data...</p>
                    )}
                </div>
            </div>
            <div id="scores-section" style={containerStyle}>
                <div style={slideInFromLeft}>
                    {sleepData ? (
                        <SleepScores sleepData={sleepData} />
                    ) : (
                        <p>Loading sleep data...</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Gallery;