import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import env from '../config/env';

class OpenAIService {
  private openAI: ChatOpenAI;

  constructor() {
    this.openAI = new ChatOpenAI({
      modelName: "gpt-4o",
      openAIApiKey: env.openAIKey,
      temperature: 0.7,
    });
  }

  async categorizeEmail(content: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromTemplate(
      "Categorize the following email content as 'Interested', 'Not Interested', or 'More Information' based on the sender's intent:\n\n{content}\n\nCategory:"
    );
    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(this.openAI).pipe(outputParser);
    return chain.invoke({ content });
  }

  async generateResponse(content: string, category: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromTemplate(
      "Generate an appropriate response for an email with the following content and category:\n\nContent: {content}\nCategory: {category}\n\nIf the category is 'Interested', suggest a demo call with a specific time. If 'More Information', provide additional details about our product/service. If 'Not Interested', politely acknowledge their response.\n\nResponse:"
    );
    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(this.openAI).pipe(outputParser);
    return chain.invoke({ content, category });
  }
}

export default new OpenAIService();