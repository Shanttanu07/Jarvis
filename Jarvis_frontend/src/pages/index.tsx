import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CameraDropdown from "~/components/camera";

import { api } from "~/utils/api";



export default function Home() {
  const [currentCameraId, setCurrentCameraId] = useState('');

  const handleCameraChange = (cameraId) => {

    setCurrentCameraId(cameraId);
  };

  const convertTextToSpeechDesktop = (text, speed = 1) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        utterance.volume = 0;
        utterance.rate = speed;
        utterance.onstart = () => {
            console.log("Speech started");

        };

        utterance.onend = () => {
            console.log('speeech ended')

        };

        utterance.onerror = (event) => {
            console.error("Speech error:", event);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Your browser does not support Speech Synthesis.');
    }
};

  function convertTextToSpeech(text, speed = 1) {
    // Check if the device is a mobile using userAgent
    // convertTextToSpeechMobile(text, speed);
    convertTextToSpeechDesktop(text, speed);
   
}

  const handleClick=()=>{
    console.log('here')
    convertTextToSpeech('hi how are you', 3)
    setTimeout(()=>{
      router.push('/main')
    }, 600)
  }

  const router = useRouter()
  return (
    <>
    <div className="flex flex-col w-full h-[100vh] justify-center items-center" onClick={()=>handleClick()}>

            <button className="btn btn-lg">Click Anywhere to Start!</button>



    </div>
      
    </>
  );
}
