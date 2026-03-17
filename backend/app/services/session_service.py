"""In-memory session store for MedVix pipeline state.

Each browser session gets a UUID-keyed ``SessionState`` that persists
across the 7-step pipeline.  Expired sessions are reaped lazily via
``cleanup_expired_sessions``.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from app.models.session import SessionState
from app.utils.constants import SESSION_MAX_AGE_MINUTES

# ---------------------------------------------------------------------------
# Module-level session store
# ---------------------------------------------------------------------------
_sessions: Dict[str, SessionState] = {}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def create_session(domain_id: str) -> SessionState:
    """Create a new session for the given clinical domain and return it."""
    session = SessionState(
        session_id=str(uuid.uuid4()),
        domain_id=domain_id,
        created_at=datetime.now(timezone.utc),
    )
    _sessions[session.session_id] = session
    return session


def get_session(session_id: str) -> Optional[SessionState]:
    """Return the session with the given ID, or ``None`` if not found."""
    return _sessions.get(session_id)


def update_session(session_id: str, **kwargs: Any) -> None:
    """Update one or more attributes on an existing session.

    Raises ``KeyError`` if the session does not exist.
    """
    session = _sessions.get(session_id)
    if session is None:
        raise KeyError(f"Session '{session_id}' not found")
    for key, value in kwargs.items():
        if not hasattr(session, key):
            raise AttributeError(
                f"SessionState has no attribute '{key}'"
            )
        setattr(session, key, value)


def delete_session(session_id: str) -> None:
    """Remove a session from the store.  Silently ignores missing IDs."""
    _sessions.pop(session_id, None)


def cleanup_expired_sessions(
    max_age_minutes: int = SESSION_MAX_AGE_MINUTES,
) -> int:
    """Delete sessions older than *max_age_minutes*.

    Returns the number of sessions removed.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=max_age_minutes)
    expired_ids = [
        sid
        for sid, state in _sessions.items()
        if state.created_at < cutoff
    ]
    for sid in expired_ids:
        del _sessions[sid]
    return len(expired_ids)
