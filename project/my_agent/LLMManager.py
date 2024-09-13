from langchain.llms import OpenAI

class LLMManager:
    def __init__(self):
        self.llm = OpenAI()
    
    def generate_response(self, prompt):
        return self.llm(prompt)