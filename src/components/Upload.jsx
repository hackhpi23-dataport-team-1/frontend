import React from 'react';
import Upload from 'rc-upload';
import axios from 'axios';

const CaseUpload = ({items}) => {
    const [success, setSuccess] = React.useState(false);
    const [uploadedFiles, setUploadedFiles] = React.useState([]);

    const getUploadAction = (file) => {
        setUploadedFiles([...uploadedFiles, file.name])
        return 'http://127.0.0.1:5000/case/1';
    }

    const props = {
        action: getUploadAction,
        multiple: false,
        onStart(file) {
            console.log('onStart', file, file.name);
        },
        onSuccess(response) {
            setSuccess(true);
            console.log(response);
        },
        onError(err) {
            console.log('onError', err);
        },
    };

    return (
        <div className="upload">
            <h1 className="upload__title">
                Upload Your Malware
            </h1>
            <span>
                You may upload any type of log data from malicious software runs in your sandbox.
            </span>

            <Upload {...props}>
                Drag or Click here to upload your file.
            </Upload>

            <div className='upload__success'>
                <span className='upload__success__headline'>Uploaded Files</span>
                {uploadedFiles.map((file) => <div className='upload__success__list__file'>{file}</div>)}
            </div>
        </div>
    );
}

export default CaseUpload;