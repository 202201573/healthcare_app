import RiskPredictor from './RiskPredictor';

class NLPBot {
    constructor() {
        this.lastContext = null;
        this.negativeWords = new Set([
            'pain', 'hurt', 'scared', 'fear', 'bad', 'worse', 'terrible', 'emergency', 'dying', 'sick', 'ill', 'stress', 'anxious', 'panic',
            'ألم', 'وجع', 'خائف', 'خوف', 'سيء', 'أسوأ', 'طوارئ', 'موت', 'مريض', 'مرض', 'توتر', 'قلق', 'مصاب'
        ]);
        
        this.intents = [
            {
                tag: 'greeting',
                patterns_en: ['hi', 'hello', 'hey', 'start', 'good morning', 'good evening', 'how are you', 'howdy'],
                patterns_ar: ['مرحبا', 'أهلا', 'هلا', 'صباح الخير', 'مساء الخير', 'كيف حالك', 'السلام عليكم', 'سلام', 'تفضل'],
                responses_en: ['Hello! I am PulseGuard AI. How can I assist you with your health today?', 'Hi there! What can I analyze for you today?'],
                responses_ar: ['مرحباً! أنا المساعد الذكي PulseGuard. كيف يمكنني مساعدتك اليوم بخصوص صحتك؟', 'أهلاً بك! ماذا تريد أن أحلل لك اليوم؟']
            },
            {
                tag: 'ask_heart_rate',
                patterns_en: ['what is my heart rate', 'heart rate', 'bpm', 'how is my pulse', 'check my heart', 'pulse', 'heart'],
                patterns_ar: ['ما هو معدل نبضات قلبي', 'سرعة ضربات القلب', 'نبض', 'قلب', 'دقات القلب', 'كم نبضي'],
                responses_en: ['Your live heart rate is {bpm} BPM. A normal resting heart rate for adults ranges from 60 to 100 beats per minute.'],
                responses_ar: ['معدل ضربات قلبك الحالي هو {bpm} نبضة في الدقيقة. المعدل الطبيعي للبالغين يتراوح بين 60 إلى 100 نبضة.']
            },
            {
                tag: 'ask_spo2',
                patterns_en: ['what is my oxygen', 'spo2', 'oxygen level', 'blood oxygen', 'is my oxygen normal', 'oxygen', 'saturation'],
                patterns_ar: ['ما هو مستوى الأكسجين', 'أكسجين', 'مستوى الأكسجين', 'اكسجين الدم', 'نسبة الأكسجين', 'spo2'],
                responses_en: ['Your current SpO2 level is {spo2}%. Normal oxygen saturation values are typically between 95% and 100%.'],
                responses_ar: ['مستوى الأكسجين الحالي في دمك هو {spo2}%. نسبة الأكسجين الطبيعية تتراوح عادة بين 95% و 100%.']
            },
            {
                tag: 'ask_blood_pressure',
                patterns_en: ['what is my blood pressure', 'bp', 'blood pressure', 'systolic', 'diastolic', 'pressure'],
                patterns_ar: ['كم ضغط دمي', 'ضغط الدم', 'الضغط', 'ضغط'],
                responses_en: ['Your blood pressure is currently {sys}/{dia} mmHg. Ideal blood pressure is usually considered to be between 90/60mmHg and 120/80mmHg.'],
                responses_ar: ['ضغط دمك الحالي هو {sys}/{dia} mmHg. ضغط الدم المثالي يعتبر عادة بين 90/60 و 120/80.']
            },
            {
                tag: 'ask_temp',
                patterns_en: ['what is my temperature', 'body temp', 'fever', 'temperature', 'am i hot', 'temp'],
                patterns_ar: ['كم درجة حرارتي', 'درجة الحرارة', 'حرارة', 'حمى', 'هل أعاني من حمى', 'حرارتي'],
                responses_en: ['Your body temperature is {temp}°C. Normal body temperature is usually around 37°C (98.6°F).'],
                responses_ar: ['درجة حرارة جسمك هي {temp}°C. درجة الحرارة الطبيعية للجسم تكون عادة حوالي 37 مئوية.']
            },
            {
                tag: 'ask_risk',
                patterns_en: ['am i at risk', 'risk analysis', 'health risk', 'heart disease risk', 'is my health okay', 'status', 'how am i doing', 'risk', 'disease', 'condition'],
                patterns_ar: ['هل أنا في خطر', 'تحليل المخاطر', 'خطر صحي', 'خطر أمراض القلب', 'كيف حالتي الصحية', 'حالة', 'مخاطر', 'مرض'],
                responses_en: ['Based on your live vitals, your current risk assessment is: {risk}.', 'My ML analysis shows you are currently at: {risk}. This takes into account your live BPM of {bpm} and SpO2 of {spo2}%.'],
                responses_ar: ['بناءً على مؤشراتك الحيوية، مستوى الخطر الصحي لديك هو: {risk}.', 'أظهر تحليل الذكاء الاصطناعي أن حالتك الآن: {risk}. هذا يأخذ في الاعتبار نبضك ({bpm}) ونسبة الأكسجين ({spo2}%).']
            },
            {
                tag: 'app_usage',
                patterns_en: ['how do i use this app', 'app info', 'what does this app do', 'help', 'features', 'how to use', 'explain app', 'app', 'guide'],
                patterns_ar: ['كيف أستخدم هذا التطبيق', 'معلومات التطبيق', 'ماذا يفعل هذا التطبيق', 'مساعدة', 'المميزات', 'تطبيق', 'دليل'],
                responses_en: ['PulseGuard tracks your live vitals like BPM and SpO2 using connected sensors, and uses an advanced AI backend to predict health risks in real-time.'],
                responses_ar: ['يقوم تطبيق PulseGuard بتتبع مؤشراتك الحيوية مثل نبض القلب والأكسجين باستخدام أجهزة استشعار متصلة، ويستخدم الذكاء الاصطناعي للتنبؤ بالمخاطر الصحية.']
            },
            {
                tag: 'sleep_tips',
                patterns_en: ['give me 5 sleep tips', 'how to sleep better', 'sleep tips', 'insomnia', 'can not sleep', 'sleep well', 'sleep', 'tired'],
                patterns_ar: ['أعطني نصائح للنوم', 'كيف أنام بشكل أفضل', 'نصائح النوم', 'أرق', 'لا أستطيع النوم', 'نوم', 'تعبان', 'نعاس'],
                responses_en: ['Here are 5 tips for better sleep:\n1. Stick to a sleep schedule.\n2. Pay attention to what you eat and drink.\n3. Create a restful environment.\n4. Limit daytime naps.\n5. Include physical activity in your daily routine.'],
                responses_ar: ['إليك 5 نصائح لنوم أفضل:\n1. الالتزام بموعد محدد للنوم.\n2. الانتباه لما تأكله وتشربه.\n3. توفير بيئة مريحة.\n4. التقليل من قيلولة النهار.\n5. ممارسة النشاط البدني بانتظام.']
            },
            {
                tag: 'data_insight',
                patterns_en: ['explain my health data', 'data insight', 'latest health data', 'what do my numbers mean', 'insight', 'data', 'explain', 'analytics'],
                patterns_ar: ['اشرح بياناتي الصحية', 'نظرة على البيانات', 'ماذا تعني أرقامي', 'بصيرة', 'بيانات', 'شرح', 'إحصائيات'],
                responses_en: ['Your vitals provide a snapshot of your cardiovascular system. A BPM around {bpm} and SpO2 at {spo2}% indicate how efficiently your heart works and oxygen is delivered.'],
                responses_ar: ['توفر مؤشراتك الحيوية نظرة عامة على صحة قلبك. معدل ضربات القلب {bpm} ونسبة الأكسجين {spo2}% تدل على كفاءة عمل قلبك.']
            },
            {
                tag: 'schedule',
                patterns_en: ['schedule for me', 'health schedule', '7 day schedule', 'routine', 'plan', 'schedule', 'daily routine'],
                patterns_ar: ['جدول زمني لي', 'جدول صحي', 'روتين سريع', 'خطة', 'جدول', 'روتين يومي'],
                responses_en: ['A general health schedule: Wake up at 7AM, drink water, 30 min light exercise. Eat a balanced breakfast. Walk occasionally during work. Dinner by 7PM. Wind down by 10PM for 8 hours of sleep.'],
                responses_ar: ['جدول صحي مقترح: استيقظ في 7 صباحاً، اشرب ماء، مارس رياضة خفيفة لـ30 دقيقة. تناول فطور متوازن. امشِ خلال العمل. العشاء في 7 مساءً. استرح في 10 مساءً لنوم 8 ساعات.']
            },
            {
                tag: 'diet_advice',
                patterns_en: ['what should i eat', 'diet advice', 'healthy food', 'nutrition', 'food', 'diet', 'lose weight', 'meals'],
                patterns_ar: ['ماذا يجب أن آكل', 'نصيحة غذائية', 'طعام صحي', 'تغذية', 'أكل', 'حمية', 'وزن', 'وجبات'],
                responses_en: ['For a healthy heart, focus on fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, sodium, and added sugars. Stay hydrated!'],
                responses_ar: ['لقلب صحي، ركز على الفواكه، الخضروات، الحبوب الكاملة، والبروتينات الخالية من الدهون. قلل من الدهون المشبعة، الصوديوم، والسكريات، واشرب الكثير من الماء!']
            },
            {
                tag: 'exercise_tips',
                patterns_en: ['workout plan', 'exercise tips', 'fitness', 'how to workout', 'gym', 'training', 'cardio', 'exercise'],
                patterns_ar: ['خطة تمرين', 'نصائح رياضية', 'لياقة', 'كيف أتمرن', 'نادي', 'تدريب', 'رياضة', 'تمارين'],
                responses_en: ['Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity a week. Try brisk walking, swimming, or cycling!'],
                responses_ar: ['استهدف ممارسة 150 دقيقة من النشاط المعتدل، أو 75 دقيقة من النشاط المكثف أسبوعياً. جرب المشي السريع، السباحة، أو ركوب الدراجة!']
            },
            {
                tag: 'first_aid',
                patterns_en: ['emergency', 'first aid', 'heart attack symptoms', 'cpr', 'help me', 'pain in chest', 'hurt'],
                patterns_ar: ['طوارئ', 'إسعاف أولي', 'أعراض نوبة قلبية', 'أنقذني', 'وجع في الصدر', 'ألم', 'النجدة'],
                responses_en: ['⚠️ IF THIS IS A MEDICAL EMERGENCY, CALL YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY. Signs of a heart attack include chest pain, shortness of breath, and pain in arms or neck.'],
                responses_ar: ['⚠️ إذا كانت هذه حالة طارئة، اتصل برقم الإسعاف المحلي فوراً. من علامات النوبة القلبية: ألم الصدر، ضيق التنفس، وألم في الذراعين أو الرقبة.']
            },
            {
                tag: 'stress_relief',
                patterns_en: ['i am stressed', 'stress relief', 'anxiety', 'feel anxious', 'calm down', 'meditation', 'stress'],
                patterns_ar: ['أنا متوتر', 'تخفيف التوتر', 'قلق', 'أشعر بالقلق', 'أهدأ', 'تأمل', 'توتر'],
                responses_en: ['To relieve stress, try deep breathing exercises (inhale for 4s, hold for 4s, exhale for 6s). Stepping away to meditate can help lower your heart rate, which is currently at {bpm} BPM.'],
                responses_ar: ['لتخفيف التوتر، جرب تمارين التنفس العميق (شهيق لـ4 ثوانٍ، كتم لـ4 ثوانٍ، زفير لـ6 ثوانٍ). التأمل قد يخفض معدل ضربات قلبك، وهو الآن {bpm}.']
            },
            {
                tag: 'follow_up',
                patterns_en: ['is that high', 'is that normal', 'is that bad', 'is that okay', 'explain more', 'what does that mean', 'why'],
                patterns_ar: ['هل هذا مرتفع', 'هل هذا طبيعي', 'هل هذا سيء', 'هل يعقل هذا', 'اشرح لي أكثر', 'ماذا يعني', 'لماذا'],
                responses_en: [], 
                responses_ar: [] 
            }
        ];

        this.stopWordsEn = new Set(["a", "an", "the", "and", "or", "but", "is", "are", "am", "it", "to", "for", "with", "my", "of", "in", "on", "what", "how", "do", "i", "me", "this", "that"]);
        this.stopWordsAr = new Set(["في", "من", "على", "إلى", "عن", "مع", "هل", "ما", "كيف", "و", "أو", "هو", "هي", "أنا", "يا"]);
        
        this.vocabulary = new Set();
        this.wordIDF = {};
        this.totalPatterns = 0;
        
        this.buildVocabulary();
        this.calculateIDF();
    }

    isArabic(word) {
        return /[\u0600-\u06FF]/.test(word);
    }

    buildVocabulary() {
        this.intents.forEach(intent => {
            const allPatterns = [...intent.patterns_en, ...intent.patterns_ar];
            allPatterns.forEach(pattern => {
                const words = pattern.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/);
                words.forEach(w => {
                    const stemmed = this.stem(w);
                    if (stemmed && !this.stopWordsEn.has(stemmed) && !this.stopWordsAr.has(stemmed)) {
                        this.vocabulary.add(stemmed);
                    }
                });
            });
        });
    }

    levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        let matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
        for (let i = 0; i <= a.length; i += 1) { matrix[i][0] = i; }
        for (let j = 0; j <= b.length; j += 1) { matrix[0][j] = j; }
        for (let i = 1; i <= a.length; i += 1) {
            for (let j = 1; j <= b.length; j += 1) {
                let cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // deletion
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        return matrix[a.length][b.length];
    }

    correctTypo(word) {
        if (this.vocabulary.has(word)) return word;
        let closestWord = word;
        let minDistance = 3; 

        this.vocabulary.forEach(vWord => {
            const dist = this.levenshtein(word, vWord);
            if (dist < minDistance && Math.abs(word.length - vWord.length) <= 2) {
                minDistance = dist;
                closestWord = vWord;
            }
        });
        return closestWord;
    }

    stem(word) {
        if (this.isArabic(word)) return word; // Do not apply english stemming rules to Arabic text
        if (word.endsWith('ing') && word.length > 4) return word.replace(/ing$/, '');
        if (word.endsWith('es') && word.length > 4) return word.replace(/es$/, '');
        if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss')) return word.replace(/s$/, '');
        return word;
    }

    tokenizeAndCorrect(text) {
        const rawTokens = text.toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, '')
            .split(/\s+/)
            .filter(word => word.length > 0 && !this.stopWordsEn.has(word) && !this.stopWordsAr.has(word))
            .map(word => this.stem(word));
        
        return rawTokens.map(word => this.correctTypo(word));
    }

    calculateIDF() {
        let dfMap = {};
        this.intents.forEach(intent => {
            const allPatterns = [...intent.patterns_en, ...intent.patterns_ar];
            allPatterns.forEach(pattern => {
                this.totalPatterns++;
                let uniqueTokens = new Set(this.tokenizeAndCorrect(pattern));
                uniqueTokens.forEach(token => {
                    dfMap[token] = (dfMap[token] || 0) + 1;
                });
            });
        });

        for (let token in dfMap) {
            this.wordIDF[token] = Math.log(this.totalPatterns / dfMap[token]);
        }
    }

    getTFIDFScore(inputTokens, patternText) {
        const patternTokens = this.tokenizeAndCorrect(patternText);
        let score = 0;
        
        inputTokens.forEach(token => {
            if (patternTokens.includes(token)) {
                score += (this.wordIDF[token] || 1); 
            }
        });
        return score;
    }

    analyzeSentiment(text) {
        let negativityScore = 0;
        const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/);
        words.forEach(w => {
            if (this.negativeWords.has(this.stem(w))) negativityScore++;
        });
        return negativityScore;
    }

    predictIntent(text) {
        const inputTokens = this.tokenizeAndCorrect(text);
        if (inputTokens.length === 0) return null;

        let bestMatch = { tag: null, score: 0 };

        this.intents.forEach(intent => {
            let maxPatternScore = 0;
            const allPatterns = [...intent.patterns_en, ...intent.patterns_ar];

            allPatterns.forEach(pattern => {
                const score = this.getTFIDFScore(inputTokens, pattern);
                if (score > maxPatternScore) {
                    maxPatternScore = score;
                }
            });

            if (maxPatternScore > bestMatch.score) {
                bestMatch = { tag: intent.tag, score: maxPatternScore };
            }
        });

        if (bestMatch.score > 0.3) {
            return bestMatch.tag;
        }
        return null;
    }

    handleFollowUp(lang) {
        if (lang === 'ar') {
            switch(this.lastContext) {
                case 'ask_heart_rate':
                    return "بشكل عام، من 60 إلى 100 نبضة يعتبر طبيعياً. إذا كنت مسترخياً فقد يكون أقل، وإذا كنت متوتراً فقد يكون أعلى.";
                case 'ask_spo2':
                    return "نسبة الأكسجين يجب أن تكون بين 95% و 100%. أي شيء أقل من 90% يتطلب رعاية طبية فورية.";
                case 'ask_blood_pressure':
                    return "الضغط الصحي يكون بين 90/60 و 120/80. إذا كان خارج هذا النطاق بشكل كبير فقد يشير لارتفاع أو انخفاض.";
                case 'ask_risk':
                    return "يتم حساب الخطر عبر نموذج ذكاء اصطناعي (الانحدار اللوجستي) والذي يقارن نمط نبضك والأكسجين مع بيانات طبية واسعة.";
                default:
                    return "عذرًا، يبدو أنني فقدت مسار الموضوع. هل يمكنك إعادة سؤالك؟";
            }
        } else {
            switch(this.lastContext) {
                case 'ask_heart_rate':
                    return "Generally, between 60 and 100 BPM is considered normal. If you are very relaxed or athletic, it might be lower. If you're stressed or active, it will be higher.";
                case 'ask_spo2':
                    return "SpO2 should sit comfortably between 95% and 100%. Anything below 90% typically requires immediate medical attention as it indicates low oxygen in your blood.";
                case 'ask_blood_pressure':
                    return "A healthy bracket is 90/60 to 120/80. If yours is wildly outside this bracket, it may indicate hypertension (high) or hypotension (low).";
                case 'ask_risk':
                    return "Your risk is calculated via an AI Logistic Regression model matching your oxygen and heart rate patterns against large cardiovascular datasets.";
                default:
                    return "I'm sorry, I seem to have lost track of our topic. Could you please ask your original question again?";
            }
        }
    }

    getRandomResponse(tag, lang) {
        if (tag === 'follow_up') {
            return this.handleFollowUp(lang);
        }

        const intent = this.intents.find(i => i.tag === tag);
        if (!intent) {
            return lang === 'ar' 
                ? "لست متأكداً كيف أجيب على هذا بعد! هل يمكنني مساعدتك بخصوص النبض، الضغط، أو نصائح طبية؟"
                : "I'm not exactly sure how to answer that yet! Can I help you analyze your blood pressure, heart rate, or maybe give some diet tips?";
        }
        
        if (tag !== 'greeting' && tag !== 'app_usage') {
            this.lastContext = tag;
        }
        
        const responsesArray = lang === 'ar' ? intent.responses_ar : intent.responses_en;
        const randomIndex = Math.floor(Math.random() * responsesArray.length);
        return responsesArray[randomIndex];
    }

    getResponse(inputText, liveData) {
        const lang = this.isArabic(inputText) ? 'ar' : 'en';
        
        const intentTag = this.predictIntent(inputText);
        
        const negativity = this.analyzeSentiment(inputText);
        let prefix = "";
        if (negativity >= 1 && intentTag !== 'first_aid') {
            prefix = lang === 'ar' ? "يبدو أنك تشعر بالضيق أو التعب. " : "It sounds like you might be distressed. ";
        }

        let responseText = this.getRandomResponse(intentTag, lang);

        if (responseText) {
             const mlPrediction = RiskPredictor.predict(liveData.bpm, liveData.spo2);
             
             let riskTranslated = mlPrediction.riskLabel;
             if (lang === 'ar') {
                 if (riskTranslated === 'Low Risk') riskTranslated = 'مخاطر منخفضة';
                 if (riskTranslated === 'Elevated Risk') riskTranslated = 'مخاطر مرتفعة';
                 if (riskTranslated === 'High Risk') riskTranslated = 'مخاطر عالية جدًا';
             }

             responseText = responseText.replace(/{bpm}/g, liveData.bpm)
                                        .replace(/{spo2}/g, liveData.spo2)
                                        .replace(/{sys}/g, liveData.sys)
                                        .replace(/{dia}/g, liveData.dia)
                                        .replace(/{temp}/g, liveData.temp)
                                        .replace(/{risk}/g, riskTranslated);
        }

        return prefix + responseText;
    }
}

export default new NLPBot();
