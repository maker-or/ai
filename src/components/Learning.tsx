import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import { CheckCircle2, Circle, CircleDotDashed } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useState, useEffect, useMemo, useCallback } from "react";
import React from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, useParams } from "react-router-dom";
import { Id } from "../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

const zschema = z.object({
  userPrompt: z
    .string()
    .trim()
    .min(2, { message: "Input cannot be empty or just spaces" }),
});

type FormValues = z.infer<typeof zschema>;

interface Slide {
  name: string;
  title: string;
  content: string;
  type: "markdown" | "code" | "video" | "quiz" | "table" | "flashcard" | "test";
  subTitles: string;
  picture: string;
  links: string[];
  youtubeSearchText: string;
  codeLanguage: string;
  codeContent: string;
  tables: string;
  bulletPoints: string[];
  audioScript: string;
  testQuestions: string | any[];
  flashcardData: any[];
}

// Interactive Content Block Component
// Test Component
const TestComponent: React.FC<{
  testQuestions: string | any[];
}> = ({ testQuestions }) => {
  // Debug logging
  console.log("TestComponent - testQuestions type:", typeof testQuestions);
  console.log("TestComponent - testQuestions content:", testQuestions);
  console.log(
    "TestComponent - testQuestions is array:",
    Array.isArray(testQuestions),
  );

  // Additional detailed debugging
  if (Array.isArray(testQuestions)) {
    console.log("TestComponent - Array length:", testQuestions.length);
    testQuestions.forEach((q, i) => {
      console.log(`Question ${i}:`, {
        question: q.question,
        options: q.options,
        answer: q.answer,
        answerType: typeof q.answer,
        fullObject: q,
      });
    });
  }

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  // Helper function to normalize answers for comparison
  const normalizeAnswer = (answer: string) => {
    if (!answer) return "";
    return answer.toString().trim().toLowerCase();
  };

  // Flexible answer comparison to handle different question formats
  const isAnswerCorrect = (
    userAnswer: string, // The full text of the selected option, e.g., "B. Insertion Sort"
    correctAnswer: any, // The correct answer key, e.g., "B"
    options: string[], // The array of full option texts
  ) => {
    if (!userAnswer || correctAnswer === undefined || correctAnswer === null)
      return false;

    const normalizedUserAnswer = userAnswer.toString().trim();
    const normalizedCorrectAnswer = correctAnswer.toString().trim();

    // Case 1: The answer is the full text of the option (e.g., "Insertion Sort")
    if (
      normalizedUserAnswer.toLowerCase() ===
      normalizedCorrectAnswer.toLowerCase()
    ) {
      return true;
    }

    // Case 2: The answer is a letter key (e.g., "B") and options are formatted like "B. Insertion Sort"
    if (
      normalizedCorrectAnswer.length === 1 &&
      /^[A-Z]$/i.test(normalizedCorrectAnswer)
    ) {
      // Check if the user's selected option string starts with the correct letter and a dot.
      const expectedPrefix = `${normalizedCorrectAnswer.toUpperCase()}.`;
      if (normalizedUserAnswer.toUpperCase().startsWith(expectedPrefix)) {
        return true;
      }
    }

    // Case 3: The answer is an index (e.g., 1 for the second option)
    if (!isNaN(Number(normalizedCorrectAnswer))) {
      const correctIndex = Number(normalizedCorrectAnswer);
      if (
        options[correctIndex] &&
        options[correctIndex] === normalizedUserAnswer
      ) {
        return true;
      }
    }

    return false;
  };

  // Helper function to get displayable correct answer
  const getCorrectAnswerDisplay = (correctAnswer: any, options: string[]) => {
    if (correctAnswer === undefined || correctAnswer === null)
      return "Not specified";

    const normalizedCorrectAnswer = String(correctAnswer).trim();

    // Case 1: The answer is a letter key (e.g., "B")
    if (
      normalizedCorrectAnswer.length === 1 &&
      /^[A-Z]$/i.test(normalizedCorrectAnswer)
    ) {
      const expectedPrefix = `${normalizedCorrectAnswer.toUpperCase()}.`;
      const foundOption = options.find((opt) =>
        opt.trim().toUpperCase().startsWith(expectedPrefix),
      );
      if (foundOption) {
        return foundOption;
      }
    }

    // Case 2: The answer is an index
    if (!isNaN(Number(normalizedCorrectAnswer))) {
      const correctIndex = Number(normalizedCorrectAnswer);
      if (options[correctIndex]) {
        return options[correctIndex];
      }
    }

    // Fallback: return the answer as is (might be the full text or just the key if no match found)
    return String(correctAnswer);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    try {
      // Handle both string and array formats
      let questions: any[] = [];
      if (typeof testQuestions === "string") {
        questions = JSON.parse(testQuestions);
      } else if (Array.isArray(testQuestions)) {
        questions = testQuestions;
      } else {
        throw new Error("Invalid testQuestions format");
      }

      questions.forEach((question: any, index: number) => {
        const userAnswer = selectedAnswers[index];
        const correctAnswer = question.answer;
        const options = question.options || [];

        // Debug logging
        console.log(`Question ${index + 1}:`);
        console.log(`User answer: "${userAnswer}"`);
        console.log(`Correct answer: "${correctAnswer}"`);
        console.log(`Answer type: ${typeof correctAnswer}`);
        console.log(`Options:`, options);
        console.log(`Normalized user: "${normalizeAnswer(userAnswer)}"`);
        console.log(`Normalized correct: "${normalizeAnswer(correctAnswer)}"`);

        if (isAnswerCorrect(userAnswer, correctAnswer, options)) {
          correctAnswers++;
          console.log(`✓ Correct!`);
        } else {
          console.log(`✗ Wrong`);
        }
      });
      setScore(correctAnswers);
      setShowResults(true);
    } catch (error) {
      console.error("Error calculating score:", error);
      setScore(0);
      setShowResults(true);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  let questions: any[] = [];
  let currentQ: any = null;
  let isLastQuestion = false;
  let allAnswered = false;

  try {
    // Handle both string and array formats
    if (typeof testQuestions === "string") {
      questions = JSON.parse(testQuestions);
    } else if (Array.isArray(testQuestions)) {
      questions = testQuestions;
    } else {
      throw new Error("Invalid testQuestions format");
    }

    console.log("Parsed questions:", questions);
    console.log("Current question index:", currentQuestion);

    currentQ = questions[currentQuestion];
    console.log("Current question object:", currentQ);

    isLastQuestion = currentQuestion === questions.length - 1;
    allAnswered = questions.every(
      (_: any, index: number) => selectedAnswers[index],
    );

    console.log("Selected answers:", selectedAnswers);
  } catch (error) {
    console.error("Error parsing test questions:", error);
    let errorMessage = "Error loading test questions. Please try again.";

    if (typeof testQuestions === "string") {
      errorMessage = "Invalid JSON format in test questions.";
    } else if (!Array.isArray(testQuestions)) {
      errorMessage = "Test questions must be an array or JSON string.";
    } else if (testQuestions.length === 0) {
      errorMessage = "No test questions found.";
    }

    return (
      <div className="text-center p-8 text-red-400">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-lg font-semibold mb-2">Test Error</p>
        <p className="text-sm">{errorMessage}</p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-red-300 hover:text-red-200">
            Debug Info
          </summary>
          <pre className="mt-2 text-xs bg-red-900/20 p-2 rounded">
            Type: {typeof testQuestions}
            {"\n"}
            Is Array: {Array.isArray(testQuestions)}
            {"\n"}
            Content: {JSON.stringify(testQuestions, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="rounded-lg p-6 border ">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-[#f7eee3] mb-2">
            Test Results
          </h3>
          <div className="text-4xl font-bold mb-2">
            <span
              className={
                score >= questions.length * 0.7
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {score}/{questions.length}
            </span>
          </div>
          <p className="text-[#f7eee3]">
            {score >= questions.length * 0.7
              ? "Great job! 🎉"
              : "Keep practicing! 💪"}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((question: any, index: number) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = isAnswerCorrect(
              userAnswer,
              question.answer,
              question.options || [],
            );
            return (
              <div
                key={index}
                className="bg-[#0c0c0c]/50 rounded-lg p-4 border-l-4 border-l-gray-500"
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-[#f7eee3] font-medium mb-2">
                      {question.question}
                    </p>
                    <div className="text-sm">
                      <p className="text-[#f7eee3]">
                        Your answer:{" "}
                        <span
                          className={
                            isCorrect ? "text-green-400" : "text-red-400"
                          }
                        >
                          {userAnswer}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-[#f7eee3]">
                          Correct answer:{" "}
                          <span className="text-green-400">
                            {getCorrectAnswerDisplay(
                              question.answer,
                              question.options || [],
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={resetTest}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ArrowClockwiseIcon className="w-4 h-4 mr-2" />
          Retake Test
        </Button>
      </div>
    );
  }

  return (
    <div className=" rounded-lg p-6  ">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* <h3 className="text-xl font-bold text-[#f7eee3]">
            Test Your Knowledge
          </h3> */}
          <span className="text-sm text-[#f7eee3]/60">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        {/* <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div> */}
      </div>

      <div className="mb-6">
        <h4 className=" text-[#f7eee3] mb-4 text-3xl font-light tracking-tight">
          {currentQ.question}
        </h4>
        <div className="flex flex-col space-y-3">
          {currentQ.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, option)}
              className={`w-1/3 text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedAnswers[currentQuestion] === option
                  ? "border-[#FF5E00] border-2 bg-[#683D24] text-[#FF5E00]"
                  : " bg-[#f7eee3] text-[#0c0c0c] "
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedAnswers[currentQuestion] === option
                      ? "border-[#FF5E00] bg-[#FF5E00]"
                      : "border-slate-500"
                  }`}
                />
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end  p-3  items-end w-full gap-3">
        {currentQuestion > 0 && (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            variant="outline"
            className="flex-1 text-[#f7eee3] border-[#f7eee3]  bg-[#0c0c0c]"
          >
            <ArrowLeftIcon />
          </Button>
        )}
        {isLastQuestion ? (
          <Button
            onClick={calculateScore}
            disabled={!allAnswered}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            Submit Test
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            disabled={!selectedAnswers[currentQuestion]}
            className="flex-1  bg-[#D96F30]  text-[#f7eee3] disabled:opacity-50"
          >
            <ArrowRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
};

// Flashcard Component
const FlashcardComponent: React.FC<{
  flashcardsContent: string;
}> = ({ flashcardsContent }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    try {
      const flashcards = JSON.parse(flashcardsContent);
      if (currentCard < flashcards.length - 1) {
        setCurrentCard((prev) => prev + 1);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error("Error parsing flashcards:", error);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped((prev) => !prev);
  };

  let flashcards: any[] = [];
  let currentFlashcard: any = null;

  try {
    flashcards = JSON.parse(flashcardsContent);
    console.log("Parsed flashcards:", flashcards); // Add this line
    currentFlashcard = flashcards[currentCard];
  } catch (error) {
    console.error("Error parsing flashcards:", error);
    return (
      <div className="text-center p-8 text-red-400">
        Error loading flashcards. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-4 [perspective:1000px]">
        <div
          className={`relative h-80 cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={flipCard}
        >
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
            <div className="w-full h-full bg-[#F7EEE3] rounded-xl border border-slate-700 flex items-center justify-center p-8">
              <p className="text-2xl text-center text-[#0c0c0c] font-medium">
                {currentFlashcard.question}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rotate-y-180">
            <div className="w-full h-full bg-[#F7EEE3] rounded-xl border border-slate-700 flex items-center justify-center p-8">
              <p className="text-xl text-center text-[#0c0c0c]">
                {currentFlashcard.answer}
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-[#f7eee3]/60 text-sm mt-4">
          Click card to flip
        </p>
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button
          onClick={prevCard}
          disabled={currentCard === 0}
          variant="ghost"
          className="disabled:opacity-30 text-[#f7eee3] hover:bg-slate-800"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Previous
        </Button>
        <span className="text-sm text-[#f7eee3]/60">
          {currentCard + 1} / {flashcards.length}
        </span>
        <Button
          onClick={nextCard}
          disabled={currentCard === flashcards.length - 1}
          variant="ghost"
          className="disabled:opacity-30 text-[#f7eee3] hover:bg-slate-800"
        >
          Next
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Enhanced Content Block Component
const ContentBlock: React.FC<{
  slide: Slide;
  index: number;
  total: number;
}> = ({ slide, index, total }) => {
  // Combine all content into a single markdown string
  const combinedContent = useMemo(() => {
    // Ensure content is a string
    let content =
      typeof slide.content === "string"
        ? slide.content
        : String(slide.content || "");

    // Validate content is not empty
    if (!content || content.trim() === "") {
      content = slide.title || "No content available";
    }

    // Add tables to content if they exist and not already included
    if (slide.tables && typeof slide.tables === "string") {
      const hasTableInContent =
        content.includes("|") ||
        content.includes("<table") ||
        content.toLowerCase().includes("table");

      if (!hasTableInContent) {
        content += "\n\n" + slide.tables;
      }
    }

    // Add code block if it exists and is not already in content, and is not a placeholder
    if (slide.codeContent && 
        slide.codeContent.trim() !== "" && 
        !slide.codeContent.includes("// Code example") &&
        !slide.codeContent.includes("// Code example will be generated") &&
        !content.includes("```")) {
      const codeContent =
        typeof slide.codeContent === "string"
          ? slide.codeContent
          : String(slide.codeContent);
      const codeBlock = `\n\n\`\`\`${slide.codeLanguage || "text"}\n${codeContent}\n\`\`\``;
      content += codeBlock;
    }

    // Final validation - ensure we return a string
    return typeof content === "string" ? content : String(content);
  }, [
    slide.content,
    slide.tables,
    slide.codeContent,
    slide.codeLanguage,
    slide.title,
  ]);

  // Content sanitization helper
  const sanitizeContent = (content: any): string => {
    if (content === null || content === undefined) return "";
    if (typeof content === "string") return content;
    if (typeof content === "number") return String(content);
    if (typeof content === "boolean") return String(content);

    // Handle React elements
    if (React.isValidElement(content)) {
      if (
        content.props &&
        typeof content.props === "object" &&
        content.props !== null &&
        "children" in content.props
      ) {
        return sanitizeContent(content.props.children);
      }
      return "";
    }

    // Handle arrays of content
    if (Array.isArray(content)) {
      return content
        .map((item) => sanitizeContent(item))
        .filter(Boolean)
        .join("");
    }

    // Handle objects with children property
    if (content && typeof content === "object" && content !== null) {
      if (
        "props" in content &&
        content.props &&
        typeof content.props === "object" &&
        content.props !== null &&
        "children" in content.props
      ) {
        return sanitizeContent(content.props.children);
      }
      if ("children" in content) {
        return sanitizeContent(content.children);
      }
      // If it's a plain object, try to stringify it safely
      try {
        const str = String(content);
        return str === "[object Object]" ? "" : str;
      } catch {
        return "";
      }
    }

    // Fallback
    const str = String(content);
    return str === "[object Object]" ? "" : str;
  };

  // Enhanced markdown components for proper syntax highlighting
  const markdownComponents: Components = {
    code({ node, className, children, ...props }) {
      const codeContent = sanitizeContent(children).replace(/\n$/, "");
      const isInlineCode =
        !className &&
        node?.tagName === "code" &&
        (node as any)?.parent?.tagName !== "pre" &&
        !codeContent.includes("\n");

      if (isInlineCode) {
        return (
          <code
            className="bg-gray-700/50 text-red-300 px-1.5 py-1 rounded-md text-sm font-mono"
            {...props}
          >
            {codeContent}
          </code>
        );
      }

      // For block code, rehype-highlight will add the `className` for the language.
      // The `pre` component below will wrap it.
      return (
        <code className={className} {...props}>
          {codeContent}
        </code>
      );
    },

    pre({ children }) {
      // rehype-highlight wraps code blocks in a <pre> tag.
      // We apply our container styling here.
      return (
        <pre className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto border border-gray-700/50 my-4">
          {children}
        </pre>
      );
    },

    // Enhanced table rendering with better structure
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6 rounded-lg border border-gray-700 shadow-lg">
          <table className="min-w-full bg-theme-bg-secondary table-auto">
            {children}
          </table>
        </div>
      );
    },

    thead({ children }) {
      return <thead className="bg-[#FD833C]">{children}</thead>;
    },

    tbody({ children }) {
      return <tbody className="divide-y divide-gray-700">{children}</tbody>;
    },

    th({ children }) {
      const content = sanitizeContent(children);
      return (
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-100 uppercase tracking-wider border-r border-gray-600 last:border-r-0">
          {content}
        </th>
      );
    },

    td({ children }) {
      const content = sanitizeContent(children);
      return (
        <td className="px-6 py-4 text-sm text-[#f7eee3] border-r border-gray-700/50 last:border-r-0">
          {content}
        </td>
      );
    },

    tr({ children }) {
      return (
        <tr className="hover:bg-[#0c0c0c]/40 transition-colors duration-200 border-b border-gray-700/50 last:border-b-0">
          {children}
        </tr>
      );
    },

    // Enhanced image rendering
    img({ src, alt }) {
      if (!src) return null;
      return (
        <div className="my-4 text-center">
          <img
            src={src}
            alt={alt || ""}
            className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              // Show a placeholder or the alt text
              const placeholder = document.createElement("div");
              placeholder.className =
                "bg-gray-800 text-gray-400 p-4 rounded-lg text-center";
              placeholder.textContent = alt || "Image could not be loaded";
              target.parentNode?.replaceChild(placeholder, target);
            }}
          />
        </div>
      );
    },

    // Enhanced link rendering
    a({ href, children }) {
      if (!href) return <span>{sanitizeContent(children)}</span>;

      const isExternal = href.startsWith("http") || href.startsWith("//");
      const isVideo =
        href.includes("youtube.com") ||
        href.includes("youtu.be") ||
        href.includes("vimeo.com");

      const content = sanitizeContent(children);

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={`inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline transition-colors ${
            isVideo ? "font-medium" : ""
          }`}
        >
          {isVideo && <LinkIcon className="w-3 h-3" />}
          {content}
        </a>
      );
    },

    // Enhanced blockquote
    blockquote({ children }) {
      const content = sanitizeContent(children);
      return (
        <blockquote className="border-l-4 border-blue-400 pl-4 my-4 italic text-[#f7eee3]/80">
          {content}
        </blockquote>
      );
    },

    // Enhanced lists
    ul({ children }) {
      return (
        <ul className="list-disc list-inside space-y-1 my-4 text-[#f7eee3]">
          {children}
        </ul>
      );
    },

    ol({ children }) {
      return (
        <ol className="list-decimal list-inside space-y-1 my-4 text-[#f7eee3]">
          {children}
        </ol>
      );
    },

    li({ children }) {
      const content = sanitizeContent(children);
      return <li className="text-[#f7eee3]">{content}</li>;
    },

    // Enhanced paragraphs
    p({ children }) {
      const content = sanitizeContent(children);
      return (
        <p className="text-[#f7eee3] text-3xl font-light tracking-tight ">
          {content}
        </p>
      );
    },

    // Enhanced headings
    h1({ children }) {
      const content = sanitizeContent(children);
      return (
        <h1 className="text-3xl font-bold text-[#f7eee3] mb-4">{content}</h1>
      );
    },

    h2({ children }) {
      const content = sanitizeContent(children);
      return (
        <h2 className="text-2xl font-semibold text-[#f7eee3] mb-3">
          {content}
        </h2>
      );
    },

    h3({ children }) {
      const content = sanitizeContent(children);
      return (
        <h3 className="text-xl font-medium text-[#f7eee3] mb-2">{content}</h3>
      );
    },

    h4({ children }) {
      const content = sanitizeContent(children);
      return (
        <h4 className="text-lg font-medium text-[#f7eee3] mb-2">{content}</h4>
      );
    },

    // Enhanced text elements
    strong({ children }) {
      const content = sanitizeContent(children);
      return <strong className=" text-[#f7eee3]">{content}</strong>;
    },

    em({ children }) {
      const content = sanitizeContent(children);
      return <em className="italic text-[#f7eee3]">{content}</em>;
    },
  };

  // Determine if we should use full-screen layout for tables, tests, or flashcards
  const hasTableContent =
    slide.tables &&
    typeof slide.tables === "string" &&
    slide.tables.trim() !== "";
  const isTableSlide = hasTableContent;
  
  // Check if slide has test questions (regardless of type)
  const hasTestQuestions = slide.testQuestions &&
    ((typeof slide.testQuestions === "string" &&
      slide.testQuestions.trim() !== "") ||
      (Array.isArray(slide.testQuestions) && slide.testQuestions.length > 0));
  
  const isTestSlide = hasTestQuestions;
  
  const isFlashcardSlide =
    slide.flashcardData &&
    Array.isArray(slide.flashcardData) &&
    slide.flashcardData.length > 0;

  // Debug logging for slide detection
  console.log(`ContentBlock - Slide "${slide.title}":`, {
    type: slide.type,
    hasTestQuestions,
    isTestSlide,
    testQuestions: slide.testQuestions,
    testQuestionsType: typeof slide.testQuestions,
    testQuestionsLength: Array.isArray(slide.testQuestions) ? slide.testQuestions.length : 'N/A',
    isFlashcardSlide,
    flashcardData: slide.flashcardData,
    isTableSlide
  });

  // Extract visual content (images, code, diagrams)
  // Check if codeContent has actual content (not empty or placeholder)
  const hasActualCodeContent = slide.codeContent && 
    slide.codeContent.trim() !== "" && 
    !slide.codeContent.includes("// Code example") &&
    !slide.codeContent.includes("// Code example will be generated");
  
  const hasVisualContent =
    slide.picture || hasActualCodeContent || (combinedContent.includes("```") && !combinedContent.includes("// Code example"));
  
  // Debug logging for slide data
  console.log("ContentBlock - slide.picture:", slide.picture);
  console.log("ContentBlock - hasActualCodeContent:", hasActualCodeContent);
  console.log("ContentBlock - hasVisualContent:", hasVisualContent);

  // Extract text content for right panel
  const getTextContent = () => {
    let content =
      typeof slide.content === "string"
        ? slide.content
        : String(slide.content || "");

    // Remove code blocks from text content for right panel
    content = content.replace(/```[\s\S]*?```/g, "");

    // If no meaningful text content, return the title
    if (!content || content.trim() === "") {
      content = slide.title || "No content available";
    }

    return content;
  };

  const textContent = getTextContent();

  // Full-screen layout for tests
  if (isTestSlide) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Centered Header */}
        <div className="text-center mb-8 px-6">
          <div className="mb-4">
            <span className="text-sm text-[#f7eee3] font-medium">
              {index + 1} of {total}
            </span>
          </div>
          <h1 className="text-5xl font-serif italic text-[#f7eee3] mb-4 tracking-tight">
            {slide.title}
          </h1>
          {slide.subTitles && (
            <p className="text-xl text-[#f7eee3] max-w-3xl mx-auto">
              {slide.subTitles}
            </p>
          )}
        </div>

        <div className="flex-1 px-8">
          {/* Test Component */}
          {hasTestQuestions ? (
            <TestComponent testQuestions={slide.testQuestions} />
          ) : (
            <div className="text-center p-8 text-[#f7eee3]/60">
              <div className="text-4xl mb-4">📝</div>
              <p>No test questions available for this slide.</p>
            </div>
          )}

          {/* Additional content below test if any */}
          {textContent && textContent !== slide.title && (
            <div className="mt-6 prose prose-lg prose-invert max-w-none text-[#f7eee3]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={markdownComponents}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-screen layout for flashcards
  if (isFlashcardSlide) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Centered Header */}
        <div className="text-center mb-8 px-6">
          <div className="mb-4">
            <span className="text-sm text-[#f7eee3] font-medium">
              {index + 1} of {total}
            </span>
          </div>
          <h1 className="text-5xl font-serif italic text-[#f7eee3] mb-4 tracking-tight">
            {slide.title}
          </h1>
          {slide.subTitles && (
            <p className="text-xl text-[#f7eee3]/80 max-w-3xl mx-auto">
              {slide.subTitles}
            </p>
          )}
        </div>

        <div className="flex-1 px-8">
          {/* Flashcard Component */}
          <FlashcardComponent
            flashcardsContent={JSON.stringify(slide.flashcardData)}
          />

          {/* Additional content below flashcards if any */}
          {textContent && textContent !== slide.title && (
            <div className="mt-6 prose prose-lg prose-invert max-w-none text-[#f7eee3]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={markdownComponents}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full-screen layout for tables
  if (isTableSlide) {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Centered Header */}
        <div className="text-center mb-8 px-6">
          <div className="mb-4">
            <span className="text-sm text-[#f7eee3] font-medium">
              {index + 1} of {total}
            </span>
          </div>
          <h1 className="text-5xl font-serif italic   text-[#f7eee3] mb-4 tracking-tight">
            {slide.title}
          </h1>
          {slide.subTitles && (
            <p className="text-xl text-[#f7eee3]/80 max-w-3xl mx-auto">
              {slide.subTitles}
            </p>
          )}
        </div>

        <div className="flex-1 px-8">
          {/* Full-width table */}
          <div className="mb-6">
            <div className="prose prose-lg prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {slide.tables}
              </ReactMarkdown>
            </div>
          </div>

          {/* Additional content below table if any */}
          {textContent && textContent !== slide.title && (
            <div className="prose prose-lg prose-invert max-w-none text-[#f7eee3]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={markdownComponents}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Two-panel layout for regular content
  return (
    <div className="w-full h-full flex flex-col">
      {/* Centered Header */}
      <div className="text-center mb-8 px-6">
        <div className="mb-4">
          <span className="text-sm text-[#f7eee3] font-medium">
            {index + 1} of {total}
          </span>
        </div>
        <h1 className="text-5xl font-serif italic  text-[#f7eee3] mb-4 tracking-tight">
          {slide.title}
        </h1>
        {/* {slide.subTitles && (
          <p className="text-xl text-[#f7eee3] max-w-3xl mx-auto">
            {slide.subTitles}
          </p>
        )} */}
      </div>

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Text Content */}
        <div
          className={`${hasVisualContent ? "w-1/2" : "w-full"} p-8 overflow-y-auto`}
        >
          <div className="prose prose-lg prose-invert max-w-none text-[#f7eee3]">
            {/* Main text content */}
            {textContent && textContent !== slide.title && (
              <div className="mb-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                  components={{
                    ...markdownComponents,
                    // Don't render code blocks in left panel
                    code: ({ children, className }) => {
                      const childrenText = Array.isArray(children)
                        ? children
                            .map((child) =>
                              typeof child === "string" ? child : "",
                            )
                            .join("")
                        : typeof children === "string"
                          ? children
                          : typeof children === "number"
                            ? String(children)
                            : "";
                      const isInlineCode =
                        !className && !childrenText.includes("\n");
                      if (isInlineCode) {
                        return (
                          <code className="bg-[#0c0c0c] border-4 border-[#f7eee3] text-[#f7eee3] z-2 py-1 rounded text-sm ">
                            {childrenText}
                          </code>
                        );
                      }
                      return null; // Skip code blocks
                    },
                    pre: () => null, // Skip pre blocks
                  }}
                >
                  {textContent}
                </ReactMarkdown>
              </div>
            )}

            {/* Bullet Points */}
            {slide.bulletPoints && slide.bulletPoints.length > 0 && (
              <div className="mb-6">
                <div className="space-y-3">
                  {slide.bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4   ">
                      <div className="w-2 h-2 bg-[#CBF8FE] rounded-full mt-3 flex-shrink-0" />
                      <span className="text-[#f7eee3] leading-relaxed text-3xl font-light tracking-tight">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Visual Content */}
        {hasVisualContent && (
          <div className="w-1/2 p-8 border-l border-[#f7eee3] overflow-y-auto">
            <div className="h-full flex flex-col justify-start">
              {/* Picture */}
              {slide.picture && (
                <div className="mb-6">
                  <img
                    src={
                      slide.picture.startsWith("http")
                        ? slide.picture
                        : `https://${slide.picture}`
                    }
                    alt={slide.title}
                    className="w-full max-w-full mx-auto rounded-lg shadow-lg object-contain max-h-[60vh]"
                    onLoad={() => {
                      console.log("Image loaded successfully:", slide.picture);
                    }}
                    onError={(e) => {
                      console.error("Image failed to load:", slide.picture);
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Code Block */}
              {hasActualCodeContent && (
                <div className="mb-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={markdownComponents}
                  >
                    {`\`\`\`${slide.codeLanguage || ""}\n${slide.codeContent}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              )}

              {/* Code from markdown content */}
              {!hasActualCodeContent && combinedContent.includes("```") && !combinedContent.includes("// Code example") && (
                <div className="mb-6">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                      components={{
                        ...markdownComponents,
                        // Only render code blocks, ignore other elements
                        p: () => null,
                        h1: () => null,
                        h2: () => null,
                        h3: () => null,
                        h4: () => null,
                        ul: () => null,
                        ol: () => null,
                        li: () => null,
                        blockquote: () => null,
                        a: () => null,
                        strong: () => null,
                        em: () => null,
                      }}
                    >
                      {combinedContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Sequence Component with Agent Plan Style
const LoadingSequence: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSteps] = useState<string[]>(["1", "2", "3"]);

  const learningSteps = [
    {
      id: "1",
      title: "Research & Discovery",
      description: "Gathering comprehensive information about your topic",
      subtasks: [
        {
          id: "1.1",
          title: "Fetching the syllabus",
          description: "Building a structured learning pathway",
        },
        {
          id: "1.2",
          title: "Fetching information from the web",
          description: "Searching latest resources and articles",
        },
        {
          id: "1.3",
          title: "Fetching information from knowledge search",
          description: "Accessing curated knowledge databases",
        },
      ],
    },
    {
      id: "2",
      title: "Content Analysis",
      description: "Processing and structuring the gathered information",
      subtasks: [
        {
          id: "2.1",
          title: "Analysing the information",
          description: "Extracting key concepts and relationships",
        },
        {
          id: "2.2",
          title: "Summarizing the information",
          description: "Creating digestible content blocks",
        },
      ],
    },
    {
      id: "3",
      title: "Interactive Learning Creation",
      description: "Building engaging learning materials",
      subtasks: [
        {
          id: "3.1",
          title: "Creating flash cards",
          description: "Designing memory reinforcement tools",
        },
        {
          id: "3.2",
          title: "Creating test questions",
          description: "Generating assessment materials",
        },
        {
          id: "3.3",
          title: "Creating the lecture content",
          description: "Assembling comprehensive learning slides",
        },
      ],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < learningSteps.length * 3 - 1) {
          return prev + 1;
        }
        return prev; // Stay at the last step
      });
    }, 3000); // 3 seconds per step

    return () => clearInterval(timer);
  }, [learningSteps.length]);

  // Calculate which tasks/subtasks should be active/completed
  const getStepStatus = (stepIndex: number, subtaskIndex?: number) => {
    const totalSubtasks = learningSteps
      .slice(0, stepIndex)
      .reduce((acc, step) => acc + step.subtasks.length, 0);
    const currentSubtaskGlobal =
      subtaskIndex !== undefined ? totalSubtasks + subtaskIndex : totalSubtasks;

    if (subtaskIndex !== undefined) {
      if (currentSubtaskGlobal < currentStep) return "completed";
      if (currentSubtaskGlobal === currentStep) return "in-progress";
      return "pending";
    } else {
      const stepStart = totalSubtasks;
      const stepEnd =
        totalSubtasks + learningSteps[stepIndex].subtasks.length - 1;

      if (currentStep > stepEnd) return "completed";
      if (currentStep >= stepStart && currentStep <= stepEnd)
        return "in-progress";
      return "pending";
    }
  };

  return (
    <main className="bg-[#0c0c0c] h-[100svh] w-[100svw] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-[#f7eee3] mb-4">
            Creating your learning experience
          </h1>
          <p className="text-[#f7eee3]/60 text-sm">
            Please wait while we craft your personalized learning journey
          </p>
        </div>

        <div className="bg-[#0c0c0c] border border-[#f7eee3]/20 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <ul className="space-y-1">
              {learningSteps.map((step, stepIndex) => {
                const stepStatus = getStepStatus(stepIndex);
                const isExpanded = expandedSteps.includes(step.id);
                const isCompleted = stepStatus === "completed";

                return (
                  <li
                    key={step.id}
                    className={`${stepIndex !== 0 ? "mt-1 pt-2" : ""}`}
                  >
                    {/* Task row */}
                    <div className="group flex items-center px-3 py-1.5 rounded-md hover:bg-[#f7eee3]/5 transition-colors">
                      <div className="mr-2 flex-shrink-0">
                        <div className="transition-all duration-300">
                          {stepStatus === "completed" ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-green-400" />
                          ) : stepStatus === "in-progress" ? (
                            <CircleDotDashed className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
                          ) : (
                            <Circle className="text-[#f7eee3]/60 h-4.5 w-4.5" />
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-grow items-center justify-between">
                        <div className="mr-2 flex-1">
                          <span
                            className={`${isCompleted ? "text-[#f7eee3]/50 line-through" : "text-[#f7eee3]"} font-medium transition-all duration-300`}
                          >
                            {step.title}
                          </span>
                          <p
                            className={`text-sm ${isCompleted ? "text-[#f7eee3]/30" : "text-[#f7eee3]/60"} transition-all duration-300`}
                          >
                            {step.description}
                          </p>
                        </div>

                        <span
                          className={`rounded px-1.5 py-0.5 text-xs transition-all duration-300 ${
                            stepStatus === "completed"
                              ? "bg-green-400/20 text-green-400 border border-green-400/30"
                              : stepStatus === "in-progress"
                                ? "bg-blue-400/20 text-blue-400 border border-blue-400/30"
                                : "bg-[#f7eee3]/10 text-[#f7eee3]/60 border border-[#f7eee3]/20"
                          }`}
                        >
                          {stepStatus}
                        </span>
                      </div>
                    </div>

                    {/* Subtasks */}
                    {isExpanded && (
                      <div className="relative overflow-hidden transition-all duration-300">
                        <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-[#f7eee3]/30" />
                        <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                          {step.subtasks.map((subtask, subtaskIndex) => {
                            const subtaskStatus = getStepStatus(
                              stepIndex,
                              subtaskIndex,
                            );

                            return (
                              <li
                                key={subtask.id}
                                className="group flex flex-col py-0.5 pl-6"
                              >
                                <div className="flex flex-1 items-center rounded-md p-1 hover:bg-[#f7eee3]/3 transition-colors">
                                  <div className="mr-2 flex-shrink-0">
                                    <div className="transition-all duration-300">
                                      {subtaskStatus === "completed" ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                      ) : subtaskStatus === "in-progress" ? (
                                        <CircleDotDashed className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                                      ) : (
                                        <Circle className="text-[#f7eee3]/60 h-3.5 w-3.5" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <span
                                      className={`text-sm transition-all duration-300 ${subtaskStatus === "completed" ? "text-[#f7eee3]/50 line-through" : subtaskStatus === "in-progress" ? "text-[#f7eee3] animate-pulse" : "text-[#f7eee3]"}`}
                                    >
                                      {subtask.title}
                                    </span>
                                    <p
                                      className={`text-xs transition-all duration-300 ${subtaskStatus === "completed" ? "text-[#f7eee3]/30" : "text-[#f7eee3]/50"}`}
                                    >
                                      {subtask.description}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

// Navigation Component
const SlideNavigation: React.FC<{
  currentIndex: number;
  totalSlides: number;
  currentSlide: Slide;
  onPrevious: () => void;
  onNext: () => void;
}> = ({ currentIndex, totalSlides, currentSlide, onPrevious, onNext }) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-auto">
      <div className="bg-[#1F1F1F] p-2 rounded-full shadow-2xl flex items-center gap-2">
        {/* Links Section */}
        {currentSlide.links && currentSlide.links.length > 0 ? (
          <>
            {currentSlide.links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#262729] hover:bg-[#1A324A] text-white text-sm rounded-full transition-all duration-200 font-medium"
              >
                Link {index + 1}
              </a>
            ))}
          </>
        ) : currentSlide.youtubeSearchText ? (
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
              currentSlide.youtubeSearchText,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600/80 hover:bg-red-500/80 text-white text-sm rounded-full transition-all duration-200 font-medium"
          >
            YouTube
          </a>
        ) : null}

        {/* Navigation Buttons */}
        <div className="flex items-center">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-full bg-[#121719] hover:bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all duration-200 border border-transparent"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === totalSlides - 1}
            className="p-3 rounded-full bg-[#121719] hover:bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all duration-200 border border-transparent"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Learning = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [appstate, setAppstate] = useState<"start" | "loading" | "viewing">(
    "start",
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const createChat = useMutation(api.chats.createChat);
  const addMessage = useMutation(api.messages.addMessage);
  const learn = useAction(api.test.agent);

  // Form for creating new learning content
  const form = useForm({
    defaultValues: {
      userPrompt: "",
    } as FormValues,
    onSubmit: async ({ value }) => {
      console.log("the values are:", value);
      form.reset();
      setAppstate("loading");

      try {
        const newChatId = await createChat({
          title: value.userPrompt.slice(0, 50),
          model: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
        });

        const messageId = await addMessage({
          chatId: newChatId,
          content: value.userPrompt,
          role: "user",
        });

        await learn({
          chatId: newChatId,
          messages: value.userPrompt,
          parentMessageId: messageId,
        });

        void navigate(`/learning/${newChatId}`);
      } catch (error) {
        console.error("Error creating chat:", error);
        setAppstate("start");
      }
    },
    validators: {
      onSubmit: zschema,
    },
  });

  // Queries for viewing mode
  const messages = useQuery(
    api.messages.getMessages,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip",
  );

  // Parse slides from messages
  const slides = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const assistantMessage = messages.find((msg) => msg.role === "assistant");
    if (!assistantMessage || !assistantMessage.content) return [];

    try {
      const parsedData = JSON.parse(assistantMessage.content) as {
        slides: any[]; // Loosen type to handle malformed data
      };

      if (!Array.isArray(parsedData.slides)) return [];

      // TEMP FIX: Transform the slide data to fix the nested `code` object bug.
      // The AI is returning `code: { content: '...', language: '...' }`
      // but the frontend expects `codeContent: '...'` and `codeLanguage: '...'`.
      return parsedData.slides.map((slide) => {
        // Ensure all required fields are present with defaults
        const transformedSlide = {
          name: slide.name || "slide 1",
          title: slide.title || "Learning Module",
          content: slide.content || "",
          type: slide.type || "markdown",
          subTitles: slide.subTitles || "",
          picture: slide.picture || "",
          links: slide.links || [],
          youtubeSearchText: slide.youtubeSearchText || "",
          codeLanguage: slide.codeLanguage || "",
          codeContent: slide.codeContent || "",
          tables: slide.tables || "",
          bulletPoints: slide.bulletPoints || [],
          audioScript: slide.audioScript || "",
          testQuestions: slide.testQuestions || [],
          flashcardData: slide.flashcardData || [],
        };

        // Handle nested code object if present
        if (slide.code && typeof slide.code.content !== "undefined") {
          transformedSlide.codeContent = slide.code.content;
          transformedSlide.codeLanguage = slide.code.language || "";
        }

        return transformedSlide;
      });
    } catch (error) {
      console.error("Error parsing and transforming slides:", error);
      return [];
    }
  }, [messages]);

  // Debug: log the transformed slides
  useEffect(() => {
    if (slides.length > 0) {
      console.log("Transformed slides:", slides);
      slides.forEach((slide, index) => {
        console.log(`Slide ${index + 1}:`, {
          title: slide.title,
          type: slide.type,
          picture: slide.picture,
          pictureExists: !!slide.picture,
          pictureLength: slide.picture?.length || 0,
          hasVisualContent: !!(slide.picture || slide.codeContent || slide.tables),
          testQuestions: slide.testQuestions,
          hasTestQuestions: !!(slide.testQuestions && 
            ((typeof slide.testQuestions === "string" && slide.testQuestions.trim() !== "") ||
             (Array.isArray(slide.testQuestions) && slide.testQuestions.length > 0))),
          flashcardData: slide.flashcardData,
          hasFlashcards: !!(slide.flashcardData && Array.isArray(slide.flashcardData) && slide.flashcardData.length > 0),
        });
      });
    }
  }, [slides]);

  // Set viewing mode when we have a chatId and slides
  useEffect(() => {
    if (chatId && slides.length > 0) {
      setAppstate("viewing");
    }
  }, [chatId, slides]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("Key pressed:", e.key, "App state:", appstate); // Debug log
      if (appstate === "viewing") {
        if (e.key === "ArrowLeft") {
          console.log("Going to previous slide"); // Debug log
          handlePrevious();
        }
        if (e.key === "ArrowRight") {
          console.log("Going to next slide"); // Debug log
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appstate, slides.length, handlePrevious, handleNext]);

  // Viewing mode - show interactive content blocks
  if (appstate === "viewing" && slides.length > 0) {
    return (
      <main className="bg-[#0c0c0c] min-h-[100svh] w-[100svw] py-4 px-4">
        <div className="w-full h-full">
          <ContentBlock
            slide={slides[currentSlideIndex]}
            index={currentSlideIndex}
            total={slides.length}
          />

          <SlideNavigation
            currentIndex={currentSlideIndex}
            totalSlides={slides.length}
            currentSlide={slides[currentSlideIndex]}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </main>
    );
  }

  // Loading state
  if (appstate === "loading") {
    return <LoadingSequence />;
  }

  // Creation mode - original form
  return (
    <main className="bg-[#0c0c0c] h-[100svh] w-[100svw] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif italic text-[5em] text-[#f7eee3] mb-8">
              Learning
            </h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
            className="relative"
          >
            <div className="relative border border-[#f7eee3]/20 rounded-lg p-4 focus-within:border-[#f7eee3]/40 transition-colors">
              <form.Field name="userPrompt">
                {({ state, handleBlur, handleChange }) => (
                  <Textarea
                    placeholder="What would you like to learn about?"
                    className="bg-transparent border-none resize-none text-[#f7eee3] placeholder:text-[#f7eee3]/40 text-lg min-h-[120px] w-full focus:outline-none"
                    value={state.value}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void form.handleSubmit();
                      }
                    }}
                  />
                )}
              </form.Field>

              <div className="flex items-center justify-between mt-4">
                <span className="text-[#f7eee3]/40 text-xs">
                  Press Enter to start learning
                </span>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="bg-[#f7eee3] hover:bg-[#f7eee3]/90 text-[#0c0c0c] px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating..." : "Start Learning"}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Learning;
