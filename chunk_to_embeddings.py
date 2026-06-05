import requests

def create_embeddings(texts):
    r = requests.post(
        "http://localhost:11434/api/embed",
        json={"model": "bge-m3", "input": texts}
    )
    return r.json()["embeddings"]

# testing 

texts = [
    "Python is a programming language.",
    "Embeddings convert text into numerical vectors."
]

embeddings = create_embeddings(texts)

print("Number of embeddings:", len(embeddings))
print("Dimension of first embedding:", len(embeddings[0]))
print("First 10 values of first embedding:", embeddings[0][:10])

'''
Number of embeddings: 2
Dimension of first embedding: 1024
First 10 values of first embedding: [-0.03553433, -0.0019297925, -0.0047206185, 0.004137334, 0.0036899436, -0.03906884, -0.014567766, 0.0066175563, 0.015912948, 0.0045855884]
'''