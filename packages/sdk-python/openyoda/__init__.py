"""openyoda — Official Python SDK for the Yoda.ai API.

Scaffold. Will provide a minimal client::

    from openyoda import Yoda
    yoda = Yoda(api_key="...")
    response = yoda.ask("should I take the offer?")
"""

__version__ = "0.0.1"


class Yoda:
    def __init__(self, api_key: str, base_url: str = "https://yoda.ai") -> None:
        self.api_key = api_key
        self.base_url = base_url

    def ask(self, _question: str) -> dict:
        raise NotImplementedError("Not implemented yet — scaffold.")
