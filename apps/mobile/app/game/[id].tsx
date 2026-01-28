import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, getRandomQuestions, QuizQuestion } from '../../src/stores/gameStore';
import { usePetStore } from '../../src/stores/petStore';

type GameState = 'ready' | 'playing' | 'paused' | 'gameover';

const GAME_CONFIG = {
  'crypto-quiz': {
    name: 'Crypto Quiz',
    questionCount: 10,
    timePerQuestion: 15,
    baseXP: 30,
    maxPlays: 3,
  },
};

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recordPlay, addSession, updateHighScore, getHighScore, getTodayPlays } = useGameStore();
  const { addXp } = usePetStore();

  const config = GAME_CONFIG[id as keyof typeof GAME_CONFIG];

  const [gameState, setGameState] = useState<GameState>('ready');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(config?.timePerQuestion || 15);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const comboAnim = useRef(new Animated.Value(0)).current;
  const timerColorAnim = useRef(new Animated.Value(0)).current;

  // Initialize game
  useEffect(() => {
    if (id === 'crypto-quiz') {
      const randomQuestions = getRandomQuestions(config.questionCount);
      setQuestions(randomQuestions);
    }
  }, [id]);

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && !showResult) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return config.timePerQuestion;
          }

          // Animate timer when low
          if (prev <= 5) {
            Animated.sequence([
              Animated.timing(timerColorAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false,
              }),
              Animated.timing(timerColorAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
              }),
            ]).start();
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, showResult, currentIndex]);

  const handleTimeout = useCallback(() => {
    setCombo(0);
    setShowResult(true);
    setSelectedAnswer(-1); // Mark as timed out

    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    setTimeout(() => nextQuestion(), 1500);
  }, [currentIndex]);

  const startGame = () => {
    recordPlay(id);
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectAnswers(0);
    setTimeLeft(config.timePerQuestion);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === questions[currentIndex].correctIndex;

    if (isCorrect) {
      // Calculate score with combo and time bonus
      const timeBonus = Math.floor(timeLeft * 5);
      const comboMultiplier = 1 + (combo * 0.2);
      const questionScore = Math.floor((100 + timeBonus) * comboMultiplier);

      setScore((prev) => prev + questionScore);
      setCombo((prev) => {
        const newCombo = prev + 1;
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        return newCombo;
      });
      setCorrectAnswers((prev) => prev + 1);

      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      // Combo animation
      if (combo >= 2) {
        Animated.sequence([
          Animated.timing(comboAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(comboAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    } else {
      setCombo(0);

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      endGame();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(config.timePerQuestion);
    }
  };

  const endGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setGameState('gameover');

    // Calculate XP
    const accuracy = correctAnswers / questions.length;
    const xpEarned = Math.floor(config.baseXP * accuracy * (1 + maxCombo * 0.1));

    addXp(xpEarned);

    // Check high score
    const newHigh = updateHighScore(id, score);
    setIsNewHighScore(newHigh);

    // Record session
    addSession({
      gameType: id,
      score,
      xpEarned,
      details: {
        correctAnswers,
        totalQuestions: questions.length,
        maxCombo,
        accuracy: Math.round(accuracy * 100),
      },
    });
  };

  const timerColor = timerColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#ef4444'],
  });

  if (!config) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Game not found</Text>
      </SafeAreaView>
    );
  }

  const renderReady = () => (
    <View style={styles.readyContainer}>
      <View style={styles.gameIcon}>
        <Ionicons name="help-circle" size={64} color="#e94560" />
      </View>

      <Text style={styles.gameTitle}>{config.name}</Text>
      <Text style={styles.gameDesc}>
        Answer {config.questionCount} questions as fast as you can!
      </Text>

      <View style={styles.rulesContainer}>
        <View style={styles.ruleItem}>
          <Ionicons name="time-outline" size={20} color="#fbbf24" />
          <Text style={styles.ruleText}>{config.timePerQuestion}s per question</Text>
        </View>
        <View style={styles.ruleItem}>
          <Ionicons name="flash" size={20} color="#e94560" />
          <Text style={styles.ruleText}>Build combos for bonus points</Text>
        </View>
        <View style={styles.ruleItem}>
          <Ionicons name="star" size={20} color="#ffd700" />
          <Text style={styles.ruleText}>Earn up to +{config.baseXP} XP</Text>
        </View>
      </View>

      <View style={styles.highScoreBox}>
        <Text style={styles.highScoreLabel}>High Score</Text>
        <Text style={styles.highScoreValue}>{getHighScore(id)}</Text>
      </View>

      <View style={styles.playsInfo}>
        <Text style={styles.playsText}>
          {getTodayPlays(id)}/{config.maxPlays} plays today
        </Text>
      </View>

      <Pressable style={styles.startButton} onPress={startGame}>
        <Ionicons name="play" size={24} color="#fff" />
        <Text style={styles.startButtonText}>Start Game</Text>
      </Pressable>

      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkText}>Back to Games</Text>
      </Pressable>
    </View>
  );

  const renderPlaying = () => {
    const question = questions[currentIndex];
    if (!question) return null;

    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <Animated.View
        style={[
          styles.playingContainer,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.gameHeader}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentIndex + 1}/{questions.length}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Score</Text>
              <Animated.Text style={[styles.statValue, { transform: [{ scale: scaleAnim }] }]}>
                {score}
              </Animated.Text>
            </View>

            <View style={styles.timerContainer}>
              <Animated.Text style={[styles.timerText, { color: timerColor }]}>
                {timeLeft}
              </Animated.Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Combo</Text>
              <Text style={[styles.statValue, combo >= 3 && styles.comboHot]}>
                x{combo}
              </Text>
            </View>
          </View>
        </View>

        {/* Combo popup */}
        <Animated.View
          style={[
            styles.comboPopup,
            {
              opacity: comboAnim,
              transform: [
                {
                  scale: comboAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.comboPopupText}>🔥 {combo}x COMBO!</Text>
        </Animated.View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{question.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            let optionStyle = styles.optionButton;
            let textStyle = styles.optionText;

            if (showResult) {
              if (index === question.correctIndex) {
                optionStyle = { ...styles.optionButton, ...styles.optionCorrect };
                textStyle = { ...styles.optionText, color: '#4ade80' };
              } else if (index === selectedAnswer && selectedAnswer !== question.correctIndex) {
                optionStyle = { ...styles.optionButton, ...styles.optionWrong };
                textStyle = { ...styles.optionText, color: '#ef4444' };
              }
            } else if (index === selectedAnswer) {
              optionStyle = { ...styles.optionButton, ...styles.optionSelected };
            }

            return (
              <Pressable
                key={index}
                style={optionStyle}
                onPress={() => handleAnswer(index)}
                disabled={showResult}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={textStyle}>{option}</Text>
                {showResult && index === question.correctIndex && (
                  <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                )}
                {showResult && index === selectedAnswer && selectedAnswer !== question.correctIndex && (
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderGameOver = () => {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const xpEarned = Math.floor(config.baseXP * (accuracy / 100) * (1 + maxCombo * 0.1));

    return (
      <View style={styles.gameOverContainer}>
        {isNewHighScore && (
          <View style={styles.newHighScoreBanner}>
            <Ionicons name="trophy" size={24} color="#ffd700" />
            <Text style={styles.newHighScoreText}>NEW HIGH SCORE!</Text>
          </View>
        )}

        <Text style={styles.gameOverTitle}>Game Over!</Text>

        <View style={styles.finalScoreContainer}>
          <Text style={styles.finalScoreLabel}>Final Score</Text>
          <Text style={styles.finalScoreValue}>{score}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={28} color="#4ade80" />
            <Text style={styles.statBoxValue}>{correctAnswers}/{questions.length}</Text>
            <Text style={styles.statBoxLabel}>Correct</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="analytics" size={28} color="#60a5fa" />
            <Text style={styles.statBoxValue}>{accuracy}%</Text>
            <Text style={styles.statBoxLabel}>Accuracy</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="flame" size={28} color="#f97316" />
            <Text style={styles.statBoxValue}>x{maxCombo}</Text>
            <Text style={styles.statBoxLabel}>Max Combo</Text>
          </View>
        </View>

        <View style={styles.xpReward}>
          <Ionicons name="star" size={32} color="#ffd700" />
          <Text style={styles.xpRewardText}>+{xpEarned} XP Earned!</Text>
        </View>

        <View style={styles.gameOverActions}>
          {getTodayPlays(id) < config.maxPlays && (
            <Pressable style={styles.playAgainButton} onPress={startGame}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>
          )}

          <Pressable style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitButtonText}>Back to Games</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: gameState === 'playing' ? '' : config.name,
          headerShown: gameState !== 'playing',
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
        }}
      />

      {gameState === 'ready' && renderReady()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'gameover' && renderGameOver()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },

  // Ready State
  readyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  gameIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  gameDesc: {
    fontSize: 16,
    color: '#8b8b8b',
    textAlign: 'center',
    marginBottom: 32,
  },
  rulesContainer: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleText: {
    fontSize: 15,
    color: '#d1d1d1',
  },
  highScoreBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  highScoreLabel: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  highScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  playsInfo: {
    marginBottom: 24,
  },
  playsText: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    fontSize: 16,
    color: '#8b8b8b',
  },

  // Playing State
  playingContainer: {
    flex: 1,
    padding: 20,
  },
  gameHeader: {
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
  },
  progressText: {
    fontSize: 14,
    color: '#8b8b8b',
    minWidth: 50,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: '#8b8b8b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  comboHot: {
    color: '#f97316',
  },
  timerContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0f3460',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  comboPopup: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  comboPopupText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f97316',
    textShadowColor: 'rgba(249, 115, 22, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  questionContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    minHeight: 150,
    justifyContent: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f3460',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e94560',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  optionSelected: {
    borderColor: '#e94560',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  optionCorrect: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f3460',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },

  // Game Over State
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  newHighScoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  newHighScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  finalScoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  finalScoreLabel: {
    fontSize: 16,
    color: '#8b8b8b',
    marginBottom: 8,
  },
  finalScoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 4,
  },
  xpReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
  },
  xpRewardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  gameOverActions: {
    width: '100%',
    gap: 12,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  exitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
