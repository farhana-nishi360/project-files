from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import re

app = Flask(__name__)
CORS(app)

# ============================================
# CRITICAL: SUICIDE KEYWORDS (EMERGENCY)
# ============================================
SUICIDE_KEYWORDS = [
    'suicide', 'suicidal', 'kill myself', 'kill me', 'end my life',
    'want to die', 'die', 'dying', 'death', 'dead',
    'self harm', 'self-harm', 'selfharm', 'cut myself',
    'end it all', 'end everything', 'no reason to live',
    'better off dead', 'want to disappear', 'don\'t want to live',
    'give up', 'give up on life', 'can\'t go on', 'cannot go on',
    'life is meaningless', 'nothing matters', 'pointless'
]

# Severe keywords (high risk)
SEVERE_KEYWORDS = {
    'hopeless': 0.9, 'worthless': 0.9, 'useless': 0.8,
    'depressed': 0.8, 'anxiety': 0.7, 'panic': 0.7,
    'overwhelmed': 0.7, 'trapped': 0.7, 'alone': 0.6,
    'empty': 0.6, 'numb': 0.7, 'miserable': 0.8
}

@app.route('/api/lumi/sentiment-v2', methods=['POST'])
def lumi_sentiment_v2():
    try:
        data = request.get_json()
        user_text = data.get("text", "").strip().lower()
        
        print(f"🔍 Analyzing: {user_text}")  # Debug
        
        if not user_text:
            return jsonify({
                "status": "empty",
                "message": "Please share how you're feeling."
            })
        
        # ============================================
        # HIGHEST PRIORITY: SUICIDE DETECTION
        # ============================================
        for keyword in SUICIDE_KEYWORDS:
            if keyword in user_text:
                print(f"🚨 SUICIDE KEYWORD DETECTED: {keyword}")
                return jsonify({
                    "status": "severe",
                    "message": "I'm really concerned about what you're sharing. Please know that you're not alone and help is available. Would you like to talk to a professional right now?",
                    "suggestion": "expert",
                    "is_emergency": True,
                    "actions": [
                        {"type": "expert", "label": "🚨 Talk to an Expert Now", "icon": "fa-user-md"},
                        {"type": "helpline", "label": "📞 Crisis Helpline", "icon": "fa-phone"},
                        {"type": "breathing", "label": "🌊 Calming Exercise", "icon": "fa-spa"}
                    ]
                })
        
        # ============================================
        # SECOND LEVEL: Severe keywords
        # ============================================
        for keyword, weight in SEVERE_KEYWORDS.items():
            if keyword in user_text and weight >= 0.8:
                return jsonify({
                    "status": "severe",
                    "message": "What you're sharing sounds really heavy. Please consider talking to someone who can provide professional support.",
                    "suggestion": "expert",
                    "is_emergency": True,
                    "actions": [
                        {"type": "expert", "label": "Talk to an Expert", "icon": "fa-user-md"},
                        {"type": "booking", "label": "Book a Session", "icon": "fa-calendar-check"},
                        {"type": "breathing", "label": "Breathing Exercise", "icon": "fa-spa"}
                    ]
                })
        
        # ============================================
        # THIRD LEVEL: TextBlob + Other analysis
        # ============================================
        blob = TextBlob(user_text)
        polarity = blob.sentiment.polarity
        word_count = len(user_text.split())
        
        # Moderate detection
        moderate_keywords = ['sad', 'lonely', 'stressed', 'tired', 'confused', 'worried', 'anxious']
        is_moderate = any(word in user_text for word in moderate_keywords)
        
        if polarity <= -0.5:
            return jsonify({
                "status": "moderate",
                "message": "I can sense you're going through a difficult time. Would you like to take our assessment for better understanding?",
                "suggestion": "survey",
                "showSurvey": True,
                "actions": [
                    {"type": "survey", "label": "Take the Assessment", "icon": "fa-poll"},
                    {"type": "meditation", "label": "Try Meditation", "icon": "fa-spa"}
                ]
            })
        elif is_moderate or polarity < 0:
            return jsonify({
                "status": "moderate",
                "message": "I hear you. Sometimes talking things through can help. Would you like to try our survey?",
                "suggestion": "survey",
                "showSurvey": True,
                "actions": [
                    {"type": "survey", "label": "Take the Survey", "icon": "fa-poll"},
                    {"type": "tips", "label": "Writing Tips", "icon": "fa-lightbulb"}
                ]
            })
        elif word_count < 3:
            return jsonify({
                "status": "insufficient",
                "message": "Your message is very short. Please share more, or take our survey for a better understanding.",
                "suggestion": "survey",
                "showSurvey": True,
                "actions": [
                    {"type": "survey", "label": "Take the Survey", "icon": "fa-poll"},
                    {"type": "tips", "label": "Writing Tips", "icon": "fa-lightbulb"}
                ]
            })
        else:
            return jsonify({
                "status": "normal",
                "message": "You seem to be in a stable place. Keep nurturing your mental health!",
                "suggestion": "maintain",
                "actions": [
                    {"type": "maintain", "label": "Self-Care Tips", "icon": "fa-heart"}
                ]
            })
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            "status": "error",
            "message": "Something went wrong. Please try again.",
            "actions": [
                {"type": "survey", "label": "Take the Survey", "icon": "fa-poll"},
                {"type": "retry", "label": "Try Again", "icon": "fa-redo"}
            ]
        })

@app.route('/api/lumi/analyze-survey', methods=['POST'])
def analyze_survey():
    try:
        data = request.get_json()
        phq_scores = data.get('phq_scores', [])
        gad_scores = data.get('gad_scores', [])
        
        total_phq = sum(phq_scores)
        total_gad = sum(gad_scores)
        
        if total_phq >= 15 or total_gad >= 15:
            severity = "severe"
            recommendation = "Your responses indicate significant distress. Please speak with a professional immediately."
        elif total_phq >= 10 or total_gad >= 10:
            severity = "moderate"
            recommendation = "You're showing signs of moderate stress. Consider talking to someone."
        elif total_phq >= 5 or total_gad >= 5:
            severity = "mild"
            recommendation = "You're experiencing mild symptoms. Self-care might help."
        else:
            severity = "normal"
            recommendation = "You seem to be managing well. Keep it up!"
        
        return jsonify({
            "success": True,
            "severity": severity,
            "total_phq": total_phq,
            "total_gad": total_gad,
            "recommendation": recommendation
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error analyzing survey"
        })

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')