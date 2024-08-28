import os
import json
from langchain_ollama import ChatOllama
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

system_prompt = """
You are a helpful assistant that turns a .json file into a human-written-like prompt for a music generation AI model.
The prompt should be as short as possible and very straightforward.
It should be a description of the desired sound, not a petition, so avoid verbs.
Ignore song title and artist unless they're extremely popular.
State the exact tempo (BPM), key, and mode.
State the pedal effects if any, but just by name and description of how they sound.
Reply only with the prompt, no extra text or quotes.
"""

llm = ChatOllama(
    model="llama3.1",
    temperature=0.5
)

def main():
    print("Setting up LLM...")
    f = open(f'few_shot_examples.json', encoding='utf-8')
    examples = json.load(f)['examples']

    example_prompt = ChatPromptTemplate.from_messages(
        [
            ("human", "{input}"),
            ("ai", "{output}"),
        ]
    )

    few_shot_prompt = FewShotChatMessagePromptTemplate(
        example_prompt=example_prompt,
        examples=examples,
    )

    final_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            few_shot_prompt,
            ("human", "{input}"),
        ]
    )

    chain = final_prompt | llm

    print("Generating prompts...")
    jsons = [f for f in os.listdir('renders') if f.endswith('.json')]
    for json_file in jsons:
        f = open(f'renders/{json_file}', encoding='utf-8')
        data = json.load(f)
        ai_msg = chain.invoke({"input": str(data)})
        print(json_file, ai_msg.content)
        data['prompt'] = ai_msg.content
        with open(f'renders/{json_file}', 'w') as json_file:
            json.dump(data, json_file)

if __name__ == "__main__":
    main()
