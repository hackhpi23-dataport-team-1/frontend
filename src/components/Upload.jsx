import React, { useEffect } from 'react';
import Upload from 'rc-upload';
import axios from 'axios';

const CaseUpload = () => {
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const [caseId, setCaseId] = React.useState(null);
    const [progress, setProgress] = React.useState(null);

    const initialMount = React.useRef(true);

    useEffect(() => {
        if (initialMount.current) {
            axios.post('http://127.0.0.1:5000/case').then((response) => {
                if (response.status !== 200) return;

                console.log('Case ID: ' + response.data.case);
                setCaseId(response.data.case);
                initialMount.current = false;
            });    
        }
    }, [])

    const getUploadAction = (file) => {
        setUploadedFiles([...uploadedFiles, file.name])
        return `http://127.0.0.1:5000/case/${caseId}`;
    }

    const props = {
        action: getUploadAction,
        multiple: false,
        onStart(file) {
            console.log('onStart', file, file.name);
        },
        onSuccess(response) {
            console.log(response);
        },
        onError(err) {
            console.log('onError', err);
        },
        onProgress(step, file) {
            setProgress(step.percent);
            console.log('onProgress', Math.round(step.percent), file.name);
        }
    };

    const redirect = (evt) => {
        window.location.href = `http://127.0.0.1:3001/case/${document.querySelector('.upload__caseid__input').value}`;
    }

    if (caseId === null) {
        return (
            <div className="upload upload--center">
                <h1 className="upload__title">
                    Generating Case-ID...
                </h1>
            </div>
        )
    }

    return (
        <div className={caseId === null || uploadedFiles.length === 0 ? "upload upload--center" : "upload"}>
            <h1 className="upload__title">
                Upload Your Malicious Files
            </h1>
            <span className='upload__description'>
                Please upload any log files related to the execution of malicious malware in the field below. You may as well enter the generated case id to resume your data exploration. We take the security and privacy of our systems seriously and are committed to protecting our users from potential threats. Your cooperation in providing us with any relevant information will help us to identify and address any issues promptly. Thank you for your assistance in maintaining a safe and secure environment.<br /><br />
                <b>Case-ID: </b>{caseId}
            </span>

            <div className='upload__caseid'>
                <input className='upload__caseid__input' type='text' placeholder='Enter your previous Case-ID' />
                <input className='upload__caseid__submit' type='submit' value='Resume Analysis' onClick={redirect} />
            </div>

            <Upload {...props}>
                Drag or Click here to upload your file.
            </Upload>

            {uploadedFiles.length > 0 && (
                <div className='upload__success'>
                    <span className='upload__success__headline'>Uploaded Files ({Math.round(progress,2)} %)</span>
                    {uploadedFiles.map((file, index) => <div key={index} className='upload__success__list__file'>{file}</div>)}
                    <a className='upload__success__button' href={`case/${caseId}`} >Check My Files</a>
                </div>
            )}
        </div>
    );
}

export default CaseUpload;