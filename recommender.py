import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

# 1. Load the Data
# Ensure 'movies.csv' is in your project folder
movies = pd.read_csv('movies.csv')

# Inspect the data
print(movies.head())
# Output should look like: movieId, title, genres

# 2. Preprocessing
# The 'genres' column has pipes like "Action|Adventure".
# We replace the pipe with a space so the vectorizer can read it as a sentence.
movies['genres'] = movies['genres'].str.replace('|', ' ')

# 3. Vectorize the Genres
# This turns text into a giant matrix of numbers representing each movie's "DNA"
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(movies['genres'])

print(f"Matrix Shape: {tfidf_matrix.shape}")
# Shape will be (9742, 20-25) -> 9k movies, ~20 unique genre words

# 4. Compute Similarity Score
# linear_kernel is a faster implementation of cosine similarity for this kind of data
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# This creates a massive square matrix where row X and col Y is the similarity score
# between movie X and movie Y.

# Create a reverse map of indices and movie titles to easily find index by title
indices = pd.Series(movies.index, index=movies['title']).drop_duplicates()


def get_recommendations(title, cosine_sim=cosine_sim):
    try:
        # Get the index of the movie that matches the title
        idx = indices[title]

        # Get the pairwsie similarity scores of all movies with that movie
        sim_scores = list(enumerate(cosine_sim[idx]))

        # Sort the movies based on the similarity scores
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Get the scores of the 10 most similar movies
        # We skip [0] because that is the movie itself (score=1.0)
        sim_scores = sim_scores[1:11]

        # Get the movie indices
        movie_indices = [i[0] for i in sim_scores]

        # Return the top 10 most similar movies
        return movies['title'].iloc[movie_indices]

    except KeyError:
        return "Movie not found in dataset. Check the spelling!"
