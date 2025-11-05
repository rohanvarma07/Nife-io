import type { MockResponder, MockResponseType, StreamingConfig } from '../types/chat';

const DEFAULT_CONFIG: StreamingConfig = {
  delay: 50, // milliseconds between chunks
  chunkSize: 3, // characters per chunk
};

export class MockStreamingResponder implements MockResponder {
  private config: StreamingConfig;

  constructor(config: Partial<StreamingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async *respond(message: string, type: MockResponseType = 'llm-style'): AsyncIterableIterator<string> {
    const response = this.generateResponse(message, type);
    
    for (let i = 0; i < response.length; i += this.config.chunkSize) {
      const chunk = response.slice(i, i + this.config.chunkSize);
      yield chunk;
      
      // Add delay between chunks
      if (i + this.config.chunkSize < response.length) {
        await new Promise(resolve => setTimeout(resolve, this.config.delay));
      }
    }
  }

  private generateResponse(message: string, type: MockResponseType): string {
    switch (type) {
      case 'echo':
        return `You said: "${message}"`;
      
      case 'reverse':
        return `Here's your message reversed: "${message.split('').reverse().join('')}"`;
      
      case 'llm-style':
      default:
        return this.generateLLMStyleResponse(message);
    }
  }

  private generateLLMStyleResponse(message: string): string {
    const responses = [
      `That's an interesting question about "${message}". Let me break this down for you:

## Key Points

1. **Understanding the Context**: Your message touches on several important aspects that we should consider.

2. **Analysis**: Based on what you've shared, here are some thoughts:
   - This is a common question that many people have
   - There are multiple perspectives to consider
   - The answer depends on various factors

## Code Example

Here's a simple example in JavaScript:

\`\`\`javascript
function processMessage(input) {
  return {
    original: input,
    processed: true,
    timestamp: new Date().toISOString()
  };
}

console.log(processMessage("${message}"));
\`\`\`

## Summary

To summarize, your question about "${message}" is multifaceted. The best approach would be to:

- Consider the specific context
- Evaluate different options
- Choose the most appropriate solution

Is there anything specific about this topic you'd like me to elaborate on?`,

      `I understand you're asking about "${message}". This is actually a fascinating topic! 

Let me share some insights:

### Background
This subject has been discussed extensively in various contexts. The key thing to understand is that there are multiple valid approaches.

### Practical Considerations
When dealing with "${message}", you'll want to consider:

- **Performance**: How efficient is your approach?
- **Maintainability**: Can others understand and modify your solution?
- **Scalability**: Will it work as requirements grow?

### Example Implementation

\`\`\`python
def handle_query(query):
    """
    Process a user query and return appropriate response
    """
    processed_query = query.strip().lower()
    
    if "help" in processed_query:
        return generate_help_response()
    else:
        return generate_standard_response(query)

# Usage
result = handle_query("${message}")
print(f"Response: {result}")
\`\`\`

Would you like me to dive deeper into any particular aspect of this topic?`,

      `Great question about "${message}"! This reminds me of a similar situation I helped with recently.

## Quick Answer
The short answer is that it depends on your specific use case and requirements.

## Detailed Explanation

### Method 1: Direct Approach
The most straightforward way would be:
- Start with the basics
- Build incrementally
- Test each component

### Method 2: Framework-Based Solution
Alternatively, you could use an existing framework:

\`\`\`bash
# Install dependencies
npm install your-framework

# Initialize project
npx create-app my-project

# Start development
npm run dev
\`\`\`

### Best Practices
1. **Documentation**: Always document your approach
2. **Testing**: Write tests for critical functionality
3. **Error Handling**: Anticipate and handle edge cases

## Real-World Example

I recently worked on a project where we faced a similar challenge with "${message}". Here's what we learned:

- Start simple and iterate
- Don't over-engineer the solution
- Get feedback early and often

What specific aspect of this would you like to explore further?`
    ];

    // Return a random response
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Utility function to create a responder instance
export const createMockResponder = (config?: Partial<StreamingConfig>): MockResponder => {
  return new MockStreamingResponder(config);
};

// Export a default instance
export const defaultResponder = createMockResponder();
