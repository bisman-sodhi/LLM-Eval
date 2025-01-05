# LLM Evaluation Tool

## Live Demo
[View Project](https://llm-eval-pied.vercel.app)

## Overview
A comprehensive tool for evaluating chatbot performance across different Large Language Models (LLMs) on various task types.

## Models Evaluated
- Llama-3.3-70b-versatile
- Gemma2-9b-it
- Mixtral-8x7b-32768

## Evaluation Methodology
The evaluation uses LLM-as-a-judge approach with Gemini 1.5 Flash-8B as the evaluator. Responses are scored based on task type:

### Task Types & Scoring Weights

#### Factual Tasks
- Accuracy (40%)
- Relevance (30%)
- Conciseness (30%)

#### Creative Tasks
- Creativity (40%)
- Depth (30%)
- Helpfulness (30%)

#### Analytical Tasks
- Depth (40%)
- Accuracy (30%)
- Relevance (30%)

### Evaluation Criteria
- **Closeness**: Alignment with expected answer
- **Helpfulness**: Effectiveness in meeting user needs
- **Relevance**: Direct answer relevance
- **Accuracy**: Factual correctness
- **Depth**: Comprehensiveness
- **Creativity**: Value addition within constraints
- **Conciseness**: Efficient communication

## Data Processing
Results are stored in a database and visualized through dynamic graphs showing:
- Task-specific performance scores
- Model response times
- Comparative strengths across task types

