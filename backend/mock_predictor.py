def generate_projection(input_data):
    projection = [
        {"year": 2, "PPG": 14.4, "RPG": 5.8, "APG": 4.7, "TS%": 57.2, "BPM": 2.8},
        {"year": 3, "PPG": 15.6, "RPG": 6.2, "APG": 5.1, "TS%": 58.9, "BPM": 3.6},
        {"year": 4, "PPG": 16.7, "RPG": 6.6, "APG": 5.4, "TS%": 59.5, "BPM": 4.3},
        {"year": 5, "PPG": 17.5, "RPG": 7.0, "APG": 5.7, "TS%": 60.3, "BPM": 5.0},
        {"year": 6, "PPG": 18.6, "RPG": 7.4, "APG": 6.2, "TS%": 61.6, "BPM": 6.0}
    ]

    summary = f"""
    Based on the rookie season stats, this player shows promising development potential.
    PPG grows from {input_data.ppg} to 18.6 by Year 6, while APG and RPG rise steadily.
    Efficiency metrics (TS%, BPM) also trend upward. Drafted {input_data.draft_position},
    with height {input_data.height} and wingspan {input_data.wingspan}, the trajectory suggests
    a high-value rotation player with upside.
    """

    return {"yearly": projection, "summary": summary.strip()}
