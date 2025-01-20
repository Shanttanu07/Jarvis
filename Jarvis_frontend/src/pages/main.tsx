import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CameraDropdown from "~/components/camera";

import logo from '../../public/logo.png'
import Pusher from 'pusher-js';


import { api } from "~/utils/api";
import { Router, useRouter } from "next/router";
const introduction = "Hello, I am Jarvis. I am your virtual eyes. I can help you with your daily tasks. If you have a question about your environment, just say 'Jarvis' and ask your question.";

export const BASE_URL = 'https://jarvisbackend.randomcoder1234.repl.co'
function generateUniqueId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
async function sendFrame(id: string, file: FormData): Promise<string> {
    console.log(file)
    try {
        const response = await fetch(`${BASE_URL}/send_frame/${id}`, {
            method: 'POST',
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error sending frame:', error);
        throw error;
    }
}

async function sendPrompt(id: string, prompt: string): Promise<string> {
    try {
        const response = await fetch(`${BASE_URL}/send_prompt/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error sending prompt:', error);
        throw error;
    }
}

function VideoComponent({ cameraId }) {
    const videoRef = useRef(null);
    const [textQueue, setTextQueue] = useState([]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: { deviceId: { exact: cameraId } } })
            .then((stream) => {
                let video = videoRef.current;
                video.srcObject = stream
            })
            .catch((err) => console.error("Error:", err));
    }, [cameraId]);

    const sendFrameApi = api.video.sendFrame.useMutation(
        {
            onSuccess: (data) => {
                if (data && data.result != '') {
                    setTextQueue((prevQueue) => [...prevQueue, data.result]);
                }
            },
        }
    );
    let voices = [];

    const [isTTSActive, setIsTTSActive] = useState(false);

    const introductionRef = useRef(false)

    useEffect(() => {
        // introductionRef.curr
        const handleVoicesLoaded = () => {
            console.log('loading introduction')
            voices = window.speechSynthesis.getVoices();
            if (voices && voices.length) {
                window.speechSynthesis.cancel();
                convertTextToSpeech(introduction, 0.8);
            }
        };
        if (window.speechSynthesis.getVoices().length !== 0) {
            handleVoicesLoaded();
        } else {
            window.speechSynthesis.onvoiceschanged = handleVoicesLoaded;
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const convertTextToSpeechDesktop = (text, speed = 1) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';

            utterance.volume = 2;
            utterance.rate = speed;
            utterance.onstart = () => {
                console.log("Speech started");
                setIsTTSActive(true);
            };

            utterance.onend = () => {
                console.log('speeech ended')
                setIsTTSActive(false);
            };

            utterance.onerror = (event) => {
                console.error("Speech error:", event);
                setIsTTSActive(false);
            };

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support Speech Synthesis.');
        }
    };

    async function convertTextToSpeechMobile(text, speed = 1) {
        async function fetchAudio(word) {
            console.log('streaming audio?')
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "word": word })
            };
            let url = `${BASE_URL}/speech`;
            const res = await fetch(url, requestOptions);
        
            if (!res.ok) {
                throw new Error(`${res.status} = ${res.statusText}`);
            }
        
            // Get the Uint8Array from the response
            const audioData = await res.arrayBuffer();
            return audioData;
        }
        
        function playAudioFromData(audioData) {
            const blob = new Blob([audioData], { type: 'audio/mp3' });
            const url = window.URL.createObjectURL(blob);
            const audio = new Audio();
            audio.src = url;
            audio.play();
        }

        fetchAudio(text)
            .then(playAudioFromData)
            .catch(error => {
                console.error("Error:", error.message);
            });
    }

    function convertTextToSpeech(text, speed = 1) {
        // Check if the device is a mobile using userAgent
        // convertTextToSpeechMobile(text, speed);
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            convertTextToSpeechMobile(text, speed);
        } else{
            convertTextToSpeechDesktop(text, speed);
        }
    }

    let speechRecognition;
    const recognitionActiveRef = useRef(false);
    const { pathname } = useRouter();


    useEffect(() => {
        if (recognitionActiveRef.current) return;

        const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionActiveRef.current = true;
        speechRecognition = new recognition();
        speechRecognition.continuous = true;
        const wakeWord = 'jarvis'
        window.addEventListener("beforeunload", function(event) {
            recognition.stop();  // Assuming 'recognition' is your SpeechRecognition object
            speechRecognition.stop();
        });

        recognition.onerror = function(event) {
            console.error("Speech Recognition Error:", event.error);
        };

        speechRecognition.onstart = () => {
            console.log("Speech recognition started");
        };

        speechRecognition.onend = () => {
            console.log("Speech recognition ended");
            console.log(pathname)
            if(pathname=='/main'){
            speechRecognition.start();
        }
        };

        speechRecognition.onresult = (event) => {
            
            let text = event.results[event.results.length - 1][0].transcript;
            console.log(text)
            if (text.toLowerCase().includes('jarvis text')) {
                let afterTriggerText = text.toLowerCase().split('jarvis text')[1].trim();
                if (afterTriggerText.length == 0) {
                    convertTextToSpeech("Sorry, I didn't get that. Please try again.")
                    return          
                }
                console.log(afterTriggerText)
                // isActive = true;
                convertTextToSpeech("Just a minute.")
                document.getElementById('questionResponseSection').style.display = 'flex'; console.log('jarvis detected', afterTriggerText)
                document.getElementById("responseText").innnerText = ""
                document.getElementById("loadingSpinner").classList.remove("hidden");
                document.getElementById("userQuestion").innerText = "You Asked: " + afterTriggerText;
                captureFrameForOCR(afterTriggerText)
            } else if (text.toLowerCase().includes('jarvis')) {
                let afterTriggerText = text.toLowerCase().split('jarvis')[1].trim();
                if (afterTriggerText.length == 0) {
                    convertTextToSpeech("Sorry, I didn't get that. Please try again.")
                    return
                }
                // isActive = true;
                convertTextToSpeech("Just a minute.")
                document.getElementById('questionResponseSection').style.display = 'flex'; console.log('jarvis detected', afterTriggerText)
                document.getElementById("responseText").innnerText = ""
                document.getElementById("loadingSpinner").classList.remove("hidden");
                document.getElementById("userQuestion").innerText = "You Asked: " + afterTriggerText;
                captureFrame(afterTriggerText)
            }
        };
        speechRecognition.start();

        return () => {
      Router.events.off('routeChangeStart', ()=>{speechRecognition.abort();});
            
        };
    }, []);

    // New useEffect that listens to changes in isTTSActive state
    // useEffect(() => {
    //     if (isTTSActive) {
    //         console.log('switching it off')
    //         if (speechRecognition) {
    //             speechRecognition.stop();
    //             setIsRecognitionActive(false);
    //         }
    //     } else {
    //         console.log('switching it on')
    //         if (speechRecognition && !isRecognitionActive) {
    //             setIsRecognitionActive(true);
    //             speechRecognition.start();
    //         }
    //     }
    // }, [isTTSActive]);


    //   useEffect(() => {
    //     if(isTTSActive && isRecognitionActive){
    //         speechRecognition.stop();
    //     } else if (!isTTSActive && !isRecognitionActive) {
    //         speechRecognition.start();
    //     }
    //   }, [isTTSActive]);

    function captureFrame(textMessage) {
        console.log('framing', textMessage)
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to Blob
        canvas.toBlob(async function (blob) {
            let formData = new FormData();
            formData.append('frame', blob, 'captured_frame.jpg');
            formData.append('message', textMessage);

            const id = generateUniqueId()

            const objectURL = URL.createObjectURL(blob);
            console.log(objectURL)
            document.getElementById("capturedImage").src = objectURL;


            const response = await fetch(`${BASE_URL}/receive_frame`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                const outputMessage=data.message
                console.log(outputMessage)
                convertTextToSpeech(outputMessage)
                // speak(outputMessage)
                // speak('sdfsdf')
                document.getElementById("responseText").innerText = "Response: " + outputMessage;
                document.getElementById("loadingSpinner").classList.add("hidden");

                } else{
                    console.log('error')
                    console.log(data)
                    const outputMessage=data.message
                    document.getElementById("responseText").innerText = "Response: " + outputMessage;
                    convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                    document.getElementById("loadingSpinner").classList.add("hidden");
                }
                
            })
            .catch((error) => {
                console.error('Error:', error);
                convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                document.getElementById("responseText").innerText = "Response: " + error;
                document.getElementById("loadingSpinner").classList.add("hidden");
            });

            document.getElementById("capturedImage").src = objectURL;

            

            document.getElementById("loadingSpinner").classList.add("hidden");
        }, 'image/jpeg');

    }

    function captureFrameForOCR(textMessage) {
        console.log('framing', textMessage)
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to Blob
        canvas.toBlob(async function (blob) {
            let formData = new FormData();
            formData.append('frame', blob, 'captured_frame.jpg');
            formData.append('query', textMessage);

            const id = generateUniqueId()

            const objectURL = URL.createObjectURL(blob);
            console.log(objectURL)
            document.getElementById("capturedImage").src = objectURL;


            const response = await fetch(`${BASE_URL}/extract_text`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    console.log(data)
                const outputMessage=data.message
                console.log(outputMessage)
                convertTextToSpeech(outputMessage)
                // speak(outputMessage)
                // speak('sdfsdf')
                document.getElementById("responseText").innerText = "Response: " + outputMessage;
                document.getElementById("loadingSpinner").classList.add("hidden");

                } else{
                    console.log('error')
                    console.log(data)
                    const outputMessage=data.message
                    document.getElementById("responseText").innerText = "Response: " + outputMessage;
                    convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                    document.getElementById("loadingSpinner").classList.add("hidden");
                }
                
            })
            .catch((error) => {
                console.error('Error:', error);
                convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                document.getElementById("responseText").innerText = "Response: " + error;
                document.getElementById("loadingSpinner").classList.add("hidden");
            });

            document.getElementById("capturedImage").src = objectURL;

            

            document.getElementById("loadingSpinner").classList.add("hidden");
        }, 'image/jpeg');

    }

    // const sendFrame = useCallback((text) => {
    //   const canvas = document.createElement("canvas");
    //   canvas.width = videoRef.current.videoWidth;
    //   canvas.height = videoRef.current.videoHeight;
    //   const ctx = canvas.getContext("2d");
    //   ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    //   const frameData = canvas.toDataURL("image/jpeg");

    //   // const formData = new FormData();
    //   // formData.append("frame", videoRef.current);
    //   // console.log(videoRef.current)
    //   // console.log(formData)
    //   // sendFrameApi.mutate({ frame: frameData, text: text });
    // //   canvas.toBlob(async (blob) => {
    // //     formData.append("frame", blob, "frame.jpeg");

    // //     try {
    // //         const response = await fetch('http://127.0.0.1:5000', 
    // //         {
    // //             method: 'POST',
    // //             body: formData
    // //         });

    // //         if (!response.ok) {
    // //             console.error("Failed to send frame to server.");
    // //         } else {
    // //             console.log("Frame sent successfully.");
    // //         }

    // //     } catch (error) {
    // //         console.error("Error while sending frame to server:", error);
    // //     }
    // // }, "image/jpeg");
    // }, [sendFrameApi]);

    //   useEffect(() => {
    //     if ('speechSynthesis' in window) {
    //       if (textQueue.length === 0) return; // Exit if no texts in queue

    //     // Only start speaking if not already speaking
    //     if (!window.speechSynthesis.speaking) {
    //       const textToSpeak = textQueue[0];

    //       const utterance = new SpeechSynthesisUtterance(textToSpeak);
    //       utterance.rate = 0.8;
    //       utterance.onend = () => {
    //         // Remove the first text (which was just spoken) from the queue
    //         setTextQueue((prevQueue) => prevQueue.slice(1));
    //       };
    //       console.log(textQueue)
    //       window.speechSynthesis.speak(utterance);
    //     }
    //   }

    //   }, [textQueue]);


    // speech---------------------------------------------------------------------------------------------------------------

    // useEffect(() => {
    //     const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    //     const speechRecognition = new recognition();
    //     speechRecognition.continuous = true;
    //     speechRecognition.interimResults = false;

    //     speechRecognition.onresult = (event) => {
    //         const text = event.results[event.results.length - 1][0].transcript;

    //         if (text) {
    //             // mutation.mutate({ text }); // Adjust as per your function's expected parameters
    //         }
    //     };

    //     speechRecognition.onend = () => {
    //         speechRecognition.start();
    //     };

    //     return () => {
    //         speechRecognition.stop(); // Clean up: stop recognition when the component unmounts
    //     };
    // }, [mutation]);

    // Pusher.logToConsole = true;

    let dic = {}

    let pusher = new Pusher('5c7ffe540890269a623d', {
        cluster: 'us3'
      });

    const saySearchImage=(emotion, person)=>{
        if(emotion==null) {
            convertTextToSpeech('No person detected for emotion')
        } else{
            if(person == null) {
                convertTextToSpeech("Unidentified person's emotion is " + emotion)
            } else {
                convertTextToSpeech(person+"'s emotion is " + emotion)
            }
        }
    }

    const ref=useRef(false)

    useEffect(()=>{
        if(ref.current) return
        console.log('in the pusher')
        ref.current=true
        let channel = pusher.subscribe('my-channel');
        channel.bind('my-event', function(data) {
            // alert(JSON.stringify(data));
            console.log(data)
            const id = data.message
            // alert('hsf')
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async function (blob) {
                let formData = new FormData();
                formData.append('frame', blob, 'captured_frame.jpg');
                formData.append('message', 'Describe the environment to me');

                const objectURL = URL.createObjectURL(blob);
                console.log(objectURL)
                document.getElementById("capturedImage").src = objectURL;

                if (!dic[id]) {
                    dic[id] = true;

                    if(data.endpoint=='search_image'){
                        const imageSearch = fetch(`${BASE_URL}/search_image`, {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            saySearchImage(data.message, data.person)
                        console.log(data.message)
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                            // document.getElementById("responseText").innerText = "Response: " + error;
                            // document.getElementById("loadingSpinner").classList.add("hidden");
                        });
                    } else if (data.endpoint=='receive_frame') {
                        const response = fetch(`${BASE_URL}/receive_frame`, {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            if(data.success){
                            const outputMessage=data.message
                            console.log(outputMessage)
                            convertTextToSpeech(outputMessage)
                            // speak(outputMessage)
                            // speak('sdfsdf')
                            document.getElementById("responseText").innerText = "Response: " + outputMessage;
                            document.getElementById("loadingSpinner").classList.add("hidden");
            
                            } else{
                                console.log('error')
                                console.log(data)
                                const outputMessage=data.message
                                document.getElementById("responseText").innerText = "Response: " + outputMessage;
                                convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                                document.getElementById("loadingSpinner").classList.add("hidden");
                            }
                            
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            convertTextToSpeech("Sorry, there was an error. Please try again or check your internet connection")
                            document.getElementById("responseText").innerText = "Response: " + error;
                            document.getElementById("loadingSpinner").classList.add("hidden");
                        });
                    }
                }
            }, 'image/jpeg');
    });
    return () => {
        if(ref.current) return
        // channel.unbind('my-event');
        // pusher.unsubscribe( channel.name ) 
        // pusher.disconnect()
      };
    }, [])


    return (
        <video ref={videoRef} autoPlay={true} playsInline={true} />
    );
}


export default function Home() {
    const [currentCameraId, setCurrentCameraId] = useState('');

    const handleCameraChange = (cameraId) => {

        setCurrentCameraId(cameraId);
    };

    const router = useRouter()

    return (
        <>
            <div className="navbar shadow-sm">
                <div className="flex-1">
                <a href="https://imgbb.com/"><img className="w-[200px]" src="https://i.ibb.co/fCwfBqM/Untitled-2-removebg-preview-1-1.png" alt="Untitled-2-removebg-preview-1-1" border="0"/></a>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <button className="text-xl" onClick={() => {window.location.assign('/gallery');}}>
                                View Image Gallery!
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col items-center p-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl mb-4 text-center font-bold">Your Virtual Eyes</h1>
                <VideoComponent cameraId={currentCameraId}></VideoComponent>
                <div className="pt-4 flex flex-row items-center space-x-3">
                    <p>Choose Camera:</p>
                    <CameraDropdown onCameraChange={handleCameraChange} />
                </div>
                <h1 className="text-lg sm:text-xl md:text-xl mb-4 text-center font-bold pt-4">
                    Just say 'Jarvis' and ask your question!
                </h1>

                <div
                    id="questionResponseSection"
                    className="flex flex-col p-4 bg-sky-600 rounded-lg shadow-xl text-white"
                    style={{ display: 'none' }}
                >
                    <h1 className="text-lg sm:text-xl md:text-xl mb-4 text-center font-bold">Your last question</h1>
                    <div className="flex flex-col md:flex-row border-t w-full border-9EDDFF">
                        <div className="flex flex-col w-full md:w-1/2 p-4 md:border-r border-9EDDFF">
                            <div id="userQuestion" className="p-4 border-b border-9EDDFF"></div>
                            <div id="apiResponse" className="p-4 relative">
                                <div id="loadingSpinner" className="absolute inset-0 flex items-center justify-center hidden">
                                    <span className="loading loading-spinner loading-sm"></span>
                                </div>
                                <div id="responseText"></div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full md:w-1/2 p-4 items-center justify-center mt-4 md:mt-0">
                            <img id="capturedImage" src="" alt="Captured Image" className="max-w-full object-cover shadow-md" />
                            <h1 className="text-sm mb-4 text-center font-bold pt-4">The Image</h1>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
