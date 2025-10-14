import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

def group_products(products, threshold=0.8):
    titles = [p.get('title') or p.get('name') or "" for p in products]
    embeddings = model.encode(titles, convert_to_tensor=True)
    cosine_scores = util.cos_sim(embeddings, embeddings).cpu().numpy()

    groups = []
    visited = set()

    for i, base in enumerate(products):
        if i in visited:
            continue
        group = [base]
        visited.add(i)

        for j in range(len(products)):
            if i == j or j in visited:
                continue
            if cosine_scores[i][j] >= threshold:
                group.append(products[j])
                visited.add(j)
        groups.append({"baseProduct": base, "products": group})
    return groups


if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            products = json.loads(sys.argv[1])
            grouped = group_products(products)
            print(json.dumps(grouped))
        else:
            print(json.dumps([]))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
