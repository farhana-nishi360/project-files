from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

SUICIDE_KEYWORDS = [
    "suicide",
    "suicidal",
    "kill myself",
    "end my life",
    "want to die",
    "die",
    "don't want to live",
    "self harm",
    "self-harm",
    "end it all",
    "no reason to live"
]

@app.route('/api/lumi/sentiment', methods=['POST'])
def lumi_sentiment_analysis():

    data = request.get_json()
    user_text = data.get("text", "").lower()

    # Highest priority
    if any(word in user_text for word in SUICIDE_KEYWORDS):
        return jsonify({
            "status": "severe",
            "polarity": -1,
            "recommendation": "Please seek immediate professional support."
        })

    polarity = TextBlob(user_text).sentiment.polarity
    if polarity <= -0.60:
      condition_status = "severe"
      recommendation = "Please seek immediate professional support."

    elif polarity < 0:
      condition_status = "moderate"
      recommendation = "Take some rest and talk with someone you trust."

    else:
      condition_status = "normal"
      recommendation = "Your mood appears stable."

    
    
    return jsonify({
        "status": status,
        "polarity": polarity,
        "recommendation": recommendation
    })

if __name__ == "__main__":
    app.run(debug=True)