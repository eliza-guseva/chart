import React, { useState } from "react";
import JSZip from "jszip";


const ZipUpload = () => {
    const [filesObject, setFilesObject] = useState([]);
    const [error, setError] = useState(null);
    
    const handleUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
    
        reader.onload = async (e) => {
            const buffer = e.target.result;
            const zip = new JSZip();
            const zipFile = await zip.loadAsync(buffer);
            const files = Object.values(zipFile.files);
            const filesObject = await Promise.all(
                files.map(async (file) => {
                    const fileData = await file.async("blob");
                    return {
                        name: file.name,
                        data: fileData,
                    };
                })
            );
            setFilesObject(filesObject);
        }   
        reader.readAsArrayBuffer(file);
    }

    return (
        <div>
            <input type="file" onChange={handleUpload} />
            {filesObject.map((file, index) => (
                <div key={index}>
                    <h2>{file.name}</h2>
                    <img src={URL.createObjectURL(file.data)} alt={file.name} />
                </div>
            ))}
        </div>
    );
}

export default ZipUpload;
