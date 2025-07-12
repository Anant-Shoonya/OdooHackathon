// Simple rule-based sentiment analysis and content filtering
// This provides a free alternative to paid AI services

interface SentimentResult {
  isAppropriate: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

// Lists of words for sentiment and appropriateness analysis
const positiveWords = [
  'excellent', 'amazing', 'great', 'fantastic', 'wonderful', 'awesome', 'perfect',
  'outstanding', 'brilliant', 'superb', 'incredible', 'helpful', 'friendly',
  'professional', 'skilled', 'knowledgeable', 'patient', 'reliable', 'efficient',
  'creative', 'innovative', 'talented', 'dedicated', 'thorough', 'responsive',
  'good', 'nice', 'pleased', 'satisfied', 'happy', 'impressed', 'recommend'
];

const negativeWords = [
  'terrible', 'awful', 'horrible', 'bad', 'poor', 'disappointing', 'frustrating',
  'annoying', 'useless', 'worthless', 'incompetent', 'unprofessional', 'rude',
  'slow', 'late', 'unreliable', 'difficult', 'problematic', 'issues', 'problems',
  'failed', 'failure', 'wrong', 'mistake', 'error', 'waste', 'regret'
];

const inappropriateWords = [
  // Profanity and offensive terms
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'fool', 'jerk', 'loser',
  'hate', 'disgusting', 'pathetic', 'ridiculous', 'absurd', 'crazy', 'insane',
  
  // Personal attacks
  'ugly', 'fat', 'dumb', 'worthless', 'failure', 'reject', 'scam', 'fraud',
  'cheat', 'liar', 'dishonest', 'criminal', 'thief', 'steal', 'stolen',
  
  // Discriminatory language indicators
  'discriminate', 'racist', 'sexist', 'bigot', 'prejudice', 'bias', 'unfair',
  
  // Threatening language
  'threat', 'threaten', 'harm', 'hurt', 'attack', 'violence', 'dangerous',
  'revenge', 'payback', 'destroy', 'ruin', 'kill', 'die', 'death'
];

export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return {
      isAppropriate: false,
      sentiment: 'neutral',
      confidence: 0
    };
  }

  const cleanText = text.toLowerCase().trim();
  const words = cleanText.split(/\s+/);

  // Check for inappropriate content first
  const hasInappropriateContent = inappropriateWords.some(word => 
    cleanText.includes(word.toLowerCase())
  );

  if (hasInappropriateContent) {
    return {
      isAppropriate: false,
      sentiment: 'negative',
      confidence: 0.9
    };
  }

  // Count positive and negative words
  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveScore++;
    } else if (negativeWords.includes(word)) {
      negativeScore++;
    }
  });

  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let confidence = 0;

  if (positiveScore > negativeScore) {
    sentiment = 'positive';
    confidence = Math.min(0.9, (positiveScore / words.length) * 3);
  } else if (negativeScore > positiveScore) {
    sentiment = 'negative';
    confidence = Math.min(0.9, (negativeScore / words.length) * 3);
  } else {
    sentiment = 'neutral';
    confidence = 0.5;
  }

  // Additional checks for appropriateness
  const isAppropriate = sentiment !== 'negative' || confidence < 0.6;

  return {
    isAppropriate,
    sentiment,
    confidence: Math.max(0.1, confidence)
  };
}

export function filterReviews(reviews: any[]): any[] {
  return reviews
    .map(review => ({
      ...review,
      sentimentAnalysis: analyzeSentiment(review.comment || '')
    }))
    .filter(review => review.sentimentAnalysis.isAppropriate)
    .sort((a, b) => {
      // Sort by sentiment score first (positive first), then by rating
      if (a.sentimentAnalysis.sentiment === 'positive' && b.sentimentAnalysis.sentiment !== 'positive') {
        return -1;
      }
      if (b.sentimentAnalysis.sentiment === 'positive' && a.sentimentAnalysis.sentiment !== 'positive') {
        return 1;
      }
      return b.rating - a.rating;
    });
}