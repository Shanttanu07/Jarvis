import boto3

client = boto3.client(
    'textract',
    region_name= 'us-east-1',
    aws_access_key_id = 'AKIA6I7J5MULOOITS3AV',
    aws_secret_access_key='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'
)
with open('pleasework.jpeg' , 'rb') as document:
     img = bytearray(document.read())

response = client.detect_document_text(
     Document = {'Bytes': img}
)

final_string = ""
counter = 0
for item in response["Blocks"]:
     if item["BlockType"] == "LINE":
          print ('\033[94m' +  item["Text"] + '\033[0m')
          if counter != 10:
            final_string += item["Text"] + " "
            counter +=1
          else:
            final_string += item["Text"] + "\n"  
            counter = 0

          

with open('file_input.txt' , 'w') as doc:
     doc.write(final_string)