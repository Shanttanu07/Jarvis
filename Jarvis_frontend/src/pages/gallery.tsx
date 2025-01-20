import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CameraDropdown from "~/components/camera";

import logo from '../../public/logo.png'

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import ImageViewer from "~/components/gallery";
const introduction = "Hello, I am Jarvis. I am your virtual eyes. I can help you with your daily tasks. If you have a question about your environment, just say 'Jarvis' and ask your question.";

const BASE_URL = 'https://jarvisbackend.randomcoder1234.repl.co'



export default function Home() {
    const [currentCameraId, setCurrentCameraId] = useState('');

    const handleCameraChange = (cameraId) => {

        setCurrentCameraId(cameraId);
    };

    const router = useRouter()
    const [imageUrls, setImageUrls] = useState([])
    // const imageUrls = [
    //     "https://firebasestorage.googleapis.com/v0/b/square-hackathon-c1227.appspot.com/o/WhatsApp%20Image%202023-10-29%20at%201.06.26%20AM.jpeg?alt=media&token=e881db5d-03f2-4f68-9b31-9b6b405730df&_gl=1*yd1vxl*_ga*MTk4MjI3NzU5OC4xNjk0NjU0MzUz*_ga_CW55HF8NVT*MTY5ODU2NjU2MS4yOS4xLjE2OTg1NjY5MTMuMjQuMC4w",
    //     "https://firebasestorage.googleapis.com/v0/b/square-hackathon-c1227.appspot.com/o/WhatsApp%20Image%202023-10-29%20at%201.06.27%20AM%20(2).jpeg?alt=media&token=056bd93f-18fd-4565-951b-6a4994377d4e&_gl=1*1o4rv0y*_ga*MTk4MjI3NzU5OC4xNjk0NjU0MzUz*_ga_CW55HF8NVT*MTY5ODU2NjU2MS4yOS4xLjE2OTg1NjY5ODUuMTcuMC4w",
    //     "https://firebasestorage.googleapis.com/v0/b/square-hackathon-c1227.appspot.com/o/WhatsApp%20Image%202023-10-29%20at%201.06.27%20AM%20(1).jpeg?alt=media&token=84ab0629-8a32-4c44-9c79-cbcd1eed6bf8&_gl=1*19h0dcw*_ga*MTk4MjI3NzU5OC4xNjk0NjU0MzUz*_ga_CW55HF8NVT*MTY5ODU2NjU2MS4yOS4xLjE2OTg1NjcwMTMuNjAuMC4w",
    //     "https://firebasestorage.googleapis.com/v0/b/square-hackathon-c1227.appspot.com/o/WhatsApp%20Image%202023-10-29%20at%201.06.27%20AM.jpeg?alt=media&token=5411a53c-b20e-40b8-88ef-6d155d4dba16&_gl=1*1yile83*_ga*MTk4MjI3NzU5OC4xNjk0NjU0MzUz*_ga_CW55HF8NVT*MTY5ODU2NjU2MS4yOS4xLjE2OTg1NjcwNDAuMzMuMC4w",
    //   ];
      

      async function getUrls() {
        const endpoint = `${BASE_URL}/get_urls`;
        const response = await fetch(endpoint, {
          method: 'GET',
        }).then((res) => res.json()).then((data) => {
            console.log(data.urls)
            setImageUrls(data.urls)
            return data.urls
            }).catch((err) => {console.log('server is breaking in getURs '+err)})
      
        if (response.ok) {
          const data = await response.json();
          return data.urls;
        } 
      }
      
      useEffect(() => {
        getUrls()
      },[])
      

    return (
        <>
            <div className="navbar shadow-sm">
                <div className="flex-1">
                <a href="https://imgbb.com/"><img className="w-[200px]" src="https://i.ibb.co/fCwfBqM/Untitled-2-removebg-preview-1-1.png" alt="Untitled-2-removebg-preview-1-1" border="0"/></a>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1">
                        <li>
                            <button className="text-xl" onClick={() => {window.location.assign('/')}}>
                                View My Eyes!
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col items-center p-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl mb-4 text-center font-bold">Image Gallery</h1>
                
                <h1 className="text-lg sm:text-xl md:text-xl mb-4 text-center font-bold pt-4">
                    Just say Next or Previous to navigate the gallery!
                </h1>
                {imageUrls.length!=0?<ImageViewer imageUrls={imageUrls}></ImageViewer>:<span className="loading loading-spinner loading-lg mx-auto"></span>}
            </div>
        </>
    );
}
