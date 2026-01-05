# Testing Reference

## Running Tests

```bash
# All tests
python -m pytest server/tests/test_gratitude_notes.py

# Verbose output
python -m pytest server/tests/test_gratitude_notes.py -v

# Single test
python -m pytest server/tests/test_gratitude_notes.py::test_name
```

## Mocking Pattern

Tests mock DB functions directly without `conftest.py`:

```python
# Add lambdas to sys.path
LAMBDA_DIR = Path(__file__).resolve().parents[1] / "lambdas"
sys.path.insert(0, str(LAMBDA_DIR))

# Mock in tests
post_note.db.create_or_update_note = _mock_create_or_update_note()
```

This approach allows direct module-level mocking without pytest fixtures.
