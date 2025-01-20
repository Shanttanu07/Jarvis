import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
function CameraDropdown({ onCameraChange }: {onCameraChange: any}) {
  const [cameraOptions, setCameraOptions] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');

  function checkAndRequestMediaPermissions() {
    return new Promise((resolve, reject) => {
        // Check for 'mediaDevices' support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const errorMessage = 'Media Devices API not supported in this browser.';
            alert(errorMessage);
            reject(new Error(errorMessage));
            return;
        }

        // Request microphone and video permissions
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
                // Permissions were successfully granted; you can close the stream if you don't need it
                stream.getTracks().forEach(track => track.stop());

                resolve({
                    audio: true,
                    video: true
                });
            })
            .catch((error) => {
                // Permissions were denied or there was another error
                alert('Permission declined! ' + error.message);
                reject(error);
            });
    });
}


// Usage
checkAndRequestMediaPermissions()
    .then(() => {
        console.log('Permissions granted.');
    })
    .catch((error) => {
        console.error('Error:', error.message || error);
    });

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
    if(onCameraChange) {
      onCameraChange(e.target.value);
    }
  };

  const updateCameraList = () => {
    navigator.mediaDevices.enumerateDevices()
      .then(async devices => {
        await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraOptions(videoDevices);
        // If the previously selected camera is no longer available, reset the selection
        if (!videoDevices.some(device => device.deviceId === selectedCamera)) {
          setSelectedCamera(videoDevices.length ? videoDevices[0].deviceId : '');
        }
      })
      .catch(error => {
        console.error("Error enumerating devices:", error);
      });
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        setCameraOptions(videoDevices);
        if(videoDevices.length) {
          setSelectedCamera(videoDevices[0].deviceId);
          onCameraChange(videoDevices[0].deviceId);
        }
      })
      .catch(error => {
        console.error("Error enumerating devices:", error);
      });

    updateCameraList();

    // Add an event listener to detect device changes
    navigator.mediaDevices.ondevicechange = updateCameraList;

    // Cleanup the event listener on component unmount
    return () => {
      navigator.mediaDevices.ondevicechange = null;
    };
  }, []);

  return (
    <select value={selectedCamera} onChange={handleCameraChange}>
      {cameraOptions.map(device => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `Camera ${cameraOptions.indexOf(device) + 1}`}
        </option>
      ))}
    </select>
  );
}

export default CameraDropdown;