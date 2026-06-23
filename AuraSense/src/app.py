from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)

CORS(app)

@app.route('/api/lumi/sentiment', methods=['POST'])
def lumi_sentiment_analysis():
    try:
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'status': 'normal', 'polarity': 0, 'error': 'No text provided'}), 400
            
        user_text = data.get('text', '')
        
        if not user_text.strip():
            return jsonify({'status': 'normal', 'polarity': 0})
            
       
        blob = TextBlob(user_text)
        polarity = blob.sentiment.polarity  
        
       
        if polarity < -0.3:
           
            condition_status = "severe"      
        elif -0.3 <= polarity < 0.1:
           
            condition_status = "moderate"    
        else:
          
            condition_status = "normal"      
            
        return jsonify({
            'status': condition_status,
            'polarity': polarity
        })

    except Exception as e:
       
        print(f"Error in Lumi Sentiment Engine: {e}")
        return jsonify({'status': 'normal', 'polarity': 0, 'error': str(e)}), 500

if __name__ == '__main__':
    
    print("Lumi AI Engine is running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)