import requests
import json
from datetime import datetime, timedelta, timezone

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

PROBLEM_DIFFICULTY_CACHE = {}

def calculate_leetcode_streaks(submission_calendar_data):
    if not submission_calendar_data:
        return 0, 0

    ist = timezone(timedelta(hours=5, minutes=30))
    parsed_calendar = {}
    
    for ts_key, count in submission_calendar_data.items():
        try:
            ts = int(ts_key)
            cnt = int(count)
            dt = datetime.fromtimestamp(ts, tz=ist).date()
            parsed_calendar[dt] = parsed_calendar.get(dt, 0) + cnt
        except Exception:
            pass

    if not parsed_calendar:
        return 0, 0

    sorted_dates = sorted(parsed_calendar.keys())
    max_streak = 0
    temp_streak = 0
    prev_date = None

    for d in sorted_dates:
        if parsed_calendar[d] <= 0:
            max_streak = max(max_streak, temp_streak)
            temp_streak = 0
            prev_date = None
            continue
            
        if prev_date is None:
            temp_streak = 1
        elif d == prev_date + timedelta(days=1):
            temp_streak += 1
        else:
            max_streak = max(max_streak, temp_streak)
            temp_streak = 1
        prev_date = d

    max_streak = max(max_streak, temp_streak)

    today = datetime.now(ist).date()
    yesterday = today - timedelta(days=1)

    current_streak = 0
    check_date = today

    if parsed_calendar.get(today, 0) == 0 and parsed_calendar.get(yesterday, 0) > 0:
        check_date = yesterday

    while parsed_calendar.get(check_date, 0) > 0:
        current_streak += 1
        check_date -= timedelta(days=1)

    return current_streak, max_streak

def format_time_ago(ts):
    try:
        sub_time = datetime.fromtimestamp(int(ts))
        now = datetime.now()
        diff = now - sub_time
        seconds = diff.total_seconds()
        if seconds < 0:
            return "recently"
        if seconds < 60:
            return "just now"
        elif seconds < 3600:
            mins = int(seconds / 60)
            return f"{mins} mins ago" if mins > 1 else "1 min ago"
        elif seconds < 86400:
            hrs = int(seconds / 3600)
            return f"{hrs} hours ago" if hrs > 1 else "1 hour ago"
        else:
            days = int(seconds / 86400)
            return f"{days} days ago" if days > 1 else "1 day ago"
    except Exception:
        return "recently"

def get_leetcode_difficulty(title_slug: str) -> str:
    if not title_slug:
        return "MEDIUM"
    if title_slug in PROBLEM_DIFFICULTY_CACHE:
        return PROBLEM_DIFFICULTY_CACHE[title_slug]
    
    query = """
    query questionTitle($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
      }
    }
    """
    try:
        res = requests.post(
            LEETCODE_GRAPHQL_URL,
            json={"query": query, "variables": {"titleSlug": title_slug}},
            headers={"Content-Type": "application/json"},
            timeout=3
        )
        if res.status_code == 200:
            data = res.json()
            diff = data.get("data", {}).get("question", {}).get("difficulty")
            if diff:
                diff_upper = diff.upper()
                PROBLEM_DIFFICULTY_CACHE[title_slug] = diff_upper
                return diff_upper
    except Exception:
        pass
    return "MEDIUM"

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
            "contests_count": 0,
            "submission_calendar": {},
            "recent_submissions": []
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
          submissionCalendar
        }
      }
      userContestRanking(username: $username) {
        rating
        attendedContestsCount
        globalRanking
      }
      recentAcSubmissionList(username: $username, limit: 20) {
        title
        titleSlug
        timestamp
      }
    }
    """
    
    try:
        response = requests.post(
            LEETCODE_GRAPHQL_URL,
            json={"query": query, "variables": {"username": username}},
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://leetcode.com"
            },
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
                    "contests_count": 0,
                    "submission_calendar": {},
                    "recent_submissions": []
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
            user_cal = matched.get("userCalendar", {}) or {}
            active_days = user_cal.get("totalActiveDays", 0)
            
            # Extract real submission calendar JSON map
            sub_cal_raw = user_cal.get("submissionCalendar", "{}")
            sub_calendar = {}
            if sub_cal_raw:
                try:
                    sub_calendar = json.loads(sub_cal_raw)
                except Exception:
                    sub_calendar = {}

            contest_info = data.get("data", {}).get("userContestRanking") or {}
            rating = round(contest_info.get("rating", 0))
            contests_count = contest_info.get("attendedContestsCount", 0)

            raw_recent = data.get("data", {}).get("recentAcSubmissionList") or []
            recent_submissions = []

            for sub in raw_recent:
                title = sub.get("title", "")
                slug = sub.get("titleSlug", "")
                ts = sub.get("timestamp")
                
                diff_upper = get_leetcode_difficulty(slug)
                
                recent_submissions.append({
                    "title": title,
                    "difficulty": diff_upper,
                    "time_ago": format_time_ago(ts) if ts else "recently"
                })

            current_streak, max_streak = calculate_leetcode_streaks(sub_calendar)

            return {
                "status": "connected",
                "error_message": "",
                "problems_solved": total_solved,
                "easy_solved": easy_solved,
                "medium_solved": medium_solved,
                "hard_solved": hard_solved,
                "rating": rating,
                "global_rank": str(ranking),
                "active_days": active_days,
                "current_streak": current_streak,
                "max_streak": max_streak,
                "contests_count": contests_count,
                "submission_calendar": sub_calendar,
                "recent_submissions": recent_submissions
            }
        else:
            return {
                "status": "error",
                "error_message": f"LeetCode returned status {response.status_code}",
                "problems_solved": 0,
                "easy_solved": 0,
                "medium_solved": 0,
                "hard_solved": 0,
                "rating": 0,
                "global_rank": "N/A",
                "active_days": 0,
                "contests_count": 0,
                "submission_calendar": {},
                "recent_submissions": []
            }
    except Exception as e:
        return {
            "status": "error",
            "error_message": str(e),
            "problems_solved": 0,
            "easy_solved": 0,
            "medium_solved": 0,
            "hard_solved": 0,
            "rating": 0,
            "global_rank": "N/A",
            "active_days": 0,
            "contests_count": 0,
            "submission_calendar": {},
            "recent_submissions": []
        }
