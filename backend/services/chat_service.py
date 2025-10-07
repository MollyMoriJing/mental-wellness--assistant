import openai
import os
from dotenv import load_dotenv
from backend.services.recommender import retrieve_context
from backend.data.psychology_knowledge import get_psychology_context

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def extract_keywords(text):
    """Extract relevant keywords from user input for psychology knowledge lookup"""
    # Common mental health and psychology keywords
    psychology_keywords = [
        'anxiety', 'depression', 'stress', 'worry', 'nervous', 'panic', 'fear',
        'sad', 'hopeless', 'worthless', 'empty', 'lonely', 'isolated',
        'angry', 'irritated', 'frustrated', 'overwhelmed', 'burnout',
        'sleep', 'insomnia', 'fatigue', 'tired', 'exhausted',
        'concentration', 'focus', 'memory', 'confused', 'scattered',
        'relationships', 'social', 'friends', 'family', 'communication',
        'work', 'job', 'career', 'performance', 'deadline', 'pressure',
        'mindfulness', 'meditation', 'breathing', 'relaxation', 'calm',
        'therapy', 'counseling', 'treatment', 'help', 'support',
        'self-care', 'wellness', 'mental health', 'emotional', 'feelings',
        'thoughts', 'thinking', 'rumination', 'overthinking', 'negative',
        'positive', 'gratitude', 'happiness', 'joy', 'contentment',
        'trauma', 'ptsd', 'grief', 'loss', 'bereavement', 'crisis'
    ]
    
    text_lower = text.lower()
    found_keywords = []
    
    for keyword in psychology_keywords:
        if keyword in text_lower:
            found_keywords.append(keyword)
    
    return found_keywords


def generate_response(user_id, user_input):
    try:
        contexts = retrieve_context(user_id, user_input)
        
        # Extract keywords from user input for psychology knowledge
        keywords = extract_keywords(user_input)
        psychology_context = get_psychology_context(keywords)
        
        # If no OpenAI API key, provide a helpful response without AI
        if not os.getenv("OPENAI_API_KEY"):
            return provide_fallback_response(
                user_input, contexts, psychology_context
            )
        
        # Combine all contexts
        all_contexts = []
        if contexts:
            all_contexts.append(
                f"User's Mood History:\n{chr(10).join(contexts)}"
            )
        if psychology_context:
            all_contexts.append(
                f"Psychology Knowledge:\n{chr(10).join(psychology_context)}"
            )
        
        context_text = (
            "\n\n".join(all_contexts) if all_contexts else "No context available."
        )

        prompt = (
            "You are a supportive mental health assistant with expertise in "
            "psychology and evidence-based therapeutic techniques. "
            "Be empathetic, encouraging, and helpful. Use the provided context "
            "to give personalized, professional advice. "
            "Reference specific psychological principles and evidence-based "
            "techniques when appropriate. "
            "Always encourage professional help when needed and provide "
            "practical, actionable advice.\n"
            "---\n"
            f"Context:\n{context_text}\n"
            "---\n"
            f"User Message: {user_input}\n"
            "---\n"
            "Provide a helpful, personalized response based on the psychology "
            "knowledge and user context above:"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            timeout=20,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return provide_fallback_response(
            user_input, [], psychology_context
        )


def provide_fallback_response(user_input, contexts, psychology_context=None):
    """Provide helpful responses without AI when API is unavailable"""
    user_lower = user_input.lower()
    
    # Natural mood context integration
    mood_intro = ""
    if contexts:
        recent_moods = contexts[:2]  # Only use 1-2 recent entries
        if len(recent_moods) == 1:
            mood_intro = f"I see you've been feeling {recent_moods[0].lower()} lately. "
        elif len(recent_moods) == 2:
            mood_intro = f"I notice you've been experiencing {recent_moods[0].lower()} and {recent_moods[1].lower()} recently. "
    
    # Use psychology knowledge if available
    if psychology_context:
        psychology_text = "\n".join(psychology_context)
        return (
            f"{mood_intro}Here's what I know about this:\n\n{psychology_text}\n\n"
            "If you're dealing with ongoing challenges, a mental health "
            "professional can provide personalized support tailored to your "
            "specific situation."
        )
    
    # More natural, conversational responses
    if any(word in user_lower for word in ['tired', 'exhausted', 'fatigue']):
        return (
            f"{mood_intro}Fatigue can really take a toll on both your body and mind. "
            "Sometimes it's our body's way of telling us to slow down. Try to get "
            "consistent sleep, take short breaks throughout your day, and maybe go "
            "for a gentle walk if you can. If you're still feeling drained after "
            "getting good rest, it might be worth checking in with a doctor - "
            "sometimes there's more to it than just being busy."
        )
    
    elif (any(word in user_lower for word in ['sad', 'depressed', 'down', 'blue']) or
          any(word in contexts for word in ['sad', 'down', 'depressed'])):
        return (
            f"{mood_intro}It sounds like you're going through a tough time, and I want "
            "you to know that what you're feeling is valid. Sometimes the best thing "
            "we can do is acknowledge these feelings rather than push them away. Try "
            "doing one small thing you used to enjoy, even if you don't feel like it "
            "right now. And please remember - reaching out for help when you need it "
            "shows incredible strength, not weakness."
        )
    
    elif (any(word in user_lower for word in ['anxious', 'worried', 'nervous', 'stressed']) or
          any(word in contexts for word in ['anxious', 'worried', 'stressed'])):
        return (
            f"{mood_intro}Anxiety can feel overwhelming, but there are some simple "
            "techniques that might help. Try the 4-7-8 breathing: breathe in for 4 "
            "counts, hold for 7, then out for 8. Another helpful trick is the "
            "5-4-3-2-1 grounding method - name 5 things you see, 4 you can touch, "
            "3 you hear, 2 you smell, and 1 you can taste. These techniques can help "
            "bring you back to the present moment when anxiety feels too big."
        )
    
    elif (any(word in user_lower for word in ['overwhelmed', 'stressed', 'pressure']) or
          any(word in contexts for word in ['overwhelmed', 'stressed'])):
        return (
            f"{mood_intro}When everything feels like too much, it's okay to step back "
            "and take things one piece at a time. Try writing down everything on your "
            "mind, then pick just one small thing to focus on first. Don't be afraid "
            "to ask for help - sometimes we need to lean on others. And remember, "
            "it's not selfish to take care of yourself; it's necessary."
        )
    
    elif (any(word in user_lower for word in ['mood', 'feel', 'feeling', 'today', 'log']) or
          'mood' in contexts):
        return (
            f"{mood_intro}I really appreciate that you're taking the time to check in "
            "with yourself - that's such an important part of mental wellness. "
            "Paying attention to your emotional patterns can give you valuable "
            "insights about what's working for you and what might need some attention. "
            "If you notice any concerning patterns, it might be helpful to discuss "
            "them with someone you trust or a mental health professional."
        )
    
    elif any(word in user_lower for word in ['help', 'support', 'advice']):
        return (
            f"{mood_intro}I'm glad you're reaching out. Sometimes just talking about "
            "what's on your mind can make a big difference. If you're going through "
            "something particularly challenging, consider talking to a trusted friend, "
            "family member, or mental health professional. There's no shame in asking "
            "for help when you need it - it's actually one of the bravest things "
            "you can do."
        )
    
    elif any(word in user_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']):
        return (
            f"Hello! {mood_intro}I'm here to listen and support you however I can. "
            "How are you doing today?"
        )
    
    else:
        return (
            f"{mood_intro}Thank you for sharing that with me. Sometimes just putting "
            "our thoughts and feelings into words can be really helpful. If you're "
            "dealing with something that feels bigger than you can handle alone, "
            "please don't hesitate to reach out to someone you trust or a mental "
            "health professional. You don't have to go through difficult times by "
            "yourself."
        )