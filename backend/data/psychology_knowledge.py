# Psychology Knowledge Base for Mental Wellness Assistant
# Based on evidence-based psychological principles and therapeutic approaches

PSYCHOLOGY_KNOWLEDGE = {
    "anxiety": {
        "definition": "Anxiety is a natural response to stress, characterized by feelings of worry, nervousness, or fear about future events or situations.",
        "symptoms": ["Excessive worry", "Restlessness", "Fatigue", "Difficulty concentrating", "Irritability", "Muscle tension", "Sleep disturbances"],
        "techniques": [
            "Deep breathing exercises (4-7-8 technique)",
            "Progressive muscle relaxation",
            "Mindfulness meditation",
            "Grounding techniques (5-4-3-2-1 method)",
            "Cognitive restructuring",
            "Exposure therapy for specific fears"
        ],
        "coping_strategies": [
            "Practice regular physical exercise",
            "Maintain a consistent sleep schedule",
            "Limit caffeine and alcohol intake",
            "Engage in relaxing activities",
            "Challenge negative thought patterns",
            "Seek social support"
        ],
        "when_to_seek_help": "Consider professional help if anxiety significantly interferes with daily activities, relationships, or work performance for more than 6 months."
    },
    
    "depression": {
        "definition": "Depression is a mood disorder characterized by persistent feelings of sadness, hopelessness, and loss of interest in activities once enjoyed.",
        "symptoms": ["Persistent sadness", "Loss of interest in activities", "Changes in appetite or weight", "Sleep disturbances", "Fatigue", "Feelings of worthlessness", "Difficulty concentrating", "Thoughts of death or suicide"],
        "techniques": [
            "Behavioral activation",
            "Cognitive behavioral therapy (CBT)",
            "Mindfulness-based cognitive therapy",
            "Interpersonal therapy",
            "Gratitude journaling",
            "Social connection activities"
        ],
        "coping_strategies": [
            "Maintain a daily routine",
            "Engage in physical activity",
            "Connect with supportive people",
            "Practice self-compassion",
            "Set small, achievable goals",
            "Limit social media consumption"
        ],
        "when_to_seek_help": "Seek immediate professional help if experiencing thoughts of self-harm or suicide. Otherwise, seek help if symptoms persist for more than 2 weeks and significantly impact daily functioning."
    },
    
    "stress": {
        "definition": "Stress is the body's response to any demand or challenge, which can be physical, mental, or emotional.",
        "symptoms": ["Headaches", "Muscle tension", "Chest pain", "Fatigue", "Sleep problems", "Anxiety", "Irritability", "Depression"],
        "techniques": [
            "Time management strategies",
            "Problem-solving techniques",
            "Relaxation exercises",
            "Physical exercise",
            "Social support",
            "Mindfulness practices"
        ],
        "coping_strategies": [
            "Identify and address stress triggers",
            "Practice healthy boundaries",
            "Engage in regular physical activity",
            "Maintain work-life balance",
            "Practice relaxation techniques",
            "Seek professional support when needed"
        ],
        "when_to_seek_help": "Seek help if stress becomes overwhelming, persistent, or leads to physical or mental health problems."
    },
    
    "mindfulness": {
        "definition": "Mindfulness is the practice of being fully present and engaged in the current moment, without judgment.",
        "benefits": ["Reduced stress", "Improved focus", "Better emotional regulation", "Enhanced self-awareness", "Improved relationships", "Better sleep quality"],
        "techniques": [
            "Mindful breathing",
            "Body scan meditation",
            "Mindful walking",
            "Loving-kindness meditation",
            "Mindful eating",
            "Present-moment awareness"
        ],
        "practical_tips": [
            "Start with 5-10 minutes daily",
            "Focus on your breath as an anchor",
            "Notice thoughts without judgment",
            "Practice during routine activities",
            "Use mindfulness apps or guided meditations",
            "Be patient and consistent"
        ]
    },
    
    "cognitive_behavioral_therapy": {
        "definition": "CBT is a therapeutic approach that focuses on identifying and changing negative thought patterns and behaviors.",
        "core_principles": [
            "Thoughts, feelings, and behaviors are interconnected",
            "Negative thoughts can be identified and challenged",
            "Behavioral changes can improve mood and functioning",
            "Skills can be learned to manage difficult emotions"
        ],
        "techniques": [
            "Thought challenging",
            "Behavioral experiments",
            "Activity scheduling",
            "Problem-solving skills",
            "Relaxation training",
            "Exposure therapy"
        ],
        "common_thought_distortions": [
            "All-or-nothing thinking",
            "Catastrophizing",
            "Mind reading",
            "Fortune telling",
            "Personalization",
            "Should statements"
        ]
    },
    
    "self_care": {
        "definition": "Self-care involves taking deliberate actions to care for your physical, mental, and emotional well-being.",
        "dimensions": {
            "physical": ["Regular exercise", "Balanced nutrition", "Adequate sleep", "Medical check-ups", "Hygiene and grooming"],
            "emotional": ["Expressing feelings", "Practicing self-compassion", "Engaging in enjoyable activities", "Setting boundaries", "Seeking support"],
            "mental": ["Learning new skills", "Reading", "Puzzles and games", "Creative activities", "Mental health practices"],
            "social": ["Maintaining relationships", "Social activities", "Community involvement", "Support groups", "Professional relationships"],
            "spiritual": ["Meditation", "Prayer", "Nature connection", "Values clarification", "Purpose exploration"]
        },
        "barriers": [
            "Lack of time",
            "Guilt about taking time for yourself",
            "Financial constraints",
            "Lack of knowledge about self-care",
            "Perfectionism",
            "Cultural or family expectations"
        ]
    },
    
    "crisis_intervention": {
        "warning_signs": [
            "Talking about wanting to die or hurt oneself",
            "Looking for ways to harm oneself",
            "Talking about feeling hopeless or having no reason to live",
            "Talking about feeling trapped or in unbearable pain",
            "Talking about being a burden to others",
            "Increasing use of alcohol or drugs",
            "Acting anxious, agitated, or reckless",
            "Sleeping too little or too much",
            "Withdrawing or feeling isolated",
            "Showing rage or talking about seeking revenge"
        ],
        "immediate_actions": [
            "Stay with the person",
            "Listen without judgment",
            "Ask directly about suicidal thoughts",
            "Remove means of self-harm",
            "Call emergency services if immediate danger",
            "Contact a mental health professional",
            "Follow up and check in regularly"
        ],
        "resources": [
            "National Suicide Prevention Lifeline: 988",
            "Crisis Text Line: Text HOME to 741741",
            "Emergency services: 911",
            "Local mental health crisis centers",
            "Online crisis chat services"
        ]
    }
}

def get_psychology_context(keywords):
    """Extract relevant psychology knowledge based on keywords"""
    context = []
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Direct matches
        if keyword_lower in PSYCHOLOGY_KNOWLEDGE:
            knowledge = PSYCHOLOGY_KNOWLEDGE[keyword_lower]
            context.append(f"Psychology knowledge about {keyword_lower}:")
            context.append(f"Definition: {knowledge.get('definition', 'N/A')}")
            
            if 'techniques' in knowledge:
                context.append(f"Evidence-based techniques: {', '.join(knowledge['techniques'])}")
            if 'coping_strategies' in knowledge:
                context.append(f"Coping strategies: {', '.join(knowledge['coping_strategies'])}")
            if 'when_to_seek_help' in knowledge:
                context.append(f"When to seek professional help: {knowledge['when_to_seek_help']}")
        
        # Partial matches
        for topic, knowledge in PSYCHOLOGY_KNOWLEDGE.items():
            if keyword_lower in topic or any(keyword_lower in str(value).lower() for value in knowledge.values() if isinstance(value, (str, list))):
                if topic not in [c.split(':')[0].split()[-1] for c in context]:
                    context.append(f"Related psychology topic - {topic}: {knowledge.get('definition', 'N/A')}")
    
    return context
