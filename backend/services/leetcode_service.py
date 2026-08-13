import requests
from datetime import datetime

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

def fetch_leetcode_stats(username: str) -> dict:
    if not username:
        return {
            "status": "data_unavailable",
            "error_message": "Username not provided",
            "problems_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
            "rating": 0,
            "global_rank": "N/A",
            "active_days": 0,
            "contests_count": 0
        }

    query = """
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
        }
        userCalendar {
          totalActiveDays
        }
      }
      userContestRanking(username: $username) {
        rating
        attendedContestsCount
        globalRanking
      }
    }
    """
    
    try:
        response = requests.post(
            LEETCODE_GRAPHQL_URL,
            json={"query": query, "variables": {"username": username}},
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            timeout=8
        )
        if response.status_code == 200:
            data = response.json()
            matched = data.get("data", {}).get("matchedUser")
            if not matched:
                return {
                    "status": "invalid_username",
                    "error_message": "LeetCode user not found",
                    "problems_solved": 0,
                    "easy_solved": 0,
                    "medium_solved": 0,
                    "hard_solved": 0,
                    "rating": 0,
                    "global_rank": "N/A",
                    "active_days": 0,
                    "contests_count": 0
                }

            ac_stats = matched.get("submitStats", {}).get("acSubmissionNum", [])
            total_solved = 0
            easy_solved = 0
            medium_solved = 0
            hard_solved = 0

            for item in ac_stats:
                diff = item.get("difficulty")
                cnt = item.get("count", 0)
                if diff == "All":
                    total_solved = cnt
                elif diff == "Easy":
                    easy_solved = cnt
                elif diff == "Medium":
                    medium_solved = cnt
                elif diff == "Hard":
                    hard_solved = cnt

            ranking = matched.get("profile", {}).get("ranking", "N/A")
            active_days = matched.get("userCalendar", {}).get("totalActiveDays", 0)

            contest_info = data.get("data", {}).get("userContestRanking") or {}
            rating = round(contest_info.get("rating", 0))
            contests_count = contest_info.get("attendedContestsCount", 0)

            return {
                "status": "connected",
                "error_message": "",
                "problems_solved": total_solved,
                "easy_solved": easy_solved,
                "medium_solved": medium_solved,
                "hard_solved": hard_solved,
                "rating": rating,
                "global_rank": str(ranking) if ranking else "N/A",
                "active_days": active_days,
                "contests_count": contests_count
            }
        else:
            return {
                "status": "data_unavailable",
                "error_message": f"LeetCode HTTP {response.status_code}",
                "problems_solved": 0,
                "easy_solved": 0,
                "medium_solved": 0,
                "hard_solved": 0,
                "rating": 0,
                "global_rank": "N/A",
                "active_days": 0,
                "contests_count": 0
            }
    except Exception as e:
        return {
            "status": "data_unavailable",
            "error_message": str(e),
            "problems_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
            "rating": 0,
            "global_rank": "N/A",
            "active_days": 0,
            "contests_count": 0
        }
