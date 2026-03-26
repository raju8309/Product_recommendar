import pytest
import pandas as pd
import os

def test_ratings_file_loads():
    df = pd.read_csv('../Data/raw/ratings.csv')
    assert len(df) > 900000  # 1M dataset should have 1M+ rows

def test_ratings_columns_exist():
    df = pd.read_csv('../Data/raw/ratings.csv')
    assert 'userId' in df.columns
    assert 'movieId' in df.columns
    assert 'rating' in df.columns

def test_ratings_range_valid():
    df = pd.read_csv('../Data/raw/ratings.csv')
    assert df['rating'].min() >= 0.5
    assert df['rating'].max() <= 5.0

def test_no_null_values():
    df = pd.read_csv('../Data/raw/ratings.csv')
    assert df.isnull().sum().sum() == 0

def test_movies_file_loads():
    df = pd.read_csv('../Data/raw/movies.csv')
    assert len(df) > 3000

def test_users_file_loads():
    df = pd.read_csv('../Data/raw/users.dat', sep='::', engine='python', 
                     names=["userId", "gender", "age", "occupation", "zipcode"])
    assert len(df) == 6040
