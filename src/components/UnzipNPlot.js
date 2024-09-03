import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import TheGraphs from "./TheGraphs";
import { 
    WELLNESS_HEADER, 
    ENDURANCE_HEADER, 
    SLEEP_TAIL,
    TRAINING_LOAD_HEADER,
    TRAINING_READINESS_HEADER,
    FITNESS_HEADER,
    ACTIVITIES_TAIL
} from "../common/common";

const StatusEnum = Object.freeze({
    NOT_STARTED: 'not_started',
    LOADING: 'loading',
    LOADED: 'loaded'
  });


function getSpecificFiles(filesObject, header, tail='') {
    if (tail === '') {
        return filesObject.filter((file) => file.name.startsWith(header));
    }
    return filesObject.filter((file) => file.name.startsWith(header) && file.name.endsWith(tail));
}

const LoadTheFile = ({status, setStatus, error, handleUpload, isLoaded}) => {
    return (<div className="flex flex-col items-center p-4 w-full mt-20">
        <h2 className="font-bold text-xl md:text-2xl mb-4">Upload your Garmin data .zip file</h2>
        <div className="flex">
        <input 
        className="w-1 h-12 opacity-0 cursor-pointer"
        type="file" 
        onChange={handleUpload} 
        id = "file-upload"
        />
        <label 
            htmlFor="file-upload" 
            className="btn bg-btn-boring-rev-grad py-2 px-4 cursor-pointer inline-block text-white"
        >Browse files</label>
        </div>
        {error && 
        <div className="text-red-500 mt-2">Error: {error.message}
        {setStatus(StatusEnum.NOT_STARTED)}
        </div>
        }
        {status === StatusEnum.LOADING && <div className="mt-4 ml-4 font-bold">Loading...</div>}
    </div>)
}


const LoadAnotherFile = ({ isLoaded, toggleIsLoaded }) => {
    return (
        <div className="flex justify-end  w-full">
            <button className="btnboring" onClick={toggleIsLoaded}>
                {'Load Another File'}
            </button>
        </div>
    );
};


const LoadingComponent = ({status, setStatus, error, handleUpload, selectFiles}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (status === StatusEnum.LOADED) {
            setTimeout(() => {
                setIsLoaded(true);
            }, 300); // wait for the transition to complete
        }
    }, [status]);

    const toggleIsLoaded = () => {
        setIsLoaded((prev) => !prev);
    };

    return (
        <div className="w-full md:w-4/5">
            {/* if is loaded show LoadTheFile if is not loaded show LoadAnotheFile */}
            {isLoaded ? (
                <div className="w-full">
                <LoadAnotherFile isLoaded={isLoaded} toggleIsLoaded={toggleIsLoaded} />
                <TheGraphs selectFiles={selectFiles} />
                </div>
            ) : (
                <LoadTheFile 
                status={status} 
                setStatus={setStatus}
                error={error} 
                handleUpload={handleUpload} 
                isLoaded={isLoaded} />
            )}
        
        </div>
    );
};



LoadingComponent.propTypes = {
    status: PropTypes.string.isRequired,
    setStatus: PropTypes.func.isRequired,
    error: PropTypes.object,
    handleUpload: PropTypes.func.isRequired,
    selectFiles: PropTypes.object.isRequired,
};

LoadAnotherFile.propTypes = {
    isLoaded: PropTypes.bool.isRequired,
    toggleIsLoaded: PropTypes.func.isRequired,
};

LoadTheFile.propTypes = {
    status: PropTypes.string.isRequired,
    setStatus: PropTypes.func.isRequired,
    error: PropTypes.object,
    handleUpload: PropTypes.func.isRequired,
    isLoaded: PropTypes.bool.isRequired,
};







const UnzipNPlot = () => {
    const [filesObject, setFilesObject] = useState([]);
    const [status, setStatus] = useState(StatusEnum.NOT_STARTED);
    const [error, setError] = useState(null);
    const [selectFiles, setSelectFiles] = useState(null);

    const handleUpload = (e) => {
        setStatus(StatusEnum.LOADING);
        const file = e.target.files[0];
        const reader = new FileReader();

        const readFileAsArrayBuffer = (file) => {
            return new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsArrayBuffer(file);
            });
        };

        readFileAsArrayBuffer(file)
            .then(buffer => JSZip.loadAsync(buffer))
            .then(zipFile => {
                const files = Object.values(zipFile.files);
                return Promise.all(
                    files.map(file =>
                        file.async("blob").then(fileData => ({
                            name: file.name,
                            data: fileData,
                        }))
                    )
                );
            })
            .then(filesObject => {
                setFilesObject(filesObject);
                console.log(getSpecificFiles(filesObject, TRAINING_READINESS_HEADER));

                setSelectFiles({
                    'sleep': getSpecificFiles(filesObject, WELLNESS_HEADER, SLEEP_TAIL),
                    'performance': {
                        'endurance': getSpecificFiles(filesObject, ENDURANCE_HEADER),
                        'trainingLoad': getSpecificFiles(filesObject, TRAINING_LOAD_HEADER),
                    },
                    'activities': getSpecificFiles(filesObject, FITNESS_HEADER, ACTIVITIES_TAIL),
                    'hrv': getSpecificFiles(filesObject, TRAINING_READINESS_HEADER),
                });
                setStatus(StatusEnum.LOADED);
            })
            .catch(err => setError(err));
    };

    return LoadingComponent({status, setStatus, error, handleUpload, selectFiles});
};

export { UnzipNPlot };
