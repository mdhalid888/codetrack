import requests
from bs4 import BeautifulSoup
import re

def fetch_codechef_stats(username: str) -> dict:
    if not username:
        return {
            "status": "data_unavailable",
            "error_message": "Username not provided",
            "rating": 0,
            "highest_rating": 0,
            "stars": "N/A",
            "problems_solved": 0,
            "contests_count": 0
        }

    url = f"https://www.codechef.com/users/{username}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    try:
        response = requests.get(url, headers=headers, timeout=8)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Check for user existence
            if "Could not find page" in response.text or "User not found" in response.text:
                return {
                    "status": "invalid_username",
                    "error_message": "CodeChef user not found",
                    "rating": 0,
                    "highest_rating": 0,
                    "stars": "N/A",
                    "problems_solved": 0,
                    "contests_count": 0
                }

            # Rating
            rating_header = soup.find("div", class_="rating-header")
            rating = 0
            stars = "1★"
            if rating_header:
                rating_val = rating_header.find("div", class_="rating-number")
                if rating_val:
                    rating = int(re.sub(r'\D', '', rating_val.text) or 0)
                stars_span = rating_header.find("div", class_="rating-star")
                if stars_span:
                    stars_count = len(stars_span.find_all("span"))
                    stars = f"{stars_count}★" if stars_count > 0 else "1★"

            # Highest Rating
            highest_rating = rating
            highest_span = soup.find("small", text=re.compile(r'Highest Rating', re.I))
            if not highest_span:
                # alternative search
                for small in soup.find_all("small"):
                    if "highest rating" in small.text.lower():
                        match = re.search(r'\d+', small.text)
                        if match:
                            highest_rating = int(match.group())
                        break

            # Solved problems count
            problems_solved = 0
            content = soup.find("section", class_="rating-data-section")
            if content:
                match = re.search(r'Total Problems Solved:\s*(\d+)', content.text, re.I)
                if match:
                    problems_solved = int(match.group(1))

            # If scraping didn't find specific section, fallback parse
            if problems_solved == 0:
                all_text = soup.get_text()
                match = re.search(r'Total Problems Solved:\s*(\d+)', all_text, re.I)
                if match:
                    problems_solved = int(match.group(1))

            # Contests count & Drupal Settings parse for rating history and dates
            contests_count = 0
            contest_text = soup.find("div", class_="contest-participated-count")
            if contest_text:
                match = re.search(r'\d+', contest_text.text)
                if match:
                    contests_count = int(match.group())

            contest_history = []
            contest_dates = {}

            # 1. Parse userDailySubmissionsStats (Exact submission heatmap stats from CodeChef JS)
            match_stats = re.search(r'var\s+userDailySubmissionsStats\s*=\s*(\[.*?\]);', response.text)
            if match_stats:
                try:
                    import json
                    stats_arr = json.loads(match_stats.group(1))
                    for item in stats_arr:
                        d_str = item.get("date")  # e.g. "2026-8-7"
                        val = item.get("value", 0)
                        if d_str and val > 0:
                            parts = d_str.split("-")
                            if len(parts) == 3:
                                yyyy = parts[0]
                                mm = f"{int(parts[1]):02d}"
                                dd = f"{int(parts[2]):02d}"
                                formatted_date = f"{yyyy}-{mm}-{dd}"
                                contest_dates[formatted_date] = val
                except Exception as err:
                    print(f"userDailySubmissionsStats parse notice: {err}")

            # 2. Parse Drupal Settings for contest rating history
            match_settings = re.search(r'jQuery\.extend\(Drupal\.settings,\s*(\{.*?\})\);', response.text)
            if match_settings:
                try:
                    import json
                    d_data = json.loads(match_settings.group(1))
                    rating_data = d_data.get("date_versus_rating", {}).get("all", [])
                    for item in rating_data:
                        yr = item.get("getyear")
                        mo = item.get("getmonth")
                        dy = item.get("getday")
                        if yr and mo and dy:
                            date_str = f"{yr}-{int(mo):02d}-{int(dy):02d}"
                            if date_str not in contest_dates:
                                contest_dates[date_str] = 1
                        contest_history.append({
                            "name": item.get("name") or item.get("code"),
                            "rank": item.get("rank"),
                            "rating": item.get("rating"),
                            "date": item.get("end_date")
                        })
                except Exception:
                    pass

            return {
                "status": "connected",
                "error_message": "",
                "rating": rating,
                "highest_rating": max(highest_rating, rating),
                "stars": stars,
                "problems_solved": problems_solved,
                "contests_count": max(contests_count, len(contest_history)),
                "contest_history": contest_history,
                "contest_dates": contest_dates
            }
        elif response.status_code == 404:
            return {
                "status": "invalid_username",
                "error_message": "CodeChef user not found",
                "rating": 0,
                "highest_rating": 0,
                "stars": "N/A",
                "problems_solved": 0,
                "contests_count": 0
            }
        else:
            return {
                "status": "data_unavailable",
                "error_message": f"CodeChef HTTP {response.status_code}",
                "rating": 0,
                "highest_rating": 0,
                "stars": "N/A",
                "problems_solved": 0,
                "contests_count": 0
            }
    except Exception as e:
        return {
            "status": "data_unavailable",
            "error_message": str(e),
            "rating": 0,
            "highest_rating": 0,
            "stars": "N/A",
            "problems_solved": 0,
            "contests_count": 0
        }
