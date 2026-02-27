SPORTS_CONFIG = {
    "cricket": {
        "display_name": "Cricket",
        "description": "Bat and ball sport",
        "shots": {
            "cover_drive": {
                "display_name": "Cover Drive",
                "description": "Front foot drive through covers",
                "difficulty": "intermediate",
                "model_file": "cover_drive_model.pth",
                "embeddings_file": "cover_drive_embeddings.pth"
            },
            "pull_shot": {
                "display_name": "Pull Shot",
                "description": "Horizontal bat shot to leg side",
                "difficulty": "advanced",
                "model_file": "pull_shot_model.pth",
                "embeddings_file": "pull_shot_embeddings.pth"
            },
            "straight_drive": {
                "display_name": "Straight Drive",
                "description": "Drive straight back past bowler",
                "difficulty": "intermediate",
                "model_file": "straight_drive_model.pth",
                "embeddings_file": "straight_drive_embeddings.pth"
            },
            "cut_shot": {
                "display_name": "Cut Shot",
                "description": "Shot square on off side",
                "difficulty": "intermediate",
                "model_file": "cut_shot_model.pth",
                "embeddings_file": "cut_shot_embeddings.pth"
            },
            "defense": {
                "display_name": "Defensive Shot",
                "description": "Forward defensive block",
                "difficulty": "beginner",
                "model_file": "defense_model.pth",
                "embeddings_file": "defense_embeddings.pth"
            }
        }
    },
    "badminton": {
        "display_name": "Badminton",
        "description": "Racquet sport",
        "shots": {
            "smash": {
                "display_name": "Smash",
                "description": "Overhead attacking shot",
                "difficulty": "intermediate",
                "model_file": "smash_model.pth",
                "embeddings_file": "smash_embeddings.pth"
            },
            "clear": {
                "display_name": "Clear",
                "description": "High defensive shot to back",
                "difficulty": "beginner",
                "model_file": "clear_model.pth",
                "embeddings_file": "clear_embeddings.pth"
            },
            "drop_shot": {
                "display_name": "Drop Shot",
                "description": "Soft shot just over net",
                "difficulty": "advanced",
                "model_file": "drop_shot_model.pth",
                "embeddings_file": "drop_shot_embeddings.pth"
            },
            "serve": {
                "display_name": "Serve",
                "description": "Starting shot",
                "difficulty": "beginner",
                "model_file": "serve_model.pth",
                "embeddings_file": "serve_embeddings.pth"
            },
            "net_shot": {
                "display_name": "Net Shot",
                "description": "Close-range net play",
                "difficulty": "advanced",
                "model_file": "net_shot_model.pth",
                "embeddings_file": "net_shot_embeddings.pth"
            }
        }
    }
}