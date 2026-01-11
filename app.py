import os
import pandas as pd
from flask import Flask, jsonify, render_template, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "ml-latest-small", "movies.csv")

movies = pd.read_csv(DATA_PATH)
movies["genres"] = movies["genres"].str.replace("|", " ", regex=False)

vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(movies["genres"])
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

indices = pd.Series(movies.index, index=movies["title"]).drop_duplicates()
indices_lower = pd.Series(
    movies.index, index=movies["title"].str.lower()).drop_duplicates()


def get_recommendations(title, top_n=10):
    title_key = title.strip().lower()
    if not title_key:
        return None, "Type a movie title to get recommendations."

    if title_key in indices_lower:
        idx = int(indices_lower[title_key])
    else:
        return None, "Movie not found. Try a full title from the list."

    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1: top_n + 1]
    movie_indices = [i[0] for i in sim_scores]
    return movies["title"].iloc[movie_indices].tolist(), None


@app.route("/")
def index():
    titles = movies["title"].tolist()
    return render_template("index.html", titles=titles)


@app.route("/recommend", methods=["POST"])
def recommend():
    payload = request.get_json(silent=True) or {}
    title = payload.get("title", "")
    recommendations, error = get_recommendations(title)
    if error:
        return jsonify({"ok": False, "error": error, "results": []})
    return jsonify({"ok": True, "results": recommendations})


if __name__ == "__main__":
    app.run(debug=True)
