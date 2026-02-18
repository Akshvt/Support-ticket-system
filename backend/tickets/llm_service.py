"""
LLM integration service for auto-classifying support tickets.

Uses OpenAI-compatible API to suggest category and priority for a ticket
based on its description. Handles failures gracefully.
"""
import json
import logging
from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

# The classification prompt — included in codebase for review
CLASSIFICATION_PROMPT = """You are a support ticket classifier. Given a support ticket description, you must classify it into exactly one category and one priority level.

Categories (pick exactly one):
- billing: Payment issues, invoices, refunds, subscription changes, pricing questions
- technical: Bugs, errors, crashes, performance issues, feature not working, API problems
- account: Login issues, password resets, profile changes, account deletion, permissions
- general: General questions, feedback, feature requests, documentation, anything else

Priority levels (pick exactly one):
- low: Minor issues, general questions, feature requests, no urgency
- medium: Moderate impact, workarounds available, not time-sensitive
- high: Significant impact, blocking work, needs attention soon
- critical: Service down, data loss, security issues, affects many users

Respond ONLY with a valid JSON object in this exact format:
{"suggested_category": "<category>", "suggested_priority": "<priority>"}

Do not include any other text, explanation, or markdown. Just the JSON object."""


def classify_ticket(description: str) -> dict:
    """
    Call the LLM to classify a ticket description.

    Returns a dict with 'suggested_category' and 'suggested_priority'.
    Returns None if the LLM is unreachable or returns garbage.
    """
    api_key = settings.LLM_API_KEY
    if not api_key:
        logger.warning("LLM_API_KEY not configured — skipping classification")
        return None

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": CLASSIFICATION_PROMPT},
                {"role": "user", "content": f"Ticket description:\n{description}"},
            ],
            temperature=0.1,
            max_tokens=100,
        )

        content = response.choices[0].message.content.strip()
        result = json.loads(content)

        # Validate the response
        valid_categories = ['billing', 'technical', 'account', 'general']
        valid_priorities = ['low', 'medium', 'high', 'critical']

        category = result.get('suggested_category', '').lower()
        priority = result.get('suggested_priority', '').lower()

        if category not in valid_categories or priority not in valid_priorities:
            logger.warning(f"LLM returned invalid classification: {result}")
            return None

        return {
            'suggested_category': category,
            'suggested_priority': priority,
        }

    except json.JSONDecodeError as e:
        logger.error(f"LLM returned non-JSON response: {e}")
        return None
    except Exception as e:
        logger.error(f"LLM classification failed: {e}")
        return None
