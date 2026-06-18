from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
# CORS এনাবল করা হলো যাতে ফ্রন্টএন্ড কোনো ব্লকিং ছাড়া ব্যাকএন্ডের সাথে যোগাযোগ করতে পারে
CORS(app)

@app.route('/api/lumi/sentiment', methods=['POST'])
def lumi_sentiment_analysis():
    try:
        # ফ্রন্টএন্ড থেকে আসা JSON ডাটা রিসিভ করা
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'status': 'normal', 'polarity': 0, 'error': 'No text provided'}), 400
            
        user_text = data.get('text', '')
        
        if not user_text.strip():
            return jsonify({'status': 'normal', 'polarity': 0})
            
        # TextBlob দিয়ে রিয়েল-টাইম Sentiment/Emotion অ্যানালাইসিস
        blob = TextBlob(user_text)
        polarity = blob.sentiment.polarity  # মান থাকে -1.0 (Severe) থেকে +1.0 (Positive) এর মধ্যে
        
        # ইউজার যে শব্দগুলো ব্যবহার করেছে তার উপর ভিত্তি করে লুমির কন্ডিশন নির্ধারণ
        if polarity < -0.3:
            # খুব বেশি নেতিবাচক শব্দ বা গভীর মানসিক চাপের কথা থাকলে
            condition_status = "severe"      
        elif -0.3 <= polarity < 0.1:
            # হালকা মন খারাপ, উদ্বেগ বা মিশ্র অনুভূতি থাকলে
            condition_status = "moderate"    
        else:
            # স্বাভাবিক বা ভালো অনুভূতি প্রকাশ করলে
            condition_status = "normal"      
            
        return jsonify({
            'status': condition_status,
            'polarity': polarity
        })

    except Exception as e:
        # কোনো কারণে সার্ভার ক্র্যাশ করলে সেফটি ফলব্যাক হিসেবে 'normal' রিটার্ন করবে
        print(f"Error in Lumi Sentiment Engine: {e}")
        return jsonify({'status': 'normal', 'polarity': 0, 'error': str(e)}), 500

if __name__ == '__main__':
    # সার্ভারটি ৩০০০ পোর্টে রান হবে
    print("Lumi AI Engine is running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)