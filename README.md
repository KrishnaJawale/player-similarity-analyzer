# Soccer Player Playstyle Similarity
## Overview
A machine learning based full stack application allowing users to find the most similar players to a certain player based on playstyle, decided by custom selected metrics and adjustable metric weightings. 
Users enter player name, select the specific metrics they want to compare based on (ex, passing, goal creation), use sliders to customize the weighting of each metric, and optionally filter by age.

## Tech Stack
Frontend - Javasript, React, MaterialUI  
Backend - REST API with FastAPI  
Machine Learning (Python) - Pandas for data processing, scikit-learn

## Machine Learning/Analysis
### Data Processing
* Load data (CSV file) into pandas DataFrame  
* Handle missing values (replace NaN with 0's), filter out players that haven't played at least 5 matches  
* Group statistics (columns) into metrics (arrays of column names)  
* Normalize all data to per 90 minutes (loop through all stats, divide every value by the number of 90s played, exempt percentage stats)
* Scale all data to range of [0, 1] using MinMaxScaler

### Feature Selection
* Filter DataFrame columns by user selected metrics (map each metrics to its respective columns)
* Filter DataFrame by user entered min/max age
* Apply custom user metric weights (0-1) by creating Numpy array of weights, then multiplying each metric by its respective weight

### Similarity Calculation
* Apply cosine similarity to data, store results into similarity matrix
