import cv2
from hume import HumeStreamClient
from hume.models.config import FaceConfig
import asyncio
import base64
import websockets
import time
from pprint import pprint

def contains_pred(result):
    try: 
        result['face']['predictions']
        return True
    except KeyError: 
        return False
    except Exception as e: 
        print("Error", e)

async def cam_cap(websocket, port, file):
    
    client = HumeStreamClient("giK4bSY164dvaSzXu52165Y2hSI2oIxIqk2xhuppENglc8L2")
    config = FaceConfig(identify_faces=True)
    async with client.connect([config]) as hume_socket:

        start = time.time()
        result1 = await hume_socket.send_file(file)
        end = time.time()
        print("THE TIME TAKEN WAS: ", end - start)
        pprint(result1)
        all_emotions = []
        all_scores= []
        if(contains_pred(result1)):
            for emotion in result1['face']['predictions'][0]['emotions']:
                all_emotions.append(emotion['name'])
                all_scores.append(emotion['score'])
        emotion_score_pairs = list(zip(all_emotions, all_scores))

        # Sort the list based on scores in descending order
        sorted_emotion_score_pairs = sorted(emotion_score_pairs, key=lambda x: x[1], reverse=True)

        # Extract the names of the top three emotions
        top_emotion = [emotion for emotion, _ in sorted_emotion_score_pairs[:1]]
        top_score = [score for score , _ in sorted_emotion_score_pairs[:1]]

        # Print the result
        print("Top Emotion with Score:")
        print(top_emotion[0] + " " + str(top_score[0]))

async def main():
    cap = cv2.VideoCapture(0)
   
    while True:
        
        ret, frame = cap.read()
        
        if not ret:
            break

        # Save the frame as an image file
        file_name = f"frame_{int(time.time())}.jpg"
        cv2.imwrite(file_name, frame)
        # Call cam_cap asynchronously
        
        await cam_cap(None, None, file_name)
       
        # Wait for 1 second
        await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(main())
