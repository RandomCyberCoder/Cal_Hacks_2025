from uagents import Agent, Context
import logging

logging.basicConfig(level=logging.INFO)
class MyAgent(Agent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def setup(self, context: Context):
        