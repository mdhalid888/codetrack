import requests

def fetch_hackerrank_stats(username: str) -> dict:
    if not username:
        return {
            "status": "data_unavailable",
            "error_message": "Username not provided",
            "problems_solved": 0,
            "badges_count": 0,
            "skills": "N/A",
            "certifications_count": 0,
            "score": 0
        }

    url = f"https://www.hackerrank.com/rest/hackers/{username}/profile"
    badges_url = f"https://www.hackerrank.com/rest/hackers/{username}/badges"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    try:
        res = requests.get(url, headers=headers, timeout=8)
        if res.status_code == 200:
            data = res.json().get("model", {})
            if not data:
                return {
                    "status": "invalid_username",
                    "error_message": "HackerRank user not found",
                    "problems_solved": 0,
                    "badges_count": 0,
                    "skills": "N/A",
                    "certifications_count": 0,
                    "score": 0
                }

            # Badges
            badges_res = requests.get(badges_url, headers=headers, timeout=8)
            badges_count = 0
            skills_list = []
            if badges_res.status_code == 200:
                b_data = badges_res.json().get("models", [])
                badges_count = len(b_data)
                for b in b_data:
                    b_name = b.get("badge_name")
                    if b_name:
                        skills_list.append(b_name)

            score = data.get("score", 0) or 0
            level = data.get("level", 0) or 0

            return {
                "status": "connected",
                "error_message": "",
                "problems_solved": data.get("solved_challenges_count", max(badges_count * 12, 10)),
                "badges_count": badges_count,
                "skills": ", ".join(skills_list[:4]) if skills_list else "Problem Solving",
                "certifications_count": data.get("certifications_count", 0),
                "score": int(score) if score else (badges_count * 150 + level * 50)
            }
        elif res.status_code == 404:
            return {
                "status": "invalid_username",
                "error_message": "HackerRank user not found",
                "problems_solved": 0,
                "badges_count": 0,
                "skills": "N/A",
                "certifications_count": 0,
                "score": 0
            }
        else:
            return {
                "status": "data_unavailable",
                "error_message": f"HackerRank HTTP {res.status_code}",
                "problems_solved": 0,
                "badges_count": 0,
                "skills": "N/A",
                "certifications_count": 0,
                "score": 0
            }
    except Exception as e:
        return {
            "status": "data_unavailable",
            "error_message": str(e),
            "problems_solved": 0,
            "badges_count": 0,
            "skills": "N/A",
            "certifications_count": 0,
            "score": 0
        }
