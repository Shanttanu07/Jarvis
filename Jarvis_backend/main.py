from flask import Flask
import replicate
import datetime
from flask import Flask, render_template, jsonify, request, Response, send_from_directory
import numpy as np
import together
import os
import time
import traceback
from langchain.document_loaders import TextLoader
from bson import json_util
import sys
from gtts import gTTS
from hume import HumeStreamClient
from hume.models.config import FaceConfig
import asyncio
import base64
import websockets
import time
from pprint import pprint
import torch
from torchvision import transforms
from PIL import Image
from pymilvus import Collection, FieldSchema, CollectionSchema, DataType, connections, utility
import glob
import time
from matplotlib import pyplot as plt
from flask_cors import CORS
import sys
import numpy as np
from gtts import gTTS
import io
import pusher
import uuid
from flask import Flask, render_template, request, jsonify
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Milvus
from langchain.embeddings import GooglePalmEmbeddings
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain.llms import GooglePalm
import boto3
from pymongo import MongoClient
together.api_key = '221380181f60985cb63dcccee7db05f616bb72e03d1fbe3788b85b1f26f5b581'
os.environ['GOOGLE_API_KEY'] = 'AIzaSyDBRhGrXMzLp2sA8PCRDkgsUzPpZAR0esQ'
embeddings = GooglePalmEmbeddings(google_api_key=os.environ['GOOGLE_API_KEY'])
llm = GooglePalm(google_api_key='AIzaSyDBRhGrXMzLp2sA8PCRDkgsUzPpZAR0esQ')

pusher_client = pusher.Pusher(app_id='1696658',
                              key='5c7ffe540890269a623d',
                              secret='2882db4c722e47db2cf6',
                              cluster='us3',
                              ssl=True)
# Load the pre-trained model for face detection

public_endpoint = 'https://in03-5d2c11a8a403061.api.gcp-us-west1.zillizcloud.com'
api_key = "83486b414c06b0043ae585ddc48ab28411cc4bf06a04b918c81fc71cf5ea6e471f3c25a1eed92ab937043ca148a9b1e6bd09a5d4"
DIMENSION = 2048  # Embedding vector size in this example
BATCH_SIZE = 128
TOP_K = 5
COLLECTION_NAME = 'Collection1'


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
    all_scores = []
    if (contains_pred(result1)):
      for emotion in result1['face']['predictions'][0]['emotions']:
        all_emotions.append(emotion['name'])
        all_scores.append(emotion['score'])
      emotion_score_pairs = list(zip(all_emotions, all_scores))

      # Sort the list based on scores in descending order
      sorted_emotion_score_pairs = sorted(emotion_score_pairs,
                                          key=lambda x: x[1],
                                          reverse=True)

      # Extract the names of the top three emotions
      top_emotion = [emotion for emotion, _ in sorted_emotion_score_pairs[:1]]
      top_score = [score for score, _ in sorted_emotion_score_pairs[:1]]

      # Print the result
      print("Top Emotion with Score:")
      print(top_emotion[0] + " " + str(top_score[0]))
      return top_emotion[0]
    else:
      return None


# Connect to the cluster
connections.connect(uri=public_endpoint, token=api_key)


def create_milvus_collection(new_collection=False):

  if utility.has_collection(COLLECTION_NAME):
    utility.drop_collection(COLLECTION_NAME)

  fields = [
      FieldSchema(name='id',
                  dtype=DataType.INT64,
                  is_primary=True,
                  auto_id=True),
      FieldSchema(name='filepath', dtype=DataType.VARCHAR, max_length=200),
      FieldSchema(name='image_embedding',
                  dtype=DataType.FLOAT_VECTOR,
                  dim=DIMENSION),
      FieldSchema(name='person_name', dtype=DataType.VARCHAR, max_length=200)
  ]

  schema = CollectionSchema(fields=fields)
  collection = Collection(name=COLLECTION_NAME, schema=schema)

  index_params = {'index_type': 'AUTOINDEX', 'metric_type': 'L2', 'params': {}}
  collection.create_index(field_name="image_embedding",
                          index_params=index_params)
  collection.load()

  return collection  # Return the collection


def get_image_filepaths(directory):
  return glob.glob(directory + '/*.jpeg', recursive=True)


def embed_and_insert_batch(model, data, collection):
  with torch.no_grad():
    output = model(torch.stack(data[0])).squeeze()

    filenames_with_embedding = zip(data[1], data[2], output.tolist())

    inserts = []
    for filename, filepath, embedding in filenames_with_embedding:
      inserts.append({
          "image_embedding":
          embedding,
          "filepath":
          filepath,
          "person_name":
          int(filename.split('_')[1].split('.')[0]) < 2677 and "Sahib"
          or "Arnav"
      })

    collection.insert(inserts)


def add_images_to_database(path):
  model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
  model = torch.nn.Sequential(*(list(model.children())[:-1]))
  model.eval()

  preprocess = transforms.Compose([
      transforms.Resize(256),
      transforms.CenterCrop(224),
      transforms.ToTensor(),
      transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225]),
  ])

  paths = get_image_filepaths(path)
  data_batch = [[], [], []]

  for path in paths:
    im = Image.open(path).convert('RGB')
    data_batch[0].append(preprocess(im))
    data_batch[1].append(path)
    data_batch[2].append(path)

    if len(data_batch[0]) % BATCH_SIZE == 0:
      embed_and_insert_batch(model, data_batch, collection)
      data_batch = [[], [], []]

  if len(data_batch[0]) != 0:
    embed_and_insert_batch(model, data_batch, collection)

  collection.flush()


def embed(data):
  model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
  model = torch.nn.Sequential(*(list(model.children())[:-1]))
  model.eval()
  with torch.no_grad():
    ret = model(torch.stack(data))
    if len(ret) > 1:
      return ret.squeeze().tolist()
    else:
      return torch.flatten(ret, start_dim=1).tolist()


def search_images(search_paths):

  data_batch = [[], [], []]

  preprocess = transforms.Compose([
      transforms.Resize(256),
      transforms.CenterCrop(224),
      transforms.ToTensor(),
      transforms.Normalize(mean=[0.485, 0.456, 0.406],
                           std=[0.229, 0.224, 0.225]),
  ])

  for path in search_paths:
    im = Image.open(path).convert('RGB')
    # im = im.transpose(Image.ROTATE_270)
    data_batch[0].append(preprocess(im))
    data_batch[1].append(path)
    data_batch[2].append(path.split('/')[-1])

  embeds = embed(data_batch[0])

  start = time.time()

  res = collection.search(embeds,
                          anns_field='image_embedding',
                          param={},
                          limit=TOP_K,
                          output_fields=['filepath', 'person_name'])
  print("THIS IS RES", res)

  finish = time.time()

  f, axarr = plt.subplots(len(data_batch[1]),
                          TOP_K + 1,
                          figsize=(20, 10),
                          squeeze=False)

  person_name_counts = {}
  valid_result = False  # Variable to track if any valid results were found

  for hits_i, hits in enumerate(res):
    axarr[hits_i][0].imshow(Image.open(data_batch[1][hits_i]))
    axarr[hits_i][0].set_axis_off()
    axarr[hits_i][0].set_title('Search Time: ' + str(finish - start))

    for hit_i, hit in enumerate(hits):
      person_name = hit.entity.get('person_name')
      filepath = hit.entity.get('filepath')
      distance = hit.distance
      print(person_name, distance)
      if distance < 350:
        valid_result = True  # A valid result was found
        print(filepath)
        # axarr[hits_i][hit_i + 1].imshow(Image.open(filepath))
        # axarr[hits_i][hit_i + 1].set_axis_off()
        # axarr[hits_i][hit_i + 1].set_title('Distance: ' + str(distance))

        if person_name in person_name_counts:
          person_name_counts[person_name] += 1
        else:
          person_name_counts[person_name] = 1

  if not valid_result:
    person_name_counts = None
    print("PERSON NOT IDENTIFIED")
    return None
  else:
    most_common_name = max(person_name_counts, key=person_name_counts.get)
    # plt.savefig('/Users/shanttanu/PycharmProjects/basics/CalHacks/website/search_result.png')
    print('MOST COMMON NAME', most_common_name)
    return most_common_name


if not utility.has_collection(COLLECTION_NAME):
  collection = create_milvus_collection()
  add_images_to_database('/Users/shanttanu/Downloads/CalHacksNewImages')
else:
  # If the collection already exists, just create a reference to it
  collection = Collection(COLLECTION_NAME)

app = Flask(__name__)
CORS(app)
REPLICATE_API_TOKEN = "r8_3oR5rHTdc5x1fOSzDlczg3seE5cVkQq02ZAWZ"
os.environ['REPLICATE_API_TOKEN'] = REPLICATE_API_TOKEN


def query_llava(file_path, prompt):
  print("hello")
  output = replicate.run(
      "yorickvp/llava-13b:2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591",
      input={
          "image":
          open(file_path, "rb"),
          "prompt":
          f"You are an assistant for a blind person. Describe the image to the blind person so he understands whats going on in front of him and to assist him by answering his question. Do not forget that you are saying this to a blind person like a conversation. Do not use the term image but say the scene in front of you. The blind person's question is- {prompt}"
      })
  # The yorickvp/llava-13b model can stream output as it's running.
  # The predict method returns an iterator, and you can iterate over that output.
  total_text = ""
  for item in output:
    # https://replicate.com/yorickvp/llava-13b/versions/2facb4a474a0462c15041b78b1ad70952ea46b5ec6ad29583c0b29dbd4249591/api#output-schema

    total_text += item
    # print(item, end="")
  print(total_text)
  return total_text


img_dir = 'images/'


@app.route('/send_frame/<id>', methods=['POST'])
def send_frame(id):
  if request.method == 'POST':
    try:
      print(request)
      files = request.files
      print(files)
      file = files['frame']
      print(file)
      file.save(img_dir + '/' + id + '.jpg')
      return jsonify(message='File Uploaded Successfully'), 200

    except Exception as e:
      print('SEND FRAME', e)
      return jsonify(message="Error"), 400


@app.route('/send_prompt/<id>', methods=['POST'])
def send_prompt(id):
  if request.method == 'POST':
    try:
      data = request.get_json()
      prompt = data.get('prompt')
      img_path = img_dir + '/' + id + 'jpg'
      text = query_llava(img_path, prompt)

      return jsonify(response=text), 200

    except Exception as e:
      print("SEND PROMPT", e)
      return jsonify(message="Error"), 400


@app.route('/search_image', methods=['POST'])
async def search_image():
  if request.method == 'POST':
    try:
      image_file = request.files['frame']
      filename = img_dir + '/image_to_search.jpg'
      image_file.save(filename)

      # Create a loop to run the coroutine asynchronously
      loop = asyncio.new_event_loop()
      asyncio.set_event_loop(loop)
      result = await cam_cap(None, None, filename)
      person = search_images([filename])
      if result != None and person != None:
        print('EMOTIONS', result)
        return jsonify({
            "success": True,
            "message": result,
            "person": person
        }), 200
      else:
        print("NO FACES DETECTED")
        return jsonify({"success": True, "message": result}), 200
    except Exception as e:
      print("SEARCH IMAGE", traceback.format_exc())
      return jsonify({"success": False, "message": str(e)}), 400


@app.route('/receive_frame', methods=['POST'])
def receive_frame():
  try:
    image_file = request.files['frame']
    filename = img_dir + '/captured_frame.jpg'
    image_file.save(filename)
    # Extract the text message from the request
    text_message = request.form.get('message', '')
    print(text_message)
    print("querying")
    start_time = time.time()
    response = query_llava(filename, text_message)
    end_time = time.time()
    print('TIME TAKEN: ', end_time - start_time)
    print("query done")
    return jsonify({"success": True, "message": response})
  except Exception as e:
    print(e)
    print("RECEIVE", traceback.format_exc())
    return jsonify({"success": False, "message": str(e)}), 400


@app.route('/speech', methods=['POST'])
def speech():
  word = request.json['word']
  tts = gTTS(text=word, lang='en')

  # Convert gTTS to bytes
  byte_io = io.BytesIO()
  tts.save(byte_io)
  byte_io.seek(0)

  return Response(byte_io, mimetype='audio/mp3')


@app.route('/pusher/<num>', methods=['GET'])
def pusher(num):
  if int(num) == 1:
    pusher_client.trigger('my-channel', 'my-event', {
        'id': str(uuid.uuid4()),
        "endpoint": "receive_frame"
    })
  elif int(num) == 2:
    pusher_client.trigger('my-channel', 'my-event', {
        'message': str(uuid.uuid4()),
        "endpoint": "search_image"
    })
  return jsonify(message="Successfully used Pusher")


client = boto3.client(
    'textract',
    region_name='us-east-1',
    aws_access_key_id='AKIA6I7J5MULOOITS3AV',
    aws_secret_access_key='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')

@app.route('/extract_text', methods=['POST'])
def extract_text():
  try:
    # Get the uploaded file from the request
    cap_img = request.files['frame']
    query = request.form.get('query','')
    filename = img_dir + '/ocr_frame.jpg'
    cap_img.save(filename)
    with open(filename, 'rb') as document:
      # Read the file into a bytearray
      img = bytearray(document.read())

    # Use Textract to detect document text
    response = client.detect_document_text(Document={'Bytes': img})

    final_string = ""
    counter = 0

    # Extract text from Textract response
    for item in response["Blocks"]:
      if item["BlockType"] == "LINE":
        print('\033[94m' + item["Text"] + '\033[0m')
        if counter != 10:
          final_string += item["Text"] + " "
          counter += 1
        else:
          final_string += item["Text"] + "\n"
          counter = 0

    # Save the extracted text to a file
    with open('file_input.txt', 'w') as doc:
      doc.write(final_string)
    # answer = together.Complete.create(prompt="INFORMATION: " + "final_string" + " QUESTION: " + query)
    # # answer = run_knowledge_llm(query)
    # print("RESPONSE IS", answer)
    # to_send = answer['output']['choices'][0]['text']
    # print("TO SEND IS", to_send)
    answer = query_llava(filename,query)
    return jsonify({'answer': answer}), 200
  except Exception as e:
    print(e)
    return jsonify(message = "Error"), 400


class CustomException(Exception):
  pass


class FileNameError(CustomException):
  pass


class LoadDocument():

  def __init__(self,
             jq_schema=None,
             content_key=None,
             metadata_fields=None,
             chunk_size=100,
             chunk_overlap=0,
             user_metadata={},
             file_id=None,
             data=None):
    self.path = data
    self.jq_schema = jq_schema
    self.content_key = content_key
    self.metadata_fields = metadata_fields
    self.chunk_size = chunk_size
    self.chunk_overlap = chunk_overlap
    self.user_metadata = user_metadata
    self.file_id = file_id
    self.data = data

  def classify_document(self):
    if self.path.endswith('txt'):
      self.data = self.load_text()
    else:
      raise FileNameError("File Type Exception: File Type Not Supported")

  def split_data(self):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap)
    texts = text_splitter.split_documents(self.data)
    self.texts = texts
    return texts

  def split_texts(self):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap)
    texts = text_splitter.split_documents(self.data)
    new_texts = []
    for text in texts:
      text.metadata.update(self.user_metadata)
      if self.file_id:
        text.metadata.update({"file_id": self.file_id})
      new_texts.append(text)
    texts = new_texts
    self.texts = texts
    return texts

  def load_text(self):
    loader = TextLoader(self.path)
    data = loader.load()
    return data


def data_gen():
  file_name = 'file_input.txt'
  pdf_obj = LoadDocument(data=file_name)
  pdf_obj.classify_document()
  docs = pdf_obj.split_data()
  embeddings = GooglePalmEmbeddings(google_api_key=os.environ['GOOGLE_API_KEY'])
  print("wassup")
  vector_store = Milvus.from_documents(
      docs,
      embeddings,
      connection_args={
          "uri":"https://in03-51cf3c3fa8c0c47.api.gcp-us-west1.zillizcloud.com",
          "user": "shanttanuoberoi@gmail.com",
          "password": "Milvus05!",
          "secure": True,
      },
  )
  print("milvus works")
  return vector_store


def run_knowledge_llm(user_input):
  combine_docs_prompt = PromptTemplate.from_template('')
  
  memory = ConversationBufferMemory(memory_key="chat_history",
                                    return_messages=True)
  
  llm = GooglePalm(google_api_key=os.environ['GOOGLE_API_KEY'])
  
  qa = ConversationalRetrievalChain.from_llm(
      llm=llm,
      memory=memory,
      retriever=data_gen().as_retriever(k=2, fetch_k=2),
      combine_docs_chain_kwargs=dict(prompt=combine_docs_prompt))

  print("still running")
  query = user_input
  answer = qa(query)
  return answer['answer']

@app.route('/answer', methods=['GET'])
def answer_query():
  try:
    user_input = request.args.get('query')
    answer = run_knowledge_llm(user_input)
    return jsonify({'answer': answer})
  except Exception as e:
    return jsonify({'error': str(e)})


mongo_client = MongoClient(
    'mongodb+srv://Actify:Act1fy@cluster0.u87uqzy.mongodb.net/test'
)  # Update with your MongoDB connection string
db = mongo_client[
    'Main']  # Replace 'your_database_name' with your actual database name
collection_mongo = db[
    'JarvisGallery']  # Replace 'your_collection_name' with your actual collection name


@app.route('/get_info', methods=['POST'])
def get_info():
  if request.method == 'POST':
    data = request.get_json()
    url = data.get('url')

    if url is not None:
      # Search for the document in MongoDB based on the URL
      result = collection_mongo.find_one({'url': url})
      result_dict = dict(result)
      # Convert the ObjectId to a string
      result_dict['_id'] = str(result_dict['_id'])
      print(result_dict)
      if result:
        # If the document is found, return it as JSON

        # Return the result_dict as JSON using bson.json_util for proper serialization
        return jsonify(json_util.dumps(result_dict)), 200
      else:
        return jsonify({'message': 'URL not found in the database'}), 404
    else:
      return jsonify({'message':
                      'URL parameter is missing in the JSON data'}), 400
  else:
    return jsonify({'message': 'Only POST requests are allowed'}), 405


@app.route('/get_urls', methods=['GET'])
def get_urls():
  # Retrieve all URLs from the MongoDB collection
  urls = [
      doc['url'] for doc in collection_mongo.find({}, {
          'url': 1,
          '_id': 0
      })
  ]

  return jsonify({'urls': urls}), 200


app.run(host='0.0.0.0', port=81)
