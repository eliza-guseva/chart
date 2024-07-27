import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";


function getEnudranceScoreFiles(filesObject) {
    // wellness files start with DI_CONNECT/DI-Connect-Wellness
    return filesObject.filter((file) => file.name.startsWith("DI_CONNECT/DI-Connect-Metrics/EnduranceScore"));
}

function getSleepDataFiles(filesObject) {
    //they start with DI_CONNECT/DI-Connect-Wellness and end with sleepData.json
    return filesObject.filter((file) => file.name.startsWith("DI_CONNECT/DI-Connect-Wellness") && file.name.endsWith("sleepData.json"));
}


const ZipUpload = () => {
    const [filesObject, setFilesObject] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleUpload = (e) => {
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

                const allFiles = {
                    'sleep': getSleepDataFiles(filesObject),
                    'endurance': getEnudranceScoreFiles(filesObject)
                };
                navigate('/thegraphs', { state: { allFiles } });
            })
            .catch(err => setError(err));
    };

    return (
        <div>
            <input type="file" onChange={handleUpload} />
            {error && <div>Error: {error.message}</div>}
        </div>
    );
};

export default ZipUpload;
