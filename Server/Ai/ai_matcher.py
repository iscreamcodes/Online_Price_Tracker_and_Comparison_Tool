import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

# Load the pre-trained sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def group_products(products, threshold=0.8):
    """
    Groups products based on semantic similarity of their titles/names.

    Args:
        products (list): List of product dictionaries with 'title' or 'name'.
        threshold (float): Cosine similarity threshold to consider products as similar.

    Returns:
        list: List of grouped products with a base product.
    """
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
            file_path = sys.argv[1]

            # ✅ Read the JSON file instead of raw string
            with open(file_path, "r", encoding="utf-8") as f:
                products = json.load(f)

            grouped = group_products(products)
            print(json.dumps(grouped, ensure_ascii=False, indent=2))
        else:
            print(json.dumps([]))

    except Exception as e:
        # Return error as JSON
        print(json.dumps({"error": str(e)}))
