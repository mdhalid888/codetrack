def calculate_platform_normalized_score(platform: str, stats: dict) -> float:
    """Calculates a normalized 0-100 score for a specific platform."""
    if not stats or stats.get("status") != "connected":
        return 0.0

    if platform == "leetcode":
        solved = stats.get("problems_solved", 0)
        rating = stats.get("rating", 0)
        easy = stats.get("easy_solved", 0)
        med = stats.get("medium_solved", 0)
        hard = stats.get("hard_solved", 0)

        # Weighted calculation
        solved_score = min(50.0, (easy * 0.1 + med * 0.3 + hard * 0.6) / 120.0 * 50.0)
        rating_score = min(50.0, (rating / 2000.0) * 50.0) if rating > 0 else (solved / 300.0 * 50.0)
        return min(100.0, round(solved_score + rating_score, 1))

    elif platform == "codechef":
        rating = stats.get("rating", 0)
        solved = stats.get("problems_solved", 0)
        contests = stats.get("contests_count", 0)

        rating_score = min(60.0, (rating / 2200.0) * 60.0) if rating > 0 else 0.0
        solved_score = min(40.0, (solved / 300.0) * 30.0 + (contests / 20.0) * 10.0)
        return min(100.0, round(rating_score + solved_score, 1))

    elif platform == "hackerrank":
        score = stats.get("score", 0)
        badges = stats.get("badges_count", 0)
        solved = stats.get("problems_solved", 0)

        badge_score = min(40.0, (badges / 12.0) * 40.0)
        score_component = min(60.0, (score / 1500.0) * 40.0 + (solved / 150.0) * 20.0)
        return min(100.0, round(badge_score + score_component, 1))

    elif platform == "github":
        contributions = stats.get("contributions", 0)
        repos = stats.get("public_repos", 0)
        commits = stats.get("commits", 0)
        prs = stats.get("pull_requests", 0)

        contrib_score = min(40.0, (contributions / 400.0) * 40.0)
        repo_score = min(30.0, (repos / 25.0) * 30.0)
        activity_score = min(30.0, (commits / 250.0) * 20.0 + (prs / 20.0) * 10.0)
        return min(100.0, round(contrib_score + repo_score + activity_score, 1))

    return 0.0

def calculate_overall_allrounder_score(lc_score: float, cc_score: float, hr_score: float, gh_score: float) -> float:
    """
    Combines platform scores into a Classroom Overall Performance Score (0-100).
    Weights: LeetCode (30%), CodeChef (25%), HackerRank (20%), GitHub (25%)
    """
    weights = {
        "leetcode": 0.30,
        "codechef": 0.25,
        "hackerrank": 0.20,
        "github": 0.25
    }
    
    total_score = (
        (lc_score or 0.0) * weights["leetcode"] +
        (cc_score or 0.0) * weights["codechef"] +
        (hr_score or 0.0) * weights["hackerrank"] +
        (gh_score or 0.0) * weights["github"]
    )
    return round(total_score, 1)
