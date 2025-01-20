import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '~/pages/main';

function ImageViewer({ imageUrls }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  async function getInfo(url: string) {
    const endpoint = `${BASE_URL}/get_info`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    }).then((res) => res.json()).then((data) => {
        const desc = JSON.parse(data).data;
        console.log(desc)
        convertTextToSpeech(desc)
        return desc
        }).catch((err) => {convertTextToSpeech('Something went wrong, try again')})
  
    if (response.ok) {
      const data = await response.json();
      return data;
    } 
    // else {
    //   throw new Error(`Error: ${response.status}`);
    // }
  }


  // Function to go to the next image
  const nextImage = () => {
    console.log('next image')
    setCurrentImageIndex((prevIndex) => {
        getInfo(imageUrls[(prevIndex + 1) % imageUrls.length])
        return (prevIndex + 1) % imageUrls.length}
        );
  };

  // Function to go to the previous image
  const prevImage = () => {
    console.log('prev image')
    setCurrentImageIndex((prevIndex) => {
        getInfo(imageUrls[prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1])
      return prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    });
  };

  useEffect(() => {
    // Preload images when the component mounts
    const preloadImages = () => {
      setIsLoading(true);
      const promises = imageUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            resolve();
          };
        });
      });
      Promise.all(promises).then(() => {
        setIsLoading(false);
      });
    };

    preloadImages();
  }, [imageUrls]);

    // Determine if there's a previous image
    const hasPreviousImage = currentImageIndex > 0;

    // Determine if there's a next image
    const hasNextImage = currentImageIndex < imageUrls.length - 1;


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
                convertTextToSpeech('', 0.8);
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
        // if (/Mobi|Android/i.test(navigator.userAgent)) {
        //     convertTextToSpeechMobile(text, speed);
        // } else{
            convertTextToSpeechDesktop(text, speed);
        // }
    }

    let speechRecognition;
    const [isRecognitionActive, setIsRecognitionActive] = useState(true);
    const recognitionActiveRef = useRef(false);

    useEffect(() => {
        if (recognitionActiveRef.current) return;

        const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionActiveRef.current = true;
        speechRecognition = new recognition();
        speechRecognition.continuous = true;
        const wakeWord = 'jarvis'

        speechRecognition.onstart = () => {
            console.log("Speech recognition started");
            setIsRecognitionActive(true);
        };

        speechRecognition.onend = () => {
            console.log("Speech recognition ended");
            speechRecognition.start();

        };

        speechRecognition.onresult = (event) => {
            let text = event.results[event.results.length - 1][0].transcript;
            console.log(text)
            console.log(hasPreviousImage)
            if (text.toLowerCase().includes('next')) {
                nextImage()
                convertTextToSpeech("Just a minute.")
                
                
            } else if(text.toLowerCase().includes('previous')){


                prevImage()
                convertTextToSpeech("Just a minute.")

            }
        };
        speechRecognition.start();

        return () => {
            speechRecognition.stop();
        };
    }, []);

    

  return (
    <div className="image-viewer flex flex-row items-center justify-center h-[500px] px-14 space-x-5">
      <button onClick={prevImage} className="prev-button" disabled={!hasPreviousImage}>
        &lt; 
      </button>
      <div className='h-[80%] w-[100vw-40px] sm:w-full sm:h-full'>
        {isLoading ? (
          <span className="loading loading-spinner loading-lg mx-auto"></span>
        ) : (
          <img className='h-full w-full object-contain'
            src={imageUrls[currentImageIndex]}
            alt={`Image ${currentImageIndex}`}
          />
        )}
      </div>
      <button onClick={nextImage} className="next-button" disabled={!hasNextImage}>
        &gt;
      </button>
    </div>
  );
}

export default ImageViewer;
