import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { StatusEnum } from "./Common";


function getEnudranceScoreFiles(filesObject) {
    // wellness files start with DI_CONNECT/DI-Connect-Wellness
    return filesObject.filter((file) => file.name.startsWith("DI_CONNECT/DI-Connect-Metrics/EnduranceScore"));
}

function getSleepDataFiles(filesObject) {
    //they start with DI_CONNECT/DI-Connect-Wellness and end with sleepData.json
    return filesObject.filter((file) => file.name.startsWith("DI_CONNECT/DI-Connect-Wellness") && file.name.endsWith("sleepData.json"));
}

const SaveToLocalStorage = ({selectFiles}) => {
    const [isToggled, setIsToggled] = useState(false);
    const [isProceed, setIsProceed] = useState(false);
    const navigate = useNavigate();
    const handleToggleChange = () => {
        setIsToggled(!isToggled);
      };
    return (
        <div>
            <div className="flex items-center">
            <input className="togglesw" 
            class="togglesw"
            id="toggleSave"
            type="checkbox"
            checked={isToggled}
            onChange={handleToggleChange}
            ></input>
            <label className="font-bold" htmlFor="toggleSave">
                Save to Local Storage for further reference</label>
            </div>

            <button className="btn btnstd !mt-10"
                onClick={() => {
                    // if isToggled is true, save to local storage
                    if (isToggled) {
                        localStorage.setItem('selectFiles', JSON.stringify(selectFiles));
                    }
                    setIsProceed(true);
                    navigate('/thegraphs', { state: { selectFiles } });
                }}
            >
                {isToggled && "Save locally and "} Proceeed to Graphs
            </button>
        </div>
    )
}

const LoadingComponent = ({status, error, handleUpload, selectFiles}) => {
    let divclass = "mt-4 ml-4 font-bold"
    return (<div flex flex-column items-center content-center>
            {/* write status at any state */}
            <h1>Upload the zip file data dump Garmin sent you</h1>
            <input className="mt-4" type="file" onChange={handleUpload} />
            {error && <div>Error: {error.message}</div>}
            {status === StatusEnum.LOADING && <div className={divclass}>Loading...</div>}
            {status === StatusEnum.LOADED && <div className={divclass}>Loaded!</div>}
            {
            status === StatusEnum.LOADED && 
            <SaveToLocalStorage selectFiles={selectFiles}/>}
    </div>)

}




const ZipUpload = () => {
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

                setSelectFiles({
                    'sleep': getSleepDataFiles(filesObject),
                    'endurance': getEnudranceScoreFiles(filesObject)
                });
                setStatus(StatusEnum.LOADED);
            })
            .catch(err => setError(err));
    };

    return LoadingComponent({status, error, handleUpload, selectFiles});
};

export default ZipUpload;
