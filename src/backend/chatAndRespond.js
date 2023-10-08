const readline = require('readline');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  ChatPromptTemplate
} = require('langchain/prompts');

const { ConversationChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');

require('dotenv').config();

// Create an interface for reading from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getUserInput() {
  return new Promise((resolve) => {
    rl.question('Enter your message: ', (answer) => {
      resolve(answer);
    });
  });
}

async function chatAndRespond() {
  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      'You are a great friend who is good at listening. Your friend is a bit sad, perhaps depressed. You need to ask them questions to make them feel better. This is their message'
    ),
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{user_message}')
  ]);

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPEN_AI_API,
    temperature: 0.9,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token) {
          process.stdout.write(token);
        }
      }
    ]
  });

  const chain = new ConversationChain({
    memory: new BufferMemory({
      returnmessages: true,
      memoryKey: 'history'
    }),
    prompt: chatPrompt,
    llm: model
  });

  // Get user input
  const userMessage = await getUserInput();

  // Call the chain with user input
  const res = await chain.call({
    user_message: userMessage
  });

  console.log(res);

  // Close the readline interface
  rl.close();
}

// Run the conversation
module.exports = chatAndRespond;
