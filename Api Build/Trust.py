import json
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="User Ranking API")

# Define category mappings for output
CATEGORY_MAP = {
    "AI Engineer": "AI Engineer",
    "Blockchain Developer": "Blockchain",
    "Data Scientist": "Data Science",
    "Entrepreneur": "Entrepreneur",
    "Software Engineer": "Software Engineer",
    "Web Developer": "Web Development",
    "Other": "Other"
}

# Calculate trust score
def calculate_trust_score(swaps: int, rating: float) -> float:
    return min(10.0, (rating * 2 + swaps / 10))

# Load JSON data
def load_json_data(file_path: str) -> List[Dict]:
    try:
        with open(file_path, 'r') as f:
            users = json.load(f)
        # Add trust_score to each user
        for user in users:
            user['trust_score'] = calculate_trust_score(user['swaps'], user['rating'])
        return users
    except Exception as e:
        print(f"Error loading JSON file: {e}")
        return []

# Helper function to group users by category
def group_users_by_category(users: List[Dict]) -> Dict[str, List[Dict]]:
    category_users = {cat: [] for cat in CATEGORY_MAP}
    for user in users:
        if user['category'] in category_users:
            category_users[user['category']].append(user)
        else:
            print(f"Warning: Unknown category '{user['category']}' for user {user['username']}.")
    return category_users

# Pydantic model for response structure
class TopUser(BaseModel):
    label: str
    category: str
    trust_score: float
    username: str

class TopUsersResponse(BaseModel):
    users: List[TopUser]

class UsersResponse(BaseModel):
    users: List[Dict]

class CategoryUsersResponse(BaseModel):
    category: str
    users: List[Dict]

# Endpoint: Get all users
@app.get("/api/users", response_model=UsersResponse)
async def get_all_users():
    users = load_json_data("fake_user_profiles_with_skills_500.json")
    if not users:
        raise HTTPException(status_code=500, detail="No users loaded.")
    return {"users": users}

# Endpoint: Get users by category
@app.get("/api/users/category/{category}", response_model=CategoryUsersResponse)
async def get_users_by_category(category: str):
    if category not in CATEGORY_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Valid categories: {list(CATEGORY_MAP.keys())}"
        )
    users = load_json_data("fake_user_profiles_with_skills_500.json")
    if not users:
        raise HTTPException(status_code=500, detail="No users loaded.")
    category_users = [user for user in users if user['category'] == category]
    return {"category": CATEGORY_MAP[category], "users": category_users}

# Endpoint: Get top 4 users per category
@app.get("/api/top-users", response_model=TopUsersResponse)
async def get_top_users():
    users = load_json_data("fake_user_profiles_with_skills_500.json")
    if not users:
        raise HTTPException(status_code=500, detail="No users loaded.")

    # Group users by category
    category_users = group_users_by_category(users)

    # Fixed trust scores for mapping
    fixed_scores = [9.0, 8.0, 7.0, 6.0]
    user_labels = ["User1", "User2", "User3", "User4"]

    # Get top 4 users per category
    top_users_by_category = {}
    for category in CATEGORY_MAP:
        users_in_category = category_users.get(category, [])
        if len(users_in_category) < 4:
            print(f"Warning: Category '{category}' has only {len(users_in_category)} users, expected at least 4.")
            continue
        top_users = sorted(users_in_category, key=lambda x: x['trust_score'], reverse=True)[:4]
        top_users_by_category[category] = top_users

    # Format output
    result = []
    for rank, (label, score) in enumerate(zip(user_labels, fixed_scores)):
        for category in sorted(CATEGORY_MAP.keys(), key=lambda x: CATEGORY_MAP[x]):
            if category in top_users_by_category:
                user = top_users_by_category[category][rank]
                result.append({
                    "label": label,
                    "category": CATEGORY_MAP[category],
                    "trust_score": score,
                    "username": user['username']
                })

    return {"users": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)