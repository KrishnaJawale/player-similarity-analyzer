#This project is UNSUPERVISED machine learning
#Supervised learning uses labeled data to train models, aiming to predict outcomes
# or classify new data based on learned patterns, while unsupervised learning works
# with unlabeled data to discover hidden patterns, relationships, or structures within 
# the data without explicit guidance
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

#read csv file
df = pd.read_csv("data/player_data.csv")

# only have players of a certain position (ex: midfielders only)
# positions are ['DF' 'DF,MF' 'FW' 'MF,FW' 'MF' 'FW,MF' 'GK' 'FW,DF' 'DF,FW' 'MF,DF']
positions = ["FW", "FW,MF", "MF,FW", "DF", "DF,MF", "DF,FW", "MF,DF", "MF"]
df = df[df["Pos"].isin(positions)]

#drop players that haven't at least played 5 90's worth of minutes
df = df[df['90s'] >= 5]

#reset index
df = df.reset_index(drop=True)

#fill NaN with 0
df = df.fillna(0)

#list of relevant columns (not to normalize)
columns = ["Player", "90s", "Age", "Squad", "Nation"] # "Pos", "Nation", "Squad", "Comp", "Age", "Born"]

#list of relevant stats (need to be normalized per 90 minutes)
#stats_normalize = ["Gls", "Ast", "G+A", "xG", "xAG", "npxG", "G-PK", "SCA", "PassLive", "TO", "Fld", "GCA", "Tkl", "TklW", "Blocks", 
#                      "Int", "Tkl+Int", "Clr", "Err", "Cmp", "TotDist", "PrgDist", "PrgP", "PrgC", "CPA", "KP", "Tkld",
#                      "Sh", "SoT", "G/Sh",
#                      "Ast_stats_passing", "xA", "PPA", "GA", "Saves", "PKA", "PKsv", "Touches", "Carries", "Rec", "PrgR",
#                      "Def 3rd", "Mid 3rd", "Att 3rd", "Att Pen", "Succ", "Mis", "Dis", "PKwon", "PKcon", "Recov"]
#stats_no_normalize = ["Cmp%", "Save%", "CS%", "Succ%", "Tkld%", "SoT%", "CS"]

#defensive stats - centerbacks, fullbacks, midfielders
defensive_stats = ["Tkl", "TklW", "Blocks_stats_defense", "Sh_stats_defense", "Pass", "Def 3rd", "Clr", "Def"] #"Mid 3rd", "Att 3rd", Tkl%
#passing stats - midfielders
passing_stats = ["Cmp", "TotDist", "PrgDist", "PrgP", "KP", "1/3", "PPA", "CrsPA", "TB", "Sw", "Crs"] # , "Cmp%"
#touches stats - all positions
posession_stats = ["Touches", "Def Pen", "Def 3rd_stats_possession", "Mid 3rd_stats_possession", "Att 3rd_stats_possession", "Att Pen"]
#take-ons stats - wingers, strikers
take_ons_stats = ["Att_stats_possession", "Succ"] #"Succ%", "Tkld", "Tkld%"
#carries and receiving ball stats - wingers, fullbacks, midfielders
carries_receiving_stats = ["Carries", "TotDist_stats_possession", "PrgDist_stats_possession", "PrgC", "1/3_stats_possession", "CPA", "Rec", "PrgR_stats_possession"]
#goals and shot creation stats - wingers, midfielders, strikers
goals_shot_creation_stats = ["SCA", "PassLive", "TO", "Sh_stats_gca", "Fld", "GCA"]
#shooting stats - wingers, strikers, attacking midfielders
shooting_stats = ["Sh", "SoT", "SoT%", "Dist"] #"Gls", "G/Sh", "G/SoT", "xG", "npxG"

stats_dict = {
    "Defensive": defensive_stats,
    "Passing": passing_stats,
    "Possession": posession_stats,
    "Take Ons": take_ons_stats,
    "Ball Carrying and Receiving": carries_receiving_stats,
    "Goals and Shot Creation": goals_shot_creation_stats,
    "Shooting": shooting_stats
}

all_stats = carries_receiving_stats + take_ons_stats + goals_shot_creation_stats + passing_stats + posession_stats + defensive_stats + shooting_stats

df = df[columns + all_stats]

# normalize all stats per 90 if its not a percentage stat
for stat in all_stats:
    if "%" not in stat and stat != "Dist":
        df[stat] = round(df[stat] / df["90s"], 2)


def get_similar_players (player_name, metrics, minAge, maxAge, usePCA):
    # Use stats specified by metrics
    stats = []
    for metric in metrics:
        stats += stats_dict[metric]
    
    # Filter columns to necessary columns by selected metrics
    data = df[columns + stats]

    # Filter by ages
    data = data[(data["Age"] >= minAge) & (data["Age"] <= maxAge)]

    # Reset dataframe index
    data = data.reset_index(drop=True)

    # Normalize data using Min-Max scaling
    # MinMaxScaler scales all data features in range [0, 1] or else in range [-1, 1] if there are negative values are present in the dataset.
    # Use it when our data does not follow a normal distribution or when we need scaled data for algorithms like decision trees, k-nearest neighbors or support vector machines.
    # It gives best results when outliers are minimal or absent as it is sensitive to extreme values. 
    scaler = MinMaxScaler()
    X = scaler.fit_transform(data[stats])

    # Get reduced player vectors using PCA
    # These 2 lines change the result using principal component analysis
    # essentially this reduces the amount of stats (we have a lot of columns) as too many
    # may hurt interprability, PCA reduces dimensions by transferring all the stat columns
    # into a smaller number of uncorrelated "principal components" that explain most of the variance.
    # this can speed up similarity searches, removes redundant features (e.g., short passes and total passes may be highly correlated)
    # however since PCA doesn't compare original, 100+ columns of data, its better 
        # for underlying playstyles while no PCA is better for more direct stat comparision
    pca = PCA(n_components=2)
    X_reduced = pd.DataFrame(pca.fit_transform(X))

    # Build similarity matrix (whether to use PCA or not depends on user choice)
    similarity_matrix = cosine_similarity(X_reduced) if usePCA else cosine_similarity(X)

    # Method 1 - Calculate cosine similarity
    index = data[data["Player"] == player_name].index[0]

    # Get most similar players (excluding the player themselves)
    similarities = similarity_matrix[index]
    similar_player_indices = np.argsort(similarities)[::-1][0:11]  # top 10

    similar_players = data.iloc[similar_player_indices][["Player", "Squad", "Age"] + stats]

    similar_players.reset_index(drop=True, inplace=True)

    return similar_players.to_dict(orient="records")