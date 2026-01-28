import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useModulesStore, Lesson, QuizQuestion } from '../../src/stores/modulesStore';
import { usePetStore } from '../../src/stores/petStore';
import { BadgeUnlocked } from '../../src/components/rewards';

type ViewState = 'overview' | 'lesson' | 'quiz' | 'complete';

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getModule, getModuleProgress, isLessonCompleted, completeLesson, completeQuiz, mintBadge, progress } = useModulesStore();
  const { addXp } = usePetStore();

  const module = getModule(id);
  const moduleProgress = progress.find(p => p.moduleId === id);

  const [viewState, setViewState] = useState<ViewState>('overview');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate content transitions
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [viewState, currentLesson, currentQuestionIndex]);

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Module not found</Text>
      </SafeAreaView>
    );
  }

  const allLessonsCompleted = module.lessons.every(lesson =>
    isLessonCompleted(module.id, lesson.id)
  );

  const quizPassed = moduleProgress?.quizScore !== null && moduleProgress?.quizScore !== undefined && moduleProgress.quizScore >= 70;
  const canTakeQuiz = allLessonsCompleted;

  const startLesson = (lesson: Lesson) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    setCurrentLesson(lesson);
    setViewState('lesson');
  };

  const finishLesson = () => {
    if (currentLesson) {
      completeLesson(module.id, currentLesson.id);
      addXp(20); // Small XP for completing a lesson
    }
    setCurrentLesson(null);
    setViewState('overview');
  };

  const startQuiz = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizAnswers([]);
    setViewState('quiz');
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === module.quiz.questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setQuizAnswers(prev => [...prev, isCorrect]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < module.quiz.questions.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz finished
      const finalScore = Math.round((quizScore / module.quiz.questions.length) * 100);
      completeQuiz(module.id, finalScore);

      if (finalScore >= 70) {
        addXp(module.xpReward);
        mintBadge(module.id);
        setShowBadgeModal(true);
      }

      setViewState('complete');
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.moduleHeader}>
        <View style={styles.moduleIconLarge}>
          <Ionicons
            name={module.icon as keyof typeof Ionicons.glyphMap}
            size={48}
            color="#e94560"
          />
        </View>
        <Text style={styles.moduleName}>{module.name}</Text>
        <Text style={styles.moduleDesc}>{module.description}</Text>

        <View style={styles.progressOverview}>
          <View style={styles.progressBarLarge}>
            <View style={[styles.progressFillLarge, { width: `${getModuleProgress(module.id)}%` }]} />
          </View>
          <Text style={styles.progressTextLarge}>{getModuleProgress(module.id)}% Complete</Text>
        </View>

        <View style={styles.rewardBadge}>
          <Ionicons name="trophy" size={20} color="#ffd700" />
          <Text style={styles.rewardText}>+{module.xpReward} XP on completion</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lessons</Text>
        {module.lessons.map((lesson, index) => {
          const completed = isLessonCompleted(module.id, lesson.id);
          return (
            <Pressable
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => startLesson(lesson)}
            >
              <View style={[styles.lessonNumber, completed && styles.lessonNumberCompleted]}>
                {completed ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text style={styles.lessonNumberText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDesc}>{lesson.description}</Text>
                <View style={styles.lessonMeta}>
                  <Ionicons name="time-outline" size={14} color="#8b8b8b" />
                  <Text style={styles.lessonDuration}>{lesson.duration} min</Text>
                </View>
              </View>
              <Ionicons
                name={completed ? "checkmark-circle" : "chevron-forward"}
                size={24}
                color={completed ? "#4ade80" : "#8b8b8b"}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quiz</Text>
        <Pressable
          style={[styles.quizCard, !canTakeQuiz && styles.quizCardLocked]}
          onPress={() => canTakeQuiz && startQuiz()}
          disabled={!canTakeQuiz}
        >
          <View style={styles.quizIcon}>
            <Ionicons
              name={quizPassed ? "checkmark-circle" : "help-circle"}
              size={32}
              color={quizPassed ? "#4ade80" : (!canTakeQuiz ? "#666" : "#e94560")}
            />
          </View>
          <View style={styles.quizInfo}>
            <Text style={[styles.quizTitle, !canTakeQuiz && styles.textLocked]}>
              Knowledge Check
            </Text>
            <Text style={[styles.quizDesc, !canTakeQuiz && styles.textLocked]}>
              {quizPassed
                ? `Passed with ${moduleProgress?.quizScore}%`
                : canTakeQuiz
                  ? `${module.quiz.questions.length} questions - 70% to pass`
                  : 'Complete all lessons first'}
            </Text>
          </View>
          {!canTakeQuiz && (
            <Ionicons name="lock-closed" size={20} color="#666" />
          )}
          {quizPassed && (
            <View style={styles.passedBadge}>
              <Text style={styles.passedText}>PASSED</Text>
            </View>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderLesson = () => {
    if (!currentLesson) return null;

    const lessonContent = getLessonContent(currentLesson.id);

    return (
      <Animated.View
        style={[
          styles.lessonContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <ScrollView style={styles.lessonScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonTitleLarge}>{currentLesson.title}</Text>
            <View style={styles.lessonMetaLarge}>
              <Ionicons name="time-outline" size={16} color="#8b8b8b" />
              <Text style={styles.lessonDurationLarge}>{currentLesson.duration} min read</Text>
            </View>
          </View>

          <View style={styles.lessonContent}>
            {lessonContent.map((block, index) => renderContentBlock(block, index))}
          </View>
        </ScrollView>

        <View style={styles.lessonFooter}>
          <Pressable style={styles.completeButton} onPress={finishLesson}>
            <Text style={styles.completeButtonText}>
              {isLessonCompleted(module.id, currentLesson.id) ? 'Review Complete' : 'Mark as Complete'}
            </Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        return (
          <Text key={index} style={styles.contentHeading}>{block.content}</Text>
        );
      case 'paragraph':
        return (
          <Text key={index} style={styles.contentParagraph}>{block.content}</Text>
        );
      case 'tip':
        return (
          <View key={index} style={styles.tipBox}>
            <Ionicons name="bulb" size={20} color="#fbbf24" />
            <Text style={styles.tipText}>{block.content}</Text>
          </View>
        );
      case 'warning':
        return (
          <View key={index} style={styles.warningBox}>
            <Ionicons name="warning" size={20} color="#ef4444" />
            <Text style={styles.warningText}>{block.content}</Text>
          </View>
        );
      case 'list':
        return (
          <View key={index} style={styles.listContainer}>
            {block.items?.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        );
      case 'image':
        return (
          <View key={index} style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#666" />
              <Text style={styles.imagePlaceholderText}>{block.caption || 'Illustration'}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderQuiz = () => {
    const question = module.quiz.questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / module.quiz.questions.length) * 100;

    return (
      <Animated.View
        style={[
          styles.quizContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.quizProgress}>
          <View style={styles.quizProgressBar}>
            <View style={[styles.quizProgressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.quizProgressText}>
            Question {currentQuestionIndex + 1} of {module.quiz.questions.length}
          </Text>
        </View>

        <ScrollView style={styles.quizScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctIndex;
              const showResult = showExplanation;

              let optionStyle = styles.optionButton;
              let textStyle = styles.optionText;

              if (showResult) {
                if (isCorrect) {
                  optionStyle = { ...styles.optionButton, ...styles.optionCorrect };
                  textStyle = { ...styles.optionText, ...styles.optionTextCorrect };
                } else if (isSelected && !isCorrect) {
                  optionStyle = { ...styles.optionButton, ...styles.optionWrong };
                  textStyle = { ...styles.optionText, ...styles.optionTextWrong };
                }
              } else if (isSelected) {
                optionStyle = { ...styles.optionButton, ...styles.optionSelected };
              }

              return (
                <Pressable
                  key={index}
                  style={optionStyle}
                  onPress={() => handleAnswer(index)}
                  disabled={showExplanation}
                >
                  <Text style={textStyle}>{option}</Text>
                  {showResult && isCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {showExplanation && (
            <View style={styles.explanationBox}>
              <Ionicons name="information-circle" size={20} color="#60a5fa" />
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {showExplanation && (
          <View style={styles.quizFooter}>
            <Pressable style={styles.nextButton} onPress={nextQuestion}>
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < module.quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderComplete = () => {
    const finalScore = moduleProgress?.quizScore || Math.round((quizScore / module.quiz.questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <View style={styles.completeContainer}>
        <View style={[styles.resultIcon, passed ? styles.resultIconSuccess : styles.resultIconFail]}>
          <Ionicons
            name={passed ? "trophy" : "refresh"}
            size={64}
            color={passed ? "#ffd700" : "#ef4444"}
          />
        </View>

        <Text style={styles.resultTitle}>
          {passed ? 'Congratulations!' : 'Keep Learning!'}
        </Text>

        <Text style={styles.resultScore}>
          You scored {finalScore}%
        </Text>

        <Text style={styles.resultMessage}>
          {passed
            ? `You've mastered "${module.name}"! Your knowledge has been proven.`
            : `You need 70% to pass. Review the lessons and try again!`}
        </Text>

        {passed && (
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <Ionicons name="star" size={24} color="#ffd700" />
              <Text style={styles.rewardItemText}>+{module.xpReward} XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="ribbon" size={24} color="#e94560" />
              <Text style={styles.rewardItemText}>Badge Unlocked!</Text>
            </View>
          </View>
        )}

        <View style={styles.completeActions}>
          {!passed && (
            <Pressable style={styles.retryButton} onPress={startQuiz}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.backButton, passed && styles.backButtonFull]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Modules</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: viewState === 'overview' ? module.name :
                 viewState === 'lesson' ? currentLesson?.title || 'Lesson' :
                 viewState === 'quiz' ? 'Quiz' : 'Results',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (viewState === 'overview') {
                  router.back();
                } else if (viewState === 'complete') {
                  router.back();
                } else {
                  setViewState('overview');
                }
              }}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          ),
        }}
      />

      {viewState === 'overview' && renderOverview()}
      {viewState === 'lesson' && renderLesson()}
      {viewState === 'quiz' && renderQuiz()}
      {viewState === 'complete' && renderComplete()}

      <BadgeUnlocked
        visible={showBadgeModal}
        badgeName={module.name + ' Master'}
        badgeIcon={module.icon}
        xpReward={module.xpReward}
        onClose={() => setShowBadgeModal(false)}
      />
    </SafeAreaView>
  );
}

// Content block type for lesson rendering
interface ContentBlock {
  type: 'heading' | 'paragraph' | 'tip' | 'warning' | 'list' | 'image';
  content?: string;
  items?: string[];
  caption?: string;
}

// Full lesson content for "Your First Wallet" module
function getLessonContent(lessonId: string): ContentBlock[] {
  const content: Record<string, ContentBlock[]> = {
    'wb-1': [
      { type: 'heading', content: 'What is a Crypto Wallet?' },
      { type: 'paragraph', content: 'Think of a crypto wallet like your digital pocket. Just like your physical wallet holds cash and cards, a crypto wallet holds your digital assets - but with a twist!' },
      { type: 'paragraph', content: 'Unlike a regular wallet, your crypto wallet doesn\'t actually "hold" your coins. Instead, it stores the special keys that prove you own those coins on the blockchain.' },
      { type: 'image', caption: 'Wallet Diagram' },
      { type: 'heading', content: 'Public vs Private Keys' },
      { type: 'paragraph', content: 'Your wallet has two important keys:' },
      { type: 'list', items: [
        'Public Key (Address): Like your email address - you share it to receive crypto',
        'Private Key: Like your password - NEVER share this with anyone!'
      ]},
      { type: 'tip', content: 'Your public address is safe to share. Think of it like your home address - people need it to send you mail (or crypto)!' },
      { type: 'heading', content: 'Types of Wallets' },
      { type: 'paragraph', content: 'There are different types of wallets for different needs:' },
      { type: 'list', items: [
        'Hot Wallets: Connected to the internet (apps, browser extensions)',
        'Cold Wallets: Offline storage (hardware devices, paper wallets)',
        'Custodial: Someone else holds your keys (exchanges)',
        'Non-Custodial: You control your own keys (recommended!)'
      ]},
      { type: 'warning', content: 'In CryptoPet, we\'ll use Freighter - a non-custodial wallet for the Stellar blockchain. You\'ll have full control of your keys!' },
      { type: 'heading', content: 'Key Takeaways' },
      { type: 'list', items: [
        'Crypto wallets store keys, not actual coins',
        'Your public address is safe to share',
        'Your private key must stay secret',
        'Non-custodial wallets give you full control'
      ]},
    ],
    'wb-2': [
      { type: 'heading', content: 'The Magic Words: Seed Phrases' },
      { type: 'paragraph', content: 'A seed phrase (also called recovery phrase or mnemonic) is a list of 12 to 24 simple words that serves as the master backup for your wallet.' },
      { type: 'paragraph', content: 'These words might look random, but they\'re actually a human-readable version of a super long number that can generate all your private keys.' },
      { type: 'image', caption: 'Seed Phrase Example' },
      { type: 'tip', content: 'Example seed phrase: "apple banana cherry dog elephant frog grape honey ice jam kite lemon" - yours will be different and unique!' },
      { type: 'heading', content: 'Why Seed Phrases Matter' },
      { type: 'paragraph', content: 'Your seed phrase is incredibly powerful:' },
      { type: 'list', items: [
        'Lost your phone? Recover your wallet with the seed phrase',
        'Want to use a different app? Import with the same phrase',
        'Hardware broke? Restore everything on a new device'
      ]},
      { type: 'warning', content: 'Anyone with your seed phrase has FULL ACCESS to all your crypto. Never store it digitally or share it with anyone!' },
      { type: 'heading', content: 'How to Store Your Seed Phrase Safely' },
      { type: 'list', items: [
        'Write it on paper (or metal for fire/water resistance)',
        'Store in a secure location (safe, safety deposit box)',
        'Consider splitting it between multiple locations',
        'NEVER take a screenshot or save in notes apps',
        'NEVER email it to yourself or anyone'
      ]},
      { type: 'heading', content: 'Common Scams to Avoid' },
      { type: 'paragraph', content: 'Scammers will try everything to get your seed phrase:' },
      { type: 'list', items: [
        'Fake "support" asking for your phrase',
        'Phishing sites that look like real wallets',
        '"Giveaways" requiring you to enter your phrase',
        'Apps or forms asking for "verification"'
      ]},
      { type: 'tip', content: 'Remember: No legitimate service, support team, or company will EVER ask for your seed phrase. Anyone who does is trying to steal from you!' },
    ],
    'wb-3': [
      { type: 'heading', content: 'Security Best Practices' },
      { type: 'paragraph', content: 'Keeping your crypto safe requires good habits. Let\'s learn the essential security practices that will protect your assets.' },
      { type: 'heading', content: 'Rule #1: Verify Everything' },
      { type: 'paragraph', content: 'Always double-check before taking action:' },
      { type: 'list', items: [
        'Verify website URLs before connecting your wallet',
        'Check the address before sending any transaction',
        'Confirm the token contract is legitimate',
        'Read what permissions you\'re granting'
      ]},
      { type: 'image', caption: 'URL Verification' },
      { type: 'warning', content: 'Scammers create fake websites that look identical to real ones. Always check the URL carefully!' },
      { type: 'heading', content: 'Rule #2: Use Strong Authentication' },
      { type: 'list', items: [
        'Enable 2FA (Two-Factor Authentication) everywhere',
        'Use a password manager for unique, strong passwords',
        'Prefer hardware security keys when available',
        'Never reuse passwords across services'
      ]},
      { type: 'heading', content: 'Rule #3: Practice Safe Transactions' },
      { type: 'paragraph', content: 'Before confirming any transaction:' },
      { type: 'list', items: [
        'Send a small test amount first for new addresses',
        'Triple-check the recipient address',
        'Understand what you\'re signing (approvals, etc.)',
        'Be wary of "too good to be true" offers'
      ]},
      { type: 'tip', content: 'When sending to a new address, start with a tiny amount. Once confirmed, send the rest. This small fee could save you from a catastrophic mistake!' },
      { type: 'heading', content: 'Rule #4: Keep Software Updated' },
      { type: 'list', items: [
        'Update your wallet apps regularly',
        'Keep your device\'s OS up to date',
        'Only download from official sources',
        'Be cautious of new/unverified apps'
      ]},
      { type: 'heading', content: 'Red Flags to Watch For' },
      { type: 'list', items: [
        'Unsolicited DMs offering "help" or "opportunities"',
        'Requests to screen share or install software',
        'Pressure to act quickly or miss out',
        'Promises of guaranteed returns',
        'Requests to "verify" or "validate" your wallet'
      ]},
      { type: 'warning', content: 'If something feels wrong, STOP. Take time to research and verify. The crypto space has many scammers targeting newcomers.' },
      { type: 'heading', content: 'Your Security Checklist' },
      { type: 'list', items: [
        'Seed phrase stored safely offline',
        '2FA enabled on all accounts',
        'Using a reputable, non-custodial wallet',
        'Verified URLs before connecting',
        'Never shared private keys or seed phrase'
      ]},
    ],
    // Add content for other modules as needed
    'ft-1': [
      { type: 'heading', content: 'How Blockchain Transactions Work' },
      { type: 'paragraph', content: 'When you send crypto, you\'re not moving actual coins. Instead, you\'re creating a record on the blockchain that says "this amount now belongs to a new address."' },
      { type: 'paragraph', content: 'Think of it like a giant shared spreadsheet that everyone can see. When you make a transaction, a new line is added that everyone agrees is valid.' },
      { type: 'image', caption: 'Transaction Flow' },
      { type: 'heading', content: 'The Life of a Transaction' },
      { type: 'list', items: [
        '1. You sign the transaction with your private key',
        '2. It\'s broadcast to the network',
        '3. Validators check if it\'s valid',
        '4. It\'s added to a block',
        '5. The block is added to the blockchain',
        '6. Transaction complete!'
      ]},
      { type: 'tip', content: 'On Stellar, transactions confirm in just 3-5 seconds! Much faster than Bitcoin or Ethereum.' },
      { type: 'heading', content: 'Transaction Components' },
      { type: 'paragraph', content: 'Every transaction includes:' },
      { type: 'list', items: [
        'Sender address (from)',
        'Recipient address (to)',
        'Amount to send',
        'Transaction fee',
        'Digital signature (proves you authorized it)'
      ]},
      { type: 'warning', content: 'Once a transaction is confirmed, it cannot be reversed! Always double-check addresses and amounts.' },
    ],
    'ft-2': [
      { type: 'heading', content: 'Understanding Addresses' },
      { type: 'paragraph', content: 'A wallet address is like an account number for receiving crypto. On Stellar, addresses start with "G" and are 56 characters long.' },
      { type: 'paragraph', content: 'Example: GABC123...XYZ789' },
      { type: 'image', caption: 'Stellar Address' },
      { type: 'tip', content: 'You can share your address publicly - it\'s designed to be shared! It\'s how people send you crypto.' },
      { type: 'heading', content: 'Transaction Fees on Stellar' },
      { type: 'paragraph', content: 'Every blockchain charges fees to prevent spam and reward validators. Stellar has some of the lowest fees in crypto!' },
      { type: 'list', items: [
        'Base fee: ~0.00001 XLM per operation',
        'That\'s less than $0.001 per transaction!',
        'Fees go to the network, not a company'
      ]},
      { type: 'heading', content: 'Important Tips for Transactions' },
      { type: 'list', items: [
        'Always send a small test amount first',
        'Copy-paste addresses, never type them',
        'Verify the first and last few characters',
        'Make sure you have enough for fees'
      ]},
      { type: 'warning', content: 'Sending to the wrong address means your funds are likely lost forever. There\'s no "undo" button in crypto!' },
    ],
    'di-1': [
      { type: 'heading', content: 'CEX vs DEX: The Key Differences' },
      { type: 'paragraph', content: 'There are two main types of crypto exchanges: Centralized (CEX) and Decentralized (DEX). Understanding the difference is crucial!' },
      { type: 'heading', content: 'Centralized Exchanges (CEX)' },
      { type: 'paragraph', content: 'Examples: Coinbase, Binance, Kraken' },
      { type: 'list', items: [
        'A company controls your funds',
        'You create an account with email/password',
        'Easier for beginners',
        'Can convert to/from fiat currency',
        'Must trust the exchange'
      ]},
      { type: 'heading', content: 'Decentralized Exchanges (DEX)' },
      { type: 'paragraph', content: 'Examples: Soroswap, Uniswap, SushiSwap' },
      { type: 'list', items: [
        'No company controls your funds',
        'Connect directly with your wallet',
        'Trade peer-to-peer via smart contracts',
        'Full control of your assets',
        'No KYC required'
      ]},
      { type: 'tip', content: 'In CryptoPet, you\'ll practice on Soroswap - the main DEX on Stellar. Your keys, your crypto!' },
      { type: 'warning', content: '"Not your keys, not your coins" - If an exchange holds your crypto, they could freeze it, get hacked, or go bankrupt.' },
    ],
    'di-2': [
      { type: 'heading', content: 'How Swaps Work: Liquidity Pools' },
      { type: 'paragraph', content: 'DEXs use a clever mechanism called Automated Market Makers (AMMs) with liquidity pools to enable trading without traditional order books.' },
      { type: 'image', caption: 'Liquidity Pool' },
      { type: 'heading', content: 'What is a Liquidity Pool?' },
      { type: 'paragraph', content: 'A liquidity pool is like a shared pot of two tokens. Anyone can add their tokens to the pool and earn fees when others trade.' },
      { type: 'list', items: [
        'Pools contain pairs of tokens (e.g., XLM/USDC)',
        'Prices are determined by the ratio of tokens',
        'As you trade, the ratio changes',
        'Liquidity providers earn trading fees'
      ]},
      { type: 'heading', content: 'Making a Swap' },
      { type: 'paragraph', content: 'When you swap Token A for Token B:' },
      { type: 'list', items: [
        '1. You send Token A to the pool',
        '2. The pool sends you Token B back',
        '3. A small fee goes to liquidity providers',
        '4. The pool ratio changes slightly'
      ]},
      { type: 'tip', content: 'Larger trades relative to pool size will have more price impact. Check the estimated output before confirming!' },
    ],
    'di-3': [
      { type: 'heading', content: 'Slippage: What You Need to Know' },
      { type: 'paragraph', content: 'Slippage is the difference between the price you expect and the price you actually get. It happens because prices can change between when you submit and when your transaction executes.' },
      { type: 'heading', content: 'Why Does Slippage Happen?' },
      { type: 'list', items: [
        'Other trades happen before yours',
        'Network congestion delays your transaction',
        'Market prices are constantly moving',
        'Large trades move the pool ratio'
      ]},
      { type: 'tip', content: 'Most DEXs let you set a "slippage tolerance" - the maximum price change you\'ll accept. 0.5-1% is common for stable pairs.' },
      { type: 'heading', content: 'Price Impact vs Slippage' },
      { type: 'paragraph', content: 'These are related but different concepts:' },
      { type: 'list', items: [
        'Price Impact: How much YOUR trade moves the price',
        'Slippage: How much the price moves while you wait',
        'Both can cause you to get fewer tokens than expected'
      ]},
      { type: 'warning', content: 'Watch for high price impact on large trades or low-liquidity pools. If it\'s over 3%, consider splitting into smaller trades.' },
      { type: 'heading', content: 'Best Practices for Swapping' },
      { type: 'list', items: [
        'Check the exchange rate before confirming',
        'Set appropriate slippage tolerance',
        'Avoid trading during high volatility',
        'Compare rates across different DEXs',
        'Watch out for low-liquidity pools'
      ]},
    ],
  };

  return content[lessonId] || [
    { type: 'paragraph', content: 'Lesson content is being prepared. Check back soon!' }
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },

  // Module Header
  moduleHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  moduleIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  moduleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  moduleDesc: {
    fontSize: 14,
    color: '#8b8b8b',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressOverview: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarLarge: {
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  progressTextLarge: {
    fontSize: 12,
    color: '#8b8b8b',
    textAlign: 'center',
    marginTop: 8,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  rewardText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '600',
  },

  // Sections
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },

  // Lesson Cards
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberCompleted: {
    backgroundColor: '#4ade80',
  },
  lessonNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  lessonDesc: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 2,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#8b8b8b',
  },

  // Quiz Card
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  quizCardLocked: {
    opacity: 0.6,
  },
  quizIcon: {
    marginRight: 12,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  quizDesc: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 2,
  },
  textLocked: {
    color: '#666',
  },
  passedBadge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passedText: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Lesson View
  lessonContainer: {
    flex: 1,
  },
  lessonScroll: {
    flex: 1,
    padding: 20,
  },
  lessonHeader: {
    marginBottom: 24,
  },
  lessonTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  lessonMetaLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonDurationLarge: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  lessonContent: {
    paddingBottom: 100,
  },
  contentHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  contentParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#d1d1d1',
    marginBottom: 16,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#fbbf24',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#ef4444',
  },
  listContainer: {
    marginVertical: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e94560',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#d1d1d1',
  },
  imageContainer: {
    marginVertical: 20,
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: '#16213e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  lessonFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Quiz View
  quizContainer: {
    flex: 1,
  },
  quizProgress: {
    padding: 20,
    paddingBottom: 10,
  },
  quizProgressBar: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: '#e94560',
  },
  quizProgressText: {
    fontSize: 12,
    color: '#8b8b8b',
    textAlign: 'center',
    marginTop: 8,
  },
  quizScroll: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
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
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  optionTextCorrect: {
    color: '#4ade80',
  },
  optionTextWrong: {
    color: '#ef4444',
  },
  explanationBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#60a5fa',
  },
  quizFooter: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Complete View
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultIconSuccess: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  resultIconFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 16,
    color: '#8b8b8b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 8,
  },
  rewardItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completeActions: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  backButtonFull: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
